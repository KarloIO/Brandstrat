'use client'
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Avatar, Divider, Tooltip, Select, SelectItem, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { sendMessageToBot } from "@/pages/api/bot";
import { useRouter, usePathname } from "next/navigation";
import CheckSession from '@/lib/checkSession'
import supabaseClient from '@/lib/supabase'
// import supabaseClient from '@/lib/supabase';
import '@/styles/chat.css'

import arrowR from '@/public/icons/arrow-right.svg'
import link from '@/public/icons/link.svg';
import wand from '@/public/icons/wand.svg';
import wWand from '@/public/icons/white-wand.svg';
import forward from '@/public/icons/forward.svg';
import file from '@/public/icons/file.svg';
import deleteIcon from '@/public/icons/delete.svg'


type Message = {
    sender: string;
    content: string;
    timestamp: string;
    avatar: string;
    data: string;
};

type SourceDataItem = {
    pageContent: string;
    metadata: {
        loc: {
            lines: {
                from: number;
                to: number;
            };
        };
    };
};

type UrlType = {
    publicUrl: string
}

type ChatModuleProps = {
    hover: boolean;
    setHover: React.Dispatch<React.SetStateAction<boolean>>;
    handleSendClick: (value: string) => void;
    inputValue: string;
    handleMessageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

interface BotResponse {
    question: string;
    users: { [key: string]: string; };
    answer: string;
}

interface Project {
    name: string;
    description: string;
}

const ChatModule: React.FC<ChatModuleProps> = ({ hover, setHover, handleSendClick, inputValue, handleMessageChange }) => {

    return (
        <div className="w-[640px] h-auto rounded-lg bg-white p-3 flex justify-between border-x-1 border-t-1 border-b-2 border-[#E0E0E0]">
            <div className="w-4/5 h-full max-h-5 flex flex-row gap-2">
                <Image src={wand} alt="wand" width={20} height={20} />
                <input type="text" value={inputValue} placeholder="Haz una consulta..." onChange={handleMessageChange} className="bg-white w-full border-white focus:outline-none text-md font-medium text-[#8A90A7] placeholder:text-[#8A90A7]" />
            </div>
            <div className="w-auto h-full max-h-5 flex flex-row gap-1 items-center cursor-pointer ease-in-out duration-200" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => handleSendClick(inputValue)}>
                <Image src={forward} alt="wand" width={20} height={20} className={hover ? "fill-current text-[#EF7A17] filter brightness-0 saturate-100% hue-rotate(360deg) invert(46%) sepia(86%) saturate(1146%) hue-rotate(356deg) brightness(101%) contrast(87%) duration-200" : "duration-200 fill-current"} />
                <span className={hover ? "font-semibold text-sm text-black duration-200" : "font-semibold text-sm text-[#8A90A7] duration-200"}>Enviar</span>
            </div>
        </div>
    );
};

