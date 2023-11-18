'use client';
import { useState, useEffect } from 'react';
import { Modal, Progress, ModalContent, ModalBody, ModalHeader, Button } from '@nextui-org/react';

import Profundidad from '@/components/profundidad';
import Grupales from '@/components/grupales';

import supabaseClient from '@/lib/supabase';

interface ModalInteractiveProps {
    isOpen: boolean;
    projectName: string;
    onModalData: (data: any) => void;
    tipoAnalisis: 'grupales' | 'profundidad';
}

interface Respuesta {
    name: string;
    respuesta: string;
    archivo: string;
}

interface RespuestasRecibidas {
    respuestas: {
        [key: string]: Respuesta[];
    };
    nombreArchivo: string;
}

export default function ModalInteractive({ isOpen, projectName, onModalData, tipoAnalisis }: ModalInteractiveProps) {
    const [visible, setVisible] = useState(isOpen);
    const [progress, setProgress] = useState(0);
    const [archivoActual, setArchivoActual] = useState("");
    let respuestas: { [key: string]: { name: string, respuesta: string, archivo: string }[] } = {};
    const [hasError, setHasError] = useState(false);

    const [modalText, setModalText] = useState("Analizando Información");
    const [showButton, setShowButton] = useState(false);

    const agregarRespuesta = (pregunta: string, nuevasRespuestas: { name: string, respuesta: string, archivo: string }[]) => {
        if (!respuestas[pregunta]) {
            respuestas[pregunta] = [];
        }
    
        nuevasRespuestas.forEach((nuevaRespuesta) => {
            respuestas[pregunta].push({ name: nuevaRespuesta.name, respuesta: nuevaRespuesta.respuesta, archivo: nuevaRespuesta.archivo });
        });
    };

    useEffect(() => {
        if (isOpen && projectName) {
            setVisible(true);
            setProgress(10);
            setArchivoActual("Analizando Información");
            setModalText(`Analizando ${archivoActual}`);

            const fetchProjectNames = async () => {
                const { data, error } = await supabaseClient
                    .storage
                    .from(projectName)
                    .list()

                if (error || !data || data.length === 0) {
                    console.error('Error al obtener nombres de proyectos:', error);
                    setModalText('No hay archivos en el proyecto');
                    setShowButton(true);
                    setHasError(true);
                    onModalData('No hay archivos en el proyecto')
                } else {
                    console.log(data);
                    const filteredData = data?.filter(archivo => archivo.name !== 'questions');
                    const totalFiles = filteredData?.length || 0;

                    if (totalFiles === 0) {
                        setModalText('No hay preguntas para leer');
                        setShowButton(true);
                        setHasError(true);
                        onModalData('No hay preguntas en el proyecto')
                    } else if (filteredData) {
                        for (let index = 0; index < filteredData.length; index++) {
                            const archivo = filteredData[index];
                            setArchivoActual(`Analizando ${archivo.name}`);
                            setModalText(`Analizando ${archivo.name}`);

                            const funcionAnalisis = tipoAnalisis === 'grupales' ? Grupales : (tipoAnalisis === 'profundidad' ? Profundidad : undefined);

                            if (funcionAnalisis) {
                                await funcionAnalisis(projectName, archivo.name).then((respuestasRecibidas: RespuestasRecibidas) => {
                                    for (let pregunta in respuestasRecibidas.respuestas) {
                                        agregarRespuesta(pregunta, respuestasRecibidas.respuestas[pregunta]);
                                    }
                                });
                            } else {
                                console.error('funcionAnalisis es undefined');
                                setModalText('Error: funcionAnalisis es undefined');
                                setShowButton(true);
                                setHasError(true);
                            }
                        }
                        onModalData(respuestas);
                        setModalText('Análisis completo')
                        setShowButton(true)
                        setVisible(false);
                    }
                }
            };

            fetchProjectNames();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, projectName, tipoAnalisis]);

    return (
        <Modal
            isOpen={visible}
            onOpenChange={() => {
                setVisible(false);
                setHasError(false);
                setShowButton(false);
                setProgress(0);
            }}
            className="w-full h-auto max-w-[464px] max-h-[600px] rounded-lg"
            isDismissable={false}
            aria-label="Nombre de tu modal"
        >
            <ModalContent aria-label="Nombre de tu modal" className="w-full h-auto">

                <ModalHeader aria-label="Nombre de tu modal">
                    <h2 className='text-[#1F1F21]'>{modalText}</h2>
                </ModalHeader >

                <ModalBody className="w-full h-full flex flex-col items-center justify-center gap-6 p-3" aria-label="Nombre de tu modal">
                    {!hasError && progress < 100 ? <Progress aria-label="Nombre de tu modal" value={progress} color="success" /> : null}
                    {showButton ? <Button className='w-full rounded text-sm font-semibold bg-[#1F1F21] text-white' onClick={() => setVisible(false)}>{hasError ? 'Volver' : 'Visualizar Tabla'}</Button> : null}
                </ModalBody>


            </ModalContent>
        </Modal>
    );
}