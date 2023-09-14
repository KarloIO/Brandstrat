'use client'
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { sendMessageToBot } from "@/pages/api/bot";
import pdf from 'pdf-parse';

import bot from '@/public/bot.png'
import user from '@/public/user.png'
import supabaseClient from '@/lib/supabase';

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

export default function Chat() {
    const [urlData, setUrl] = useState<UrlType>({publicUrl: ""});
    const [data, setData] = useState("");
    const [sourceData, setSourceData] = useState<SourceDataItem[]>([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [timestamps, setTimestamps] = useState<{ sender: string; content: string; timestamp: string; }[]>([]);

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handleSendMessage = async () => {
        const newMessage: Message = {
            sender: "user",
            content: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: user.src,
            data: data
        };

        const updatedMessages: Message[] = [...messages, newMessage];

        setMessages(updatedMessages);
        setMessage("");
        setTimestamps([...timestamps, newMessage]);

        const response = await sendMessageToBot(newMessage as any);
        const responseText = await response.text;
        setSourceData(response.sourceDocuments);

        console.log(sourceData)

        const autoResponse: Message = {
            sender: "bot",
            content: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: bot.src,
            data: data
        };

        setTimeout(() => {
            setMessages([...updatedMessages, autoResponse]);
        }, 1000);
    };

    useEffect(() => {
        console.log(urlData)

        if (urlData.publicUrl !== "") {
            fetchData()
        }

    }, [urlData]);

    const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files![0];
        const fileName = file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const { data: list, error: listError } = await supabaseClient.storage
            .from('documents')
            .list();

        const fileExists = list?.some(item => item.name === fileName);

        if (fileExists) {
            const { data } = await supabaseClient.storage
                .from('documents')
                .getPublicUrl(fileName)
            setUrl({publicUrl: data.publicUrl})

            return;
        }

        const { data, error } = await supabaseClient.storage
            .from('documents')
            .upload(fileName, file)

        if (data) {
            console.log(data.path);
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetch("api/testing", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: urlData.publicUrl })
            });
            if (response.ok) {
                const data = await response.json();
                setData(data.data[0].content)
            } else {
                console.error("No se pudo obtener el contenido del archivo.");
            }
        } catch (error) {
            console.error("Error al leer el archivo:", error);
        }
    };

    return (

        <div className="chat-modules">

            <div className="left-module">

                <div className="module-header">

                    <h4>Brandstrat Bot</h4>

                    <span><strong>Expediente:</strong> </span>

                    <input type='file' accept="application/pdf" placeholder="sube el documento" onChange={handleDocumentUpload} />

                </div>

                <div className="chat-zone">
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.sender}>
                            <Image src={msg.avatar} alt="Avatar" className="avatar" width={32} height={32} />
                            <div className="message">
                                <div className="header">
                                    <div className="sender">
                                        <p>{msg.sender}</p>
                                    </div>
                                    {msg.sender === "user" && (
                                        <span className="timestamp">{msg.timestamp}</span>
                                    )}
                                </div>
                                <div className="text">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="messages-input">
                    <input type="text" placeholder="Escribe tu consulta..." onChange={handleMessageChange} />
                    <button onClick={handleSendMessage}>Enviar</button>
                </div>

            </div>

            <div className="right-module">

                {sourceData.map((item, index) => (

                    <div key={index} className="source">

                        <textarea defaultValue={item.pageContent}></textarea>

                        {item.metadata && typeof item.metadata !== "string" && (

                            <div className="metadata">

                                <p style={{ color: '#44CE6B' }}>Desde: {JSON.stringify(item.metadata.loc.lines.from)}</p>
                                <p style={{ color: '#44CE6B' }}>Hasta: {JSON.stringify(item.metadata.loc.lines.to)}</p>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>

    );

}