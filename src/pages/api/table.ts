'use server';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import supabaseClient from '@/lib/supabase'
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from 'langchain/document';
import { BufferWindowMemory } from "langchain/memory";
import type { NextApiRequest, NextApiResponse } from 'next'
import pdfParse from 'pdf-parse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const PROJECT = req.body.projectName

    try {
        const { data, error } = await supabaseClient
            .storage
            .from(PROJECT)
            .list('', {
                limit: 100,
                offset: 0
            })
        if (Array.isArray(data)) {
            const nombresArchivos = data.map(archivo => archivo.name);
            console.log('------ Nombres de archivos obtenidos ------', nombresArchivos);

            if (error) {
                throw error;
            }

            if (Array.isArray(nombresArchivos)) {

                const descargas = nombresArchivos.map(async (nombreArchivo) => {
                    const { data: archivo, error: errorDescarga } = await supabaseClient
                        .storage
                        .from(PROJECT)
                        .download(nombreArchivo);

                    if (errorDescarga) {
                        console.error(`Error al descargar el archivo ${nombreArchivo}:`, errorDescarga);
                        return;
                    }

                    const arrayBuffer = await archivo.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    const data = await pdfParse(buffer);
                    return data.text;
                });


                const information = await Promise.all(descargas);


                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 2000,
                    chunkOverlap: 400,
                })


                const chunks = await splitter.splitDocuments([
                    new Document({ pageContent: information.join(' ') })
                ])




                const model = new OpenAI({
                    modelName: "gpt-3.5-turbo-16k",
                    temperature: 0.0,
                });


                const memory = new BufferWindowMemory({ k: 12 })


                const vectorStore = await MemoryVectorStore.fromDocuments(
                    chunks,
                    new OpenAIEmbeddings(),
                );

                let preguntas: any[] = [];

                const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), memory)

                const usuarios: { [key: string]: any } = {};

                const obtenerNombresEntrevistados = async () => {
                    const consultaEntrevistados = "¿Quiénes son todos los entrevistados? muestralos divididos por comas, no incluyas un 'y', asegurate de entender quienes son los entrevistados y quienes lo entrevistadores, esos ultimos no los menciones";
                    const respuesta: any = await chain.call({ query: consultaEntrevistados });
                    let nombres = respuesta.text.split(',').map((nombre: string) => nombre.trim());
                    console.log("Nombres de los entrevistados: ", nombres.join(', '));
                    return nombres;
                }

                try {
                    const entrevistados = await obtenerNombresEntrevistados();
                    for (const entrevistado of entrevistados) {
                        if (typeof entrevistado === 'string') {
                            usuarios[entrevistado] = { respuestaPorUsuario: "" };
                        }
                    }

                    const { data, error } = await supabaseClient
                        .storage
                        .from(PROJECT)
                        .list('questions', {
                            limit: 100,
                            offset: 0
                        })
                    if (error) {
                        console.error('Error al listar los archivos:', error);
                        return;
                    }
                    const archivos = data.filter(archivo => archivo.name !== '.emptyFolderPlaceholder');
                    const descargas = archivos.map(async (archivo) => {
                        const { data: archivoDescargado, error: errorDescarga } = await supabaseClient
                            .storage
                            .from(PROJECT)
                            .download(`questions/${archivo.name}`);
                        if (errorDescarga) {
                            console.error(`Error al descargar el archivo ${archivo.name}:`, errorDescarga);
                            return;
                        }
                        // Convertir Blob a JSON
                        const texto = await archivoDescargado.text();
                        const data = JSON.parse(texto);
                    
                        return data;
                    });
                    
                    const question = await Promise.all(descargas);
                    const preguntas = question[0].preguntas.map((obj: any) => obj.pregunta);

                    const todasLasRespuestas: any[] = [];
                    const usuarioIndices = Object.keys(usuarios).reduce((acc: { [key: string]: number }, usuario: string, index: number) => {
                        acc[usuario] = index;
                        return acc;
                    }, {});

                    for (const pregunta of preguntas) {
                        console.log(`------ Procesando pregunta: ${pregunta} ------`);
                        const respuestasPorPregunta: any[] = Array(Object.keys(usuarios).length).fill(null);
                        const promesas = Object.keys(usuarios).map(async (usuario: any) => {
                            const preguntaPersonalizada = `${usuario}, ${pregunta}, si no lo sabe solo diga: "no tengo una respuesta para eso"}`;

                            const respuesta: any = await chain.call({ query: `${preguntaPersonalizada}, responde siempre en español` })
                            console.log('Respuesta obtenida:', respuesta);

                            if (typeof respuesta !== 'object' || respuesta === null) {
                                console.error('La respuesta no es un objeto o es null:', respuesta);
                            } else if (!('text' in respuesta)) {
                                console.error('La respuesta no contiene la propiedad "text":', respuesta);
                            }

                            let respuestaUsuario;
                            try {
                                if (typeof respuesta === 'object' && respuesta !== null && 'text' in respuesta) {
                                    respuestaUsuario = respuesta.text;
                                } else {
                                    throw new Error('La respuesta no es un objeto válido o no contiene la propiedad "text"');
                                }
                            } catch (error) {
                                console.error('Error al procesar la respuesta:', error);
                                respuestaUsuario = "No hay contexto sobre eso";
                            }

                            usuarios[usuario].respuestaPorUsuario = respuestaUsuario;

                            respuestasPorPregunta[usuarioIndices[usuario]] = { name: usuario, respuesta: respuestaUsuario };

                            return { name: usuario, respuesta: respuestaUsuario };
                        });

                        await Promise.all(promesas);
                        todasLasRespuestas.push({ title: pregunta, respuestas: respuestasPorPregunta });
                    }

                    console.log('------ Todas las respuestas obtenidas ------', todasLasRespuestas);

                    res.status(200).json(todasLasRespuestas);
                } catch (error) {
                    console.error("Error después de obtener los nombres de los entrevistados:", error);
                }
            } else {
                console.error('nombresArchivos no es un array:', nombresArchivos);
            }
        } else {
            console.error('data no es un array:', data);
        }
    } catch (error) {
        console.error("Error en el bot:", error);
        res.status(500).json({ error: 'Ehh, yo digo que chale homs' });
    }
}