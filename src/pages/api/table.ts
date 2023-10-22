'use server';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import supabaseClient from '@/lib/supabase'
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from 'langchain/document';
import { BufferWindowMemory  } from "langchain/memory";
import type { NextApiRequest, NextApiResponse } from 'next'
import pdfParse from 'pdf-parse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    try {
        const { data, error } = await supabaseClient
        .storage
        .from('Probando')
        .list('',{
            limit: 100,
            offset: 0
        })
        if (Array.isArray(data)) {
            const nombresArchivos = data.map(archivo => archivo.name);
        console.log(nombresArchivos);
    
        if (error) {
            throw error;
        }
    
        const descargas = nombresArchivos!.map(async (nombreArchivo) => {
            const { data: archivo, error: errorDescarga } = await supabaseClient
            .storage
            .from('Probando')
            .download(nombreArchivo);
        
            if (errorDescarga) {
                console.error(`Error al descargar el archivo ${nombreArchivo}:`, errorDescarga);
                return;
            }
        
            // Convertir Blob a base64
            const arrayBuffer = await archivo.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Convertir base64 a texto legible
            const data = await pdfParse(buffer);
            return data.text;
        });
        
        const textos = await Promise.all(descargas);
        // console.log(textos);
    
        const information = await Promise.all(descargas);

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 400,
        })

        const chunks = await splitter.splitDocuments([
            new Document({ pageContent: information.join(' ')})
        ])

        // console.log(chunks);

        const model = new OpenAI({
            temperature: 0.0,
        });

        const memory = new BufferWindowMemory({ k: 1 })

        const vectorStore = await MemoryVectorStore.fromDocuments(
            chunks,
            new OpenAIEmbeddings(),
        );

        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), memory)

        const usuarios: { [key: string]: any } = {};

        const obtenerNombresEntrevistados = async () => {
            const consultaEntrevistados = "¿Quiénes son todos los entrevistados?";
            const respuesta: any = await chain.call({ query: consultaEntrevistados });
            let respuestasEntrevistados = respuesta.text.split(', ');
            respuestasEntrevistados = respuestasEntrevistados.map((nombre: string) => nombre.replace(/y /g, '').trim());
            console.log("Nombres de los entrevistados: ", respuestasEntrevistados.join(', '));
            return respuestasEntrevistados;
        }

        const entrevistados = await obtenerNombresEntrevistados();
        for (const entrevistado of entrevistados) {
            usuarios[entrevistado] = { respuestaPorUsuario: "" };
        }

        const preguntas = [
            "¿Cuáles son los temas jurídicos/contables que más le interesan? ¿Alguna razón particular?",
            "¿Qué tan fácil es acceder a este tipo de información? ¿Por qué cree eso?",
        ];
        
        const todasLasRespuestas: any[] = [];
        const usuarioIndices = Object.keys(usuarios).reduce((acc: { [key: string]: number }, usuario: string, index: number) => {
            acc[usuario] = index;
            return acc;
        }, {});
        
        for (const pregunta of preguntas) {
            const respuestasPorPregunta: any[] = Array(Object.keys(usuarios).length).fill(null);
            const promesas = Object.keys(usuarios).map(async usuario => {
                const preguntaPersonalizada = `${pregunta}, si no lo sabe solo diga: "no tengo una respuesta para eso"}`;

                const respuesta: any = await chain.call({ query: preguntaPersonalizada })

                const respuestaUsuario = respuesta.text;
                usuarios[usuario].respuestaPorUsuario = respuestaUsuario;

                if (Array.isArray(respuestasPorPregunta)) {
                    respuestasPorPregunta[usuarioIndices[usuario]] = { name: usuario, respuesta: respuestaUsuario };
                } else {
                    console.error('Error: respuestasPorPregunta no es un array');
                }

                return { name: usuario, respuesta: respuestaUsuario };
            });

            await Promise.all(promesas);
            todasLasRespuestas.push({ title: pregunta, respuestas: respuestasPorPregunta });
        }

        console.log(todasLasRespuestas);

        res.status(200).json(todasLasRespuestas);
    }} catch (error) {
        console.error("Error en el bot:", error);
        res.status(500).json({ error: 'Hubo un error en el servidor' });
    }
}




// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     try {
//         res.status(200).json({ message: "Okay, la operación se completó con éxito." });
//     } catch (error) {
//         console.error("Error en el bot:", error);
//         res.status(500).json({ error: 'Hubo un error en el servidor' });
//     }
// }