export default function Chat() {
    const router = useRouter();
    const pathname = usePathname();
    const [hover, setHover] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [timestamps, setTimestamps] = useState<{ sender: string; content: string; timestamp: string; }[]>([]);
    const [urlData, setUrl] = useState<UrlType>({ publicUrl: "" });
    const [data, setData] = useState("");
    const [message, setMessage] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isTableFinished, setTableFinished] = useState(false)
    const [tooltipContent, setTooltipContent] = useState('Copiar URL');
    const [projects, setProjects] = useState<Project[]>([])
    const [filesOpen, setFilesOpen] = useState(false)

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSendClick = async (value: string) => {
        setInputValue(value);
        setMessage(value);
        setIsModalVisible(true);
        await handleSendMessage();
    };

    const handleSendMessage = async () => {
        setInputValue('')
        const newMessage: Message = {
            sender: "user",
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: '',
            data: data
        };

        const updatedMessages: Message[] = [...messages, newMessage];
        setMessages(updatedMessages);

        setMessages(updatedMessages);
        setMessage("");
        setTimestamps([...timestamps, newMessage]);

        const botResponses = await sendMessageToBot([inputValue]);
        console.log(botResponses[0]);
        // console.log(botResponse)


        const autoResponse: Message = {
            sender: "bot",
            content: '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: '',
            data: data
        };

        setTimeout(() => {
            setMessages([...updatedMessages, autoResponse]);
        }, 1000);
    };

    useEffect(() => {
        if (messagesContainerRef.current) {
            const lastMessage = messagesContainerRef.current.lastElementChild;
            lastMessage?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setTooltipContent('URL copiado exitosamente');
        setTimeout(() => setTooltipContent('Copiar URL'), 2000);
    }

    useEffect(() => {
        fetchProjects()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchProjects = async () => {
        const projectId = pathname?.split('/')[2];
        const { data, error } = await supabaseClient
            .from('proyectos')
            .select('*')
            .eq('name', projectId);
        console.log(data)

        if (error) {
            console.error('Error al obtener proyectos:', error)
        } else {
            setProjects(data)
        }
    }

    useEffect(() => {
        const checkUserSession = async () => {
            const session = await CheckSession();
            if (session.session == null) {
                console.log("El usuario no está logueado");
                router.push('/auth')
            } else {
                console.log("El usuario está logueado");
            }
        };
        checkUserSession();
    }, [router]);

    // const fetchData = async () => {
    //     try {
    //         const response = await fetch("api/testing", {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ url: urlData.publicUrl })
    //         });
    //         if (response.ok) {
    //             const data = await response.json();
    //             setData(data.data[0].content)
    //         } else {
    //             console.error("No se pudo obtener el contenido del archivo.");
    //         }
    //     } catch (error) {
    //         console.error("Error al leer el archivo:", error);
    //     }
    // };

    // useEffect(() => {
    //     if (urlData.publicUrl !== "") {
    //         fetchData();
    //     }
    // }, [urlData]);

    const handleFilesOpen = () => {
        setFilesOpen(!filesOpen)
    }

    return (

        <div className="w-screen h-auto flex flex-col items-center justify-start px-32">

            <div className="w-screen h-14 bg-white flex flex-row items-center justify-between px-8 py-3">

                <div className="w-auto h-auto max-h-8 flex flex-row px-3 py-2 gap-1 items-center justify-start border-2 border-[#EFF0F3] rounded-lg hover:border-[#EF7A17] cursor-pointer" onClick={() => router.push('/')}>

                    <Image src={arrowR} alt='arrow' width={16} height={16} className="rotate-180" />

                    <span className='w-fit font-semibold text-[#EF7A17] text-sm'>Regresar</span>

                </div>

                <div className="w-auto h-auto max-h-8 flex flex-row gap-4 items-center justify-start">

                    <Tooltip content={tooltipContent} className="rounded-md" delay={0} closeDelay={0} showArrow>

                        <div className="w-auto h-auto max-h-8 flex flex-row px-2 py-2 gap-1 items-center justify-start border-2 border-[#EFF0F3] bg-white rounded-lg hover:border-[#EF7A17] cursor-pointer" onClick={handleCopyLink}>

                            <Image src={link} alt='arrow' width={16} height={16} className="rotate-180" />

                        </div>

                    </Tooltip>

                    <div className="w-auto h-auto max-h-8 flex flex-row px-3 py-2 gap-1 items-center justify-start rounded-lg bg-[#EF7A17] cursor-pointer" onClick={() => router.push('/')}>

                        <span className='w-fit font-semibold text-white text-sm'>Comenzar</span>

                    </div>

                </div>

            </div>

            <div className="w-full max-w-7xl h-full pt-10 pb-10 flex flex-col items-center justify-start gap-5">

                <ChatModule hover={hover} setHover={setHover} handleSendClick={handleSendClick} inputValue={inputValue} handleMessageChange={handleMessageChange} />

                {isModalVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-start pt-[94px] gap-4">
                        <ChatModule hover={hover} setHover={setHover} handleSendClick={handleSendClick} inputValue={inputValue} handleMessageChange={handleMessageChange} />

                        <div className="messages max-h-6/12 flex flex-col items-center justify-start gap-4 overflow-auto scroll" ref={messagesContainerRef}>
                            {messages.map((message, index) => (
                                <div key={index}>

                                    <div className="w-[640px] h-auto rounded-lg bg-white p-3 flex justify-between border-x-1 border-t-1 border-b-2 border-[#E0E0E0]">

                                        <div className="w-full h-auto flex flex-row gap-2">

                                            {message.sender === 'user' ? (
                                                <Avatar className="min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px]" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                                            ) : (
                                                <Avatar radius="sm" className="min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] p-2 bg-black" src={wWand} />
                                            )}

                                            <span className='w-full flex flex-row items-center justify-start break-words overflow-wrap break-word font-semibold'>{message.content}</span>

                                        </div>

                                    </div>

                                </div>
                            ))}

                        </div>
                    </div>
                )}

                <div className="w-full h-auto bg-white p-5 flex flex-row justify-between rounded-lg border-x-1 border-t-1 border-b-2 border-[#E0E0E0]">

                    <div className="w-auto h-auto flex flex-col gap-1 items-start justify-start cursor-default">

                        <h4 className="font-bold text-xl text-[#131315]">{projects[0]?.name}</h4>

                        <span className="font-medium text-base text-[#8A90A7]">{projects[0]?.description}</span>

                    </div>

                    <div className="w-auto h-full flex flex-row gap-5 items-center">

                        <div className="flex flex-col gap-1 items-start justify-start">

                            <span className="font-bold text-base text-[#EF7A17] cursor-pointer" onClick={handleFilesOpen}>Archivos</span>

                            <span className="font-medium text-base text-[#8A90A7] cursor-default">Inspeccionar Carpeta</span>

                        </div>

                        <Divider orientation="vertical" className="h-3/4 w-0.5 bg-[#EFF0F3]" />

                        <div className="flex flex-col gap-1 items-start justify-start">

                            <span className="font-bold text-base text-[#EF7A17] cursor-pointer">Preguntas</span>

                            <span className="font-medium text-base text-[#8A90A7] cursor-default">Inspeccionar Carpeta</span>

                        </div>

                    </div>

                    <Modal
                        backdrop="opaque"
                        isOpen={filesOpen}
                        onOpenChange={handleFilesOpen}
                        classNames={{
                            backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
                        }}
                        className="w-full h-auto max-w-[464px] max-h-[600px] rounded-lg"
                        isDismissable={false}
                    >

                        <ModalContent className="w-full h-auto">

                            {(onClose) => (
                                <div className="w-full h-full flex flex-col items-center justify-start gap-6 p-6">

                                    <ModalBody className="w-full h-full flex flex-col items-center justify-start gap-6 p-0">

                                        <div className="w-full h-full flex flex-col gap-2 cursor-default">
                                            <span className=" font-bold text-xl text-[#31313A]">Archivos</span>

                                            <div className="flex flex-col items-start justify-start gap-2">

                                                <div className="border-[#EF7A17] border-2 rounded-md w-full h-auto max-h-[54px] flex flex-row px-2 py-1.5 items-center">

                                                    <div className="w-full flex flex-row items-center justify-start gap-2">

                                                        <Image src={file} alt="file" width={24} height={24} className="file active" />

                                                        <div className="flex flex-col gap-0 p-0">

                                                            <span className="text-sm font-semibold text-[#EF7A17]">Nombre de Archivo</span>
                                                            <span className="text-sm font-normal text-[#EF7A17]">Descripcion de Archivo</span>

                                                        </div>

                                                    </div>

                                                    <Image src={deleteIcon} alt="delete file" width={24} height={24} className="delete active cursor-pointer h-6" />

                                                </div>

                                            </div>
                                        </div>

                                        <div className="w-full h-full flex flex-col gap-2 cursor-default">
                                            <span className=" font-bold text-xl text-[#31313A]">Pendientes de Subida</span>

                                            <div className="flex flex-col items-start justify-start gap-2">

                                                <div className="border-[#8A90A7] border-2 rounded-md w-full h-auto max-h-[54px] flex flex-row px-2 py-1.5 items-center">

                                                    <div className="w-full flex flex-row items-center justify-start gap-2">

                                                        <Image src={file} alt="file" width={24} height={24} className="file" />

                                                        <div className="flex flex-col gap-0 p-0">

                                                            <span className="text-sm font-semibold text-[#8A90A7]">Nombre de Archivo</span>
                                                            <span className="text-sm font-normal text-[#8A90A7]">Descripcion de Archivo</span>

                                                        </div>

                                                    </div>

                                                    <Image src={deleteIcon} alt="delete file" width={24} height={24} className="delete cursor-pointer h-6" />

                                                </div>

                                            </div>
                                        </div>

                                    </ModalBody>

                                </div>
                            )}

                        </ModalContent>

                    </Modal>

                </div>

                {isTableFinished ? (
                    <div className="w-full h-full bg-white flex flex-col gap-5 items-center justify-start rounded-lg border-x-1 border-t-1 border-b-2 border-[#E0E0E0] md:min-w-[300px]">

                        <div className="w-full min-h-[56px] rounded-t-lg border-b-2 border-[#EFF0F3] flex flex-row p-5 items-center justify-start cursor-default">

                            <span className=" text-base font-bold text-[#131315]">Tabla generada automáticamente</span>

                        </div>

                        <div className="w-full h-full px-5 pb-5 gap-5 flex flex-col">

                            <div className="w-full min-h-[32px] max-h-[32px] flex flex-row p-2 items-center justify-between cursor-default ">

                                <span className=" text-base font-bold text-[#EF7A17]">Tabla Completa</span>

                                <Select className="max-w-xs max-h-8 overflow-hidden flex flex-col items-center justify-center">
                                    <SelectItem key={1} >Mateo Aponte</SelectItem>
                                </Select>

                            </div>

                            <div className="w-full h-[calc(100%-40px)] box-border border-1 border-[#E0E0E0] rounded-md flex flex-row items-start justify-start">

                                <div className="w-1/3 h-full rounded-s-lg flex flex-col items-start justify-start gap-2 p-2">

                                    <div className="w-full h-auto min-h-[52px] flex flex-col items-start justify-center p-4 gap-2 rounded-md hover:bg-[#FDEBDC] cursor-pointer hover:font-semibold duration-200">

                                        <span>¿Que informacion necesita su trabajo/empresa?</span>

                                    </div>

                                </div>

                                <div className="w-2/3 h-full bg-[#EFF0F3] rounded-e-lg flex flex-row gap-2 p-2 items-start justify-start overflow-x-scroll">

                                    <div className="min-w-[256px] max-w-[312px] h-full flex flex-col gap-2">

                                        <div className="w-full min-h-[36px] flex items-center justify-center rounded-md px-3 py-2 bg-white cursor-default">

                                            <span className=" text-base font-medium text-[#131315]">Mateo Aponte</span>

                                        </div>

                                        <div className="w-full min-h-[36px] flex items-center justify-center rounded-md px-3 py-2 bg-white cursor-default">

                                            <div className=" overflow-y-scroll w-full h-full max-h-[412px]">

                                                <span className=" text-base font-normal text-[#131315]">De la corte constitucional mas que todo porque estoy mas enfocado hacia el derecho privado, entonces se que las publicaciones tienen todas las ramas del derecho pero me interesa mas la corte institucional De la corte constitucional mas que todo porque estoy mas enfocado hacia el derecho privado, entonces se que las publicaciones tienen todas las ramas del derecho pero me interesa mas la corte institucionalDe la corte constitucional mas que todo porque estoy mas enfocado hacia el derecho privado, entonces se que las publicaciones tienen todas las ramas del derecho pero me interesa mas la corte institucionalDe la corte constitucional mas que todo porque estoy mas enfocado hacia el derecho privado, entonces se que las publicaciones tienen todas las ramas del derecho pero me interesa mas la corte institucional</span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                ) : null}

            </div>

        </div>


    );

}