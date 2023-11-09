import { useState, useEffect } from 'react';
import { Modal, Progress, ModalContent, ModalBody, ModalHeader } from '@nextui-org/react';

import Profundidad from '@/components/profundidad';

import supabaseClient from '@/lib/supabase';

interface ModalInteractiveProps {
    isOpen: boolean;
    projectName: string;
    onModalData: (data: any) => void;
}

export default function ModalInteractive({ isOpen, projectName, onModalData }: ModalInteractiveProps) {
    const [visible, setVisible] = useState(isOpen);
    const [progress, setProgress] = useState(0);
    const [archivoActual, setArchivoActual] = useState("");
    let respuestas: { [key: string]: { name: string, respuesta: string }[] } = {};

    const agregarRespuesta = (pregunta: string, nuevasRespuestas: { name: string, respuesta: string }[]) => {
        if (!respuestas[pregunta]) {
            respuestas[pregunta] = [];
        }

        nuevasRespuestas.forEach((nuevaRespuesta) => {
            respuestas[pregunta].push(nuevaRespuesta);
        });
    };

    useEffect(() => {
        if (isOpen && projectName) {
            setVisible(true);
            setProgress(10);
            setArchivoActual("Analizando Información");

            const fetchProjectNames = async () => {
                const { data, error } = await supabaseClient
                    .storage
                    .from(projectName)
                    .list()

                if (error) {
                    console.error('Error al obtener nombres de proyectos:', error);
                } else {
                    console.log(data);
                    const filteredData = data?.filter(archivo => archivo.name !== 'questions');
                    const totalFiles = filteredData?.length || 0;

                    if (filteredData) {
                        for (let index = 0; index < filteredData.length; index++) {
                            const archivo = filteredData[index];
                            setArchivoActual(`Analizando ${archivo.name}`);
                            await Profundidad(projectName, archivo.name).then(respuestasRecibidas => {
                                for (let pregunta in respuestasRecibidas) {
                                    agregarRespuesta(pregunta, respuestasRecibidas[pregunta]);
                                }
                                setProgress((index + 1) / totalFiles * 100);
                            });
                        }
                        onModalData(respuestas);
                    }
                }
            };

            fetchProjectNames();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, projectName]);

    return (
        <Modal
            isOpen={visible}
            onOpenChange={() => setVisible(false)}
            className="w-full h-auto max-w-[464px] max-h-[600px] rounded-lg"
            isDismissable={false}
            aria-label="Nombre de tu modal"
        >
            <ModalContent aria-label="Nombre de tu modal" className="w-full h-auto">

                <ModalHeader aria-label="Nombre de tu modal">
                    <h2>{archivoActual}</h2>
                </ModalHeader >

                <ModalBody className="w-full h-full flex flex-col items-center justify-center gap-6 p-6" aria-label="Nombre de tu modal">
                    {progress < 100 ? <Progress aria-label="Nombre de tu modal" value={progress} color="success" /> : null}
                </ModalBody>


            </ModalContent>
        </Modal>
    );
}