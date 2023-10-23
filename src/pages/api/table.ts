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

    try {
        const { data, error } = await supabaseClient
            .storage
            .from('Probando')
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

                    const preguntas = [
                        "¿Cuáles son los temas jurídicos/contables que más le interesan? ¿Alguna razón particular?",
                        "¿Qué tan fácil es acceder a este tipo de información? ¿Por qué cree eso?",
                        // "En tema de costo… ¿Qué tan caro es encontrar la información que le interesa? ¿Tiene suscripciones? ¿Con qué empresas? ¿Cuánto cuestan?",
                        // "De la información que está disponible ¿Cree que está completa? ¿actualizada? ¿Qué tan relevante es? ¿Por qué piensa esto? ¿podría darme algunos ejemplos?",
                        // "¿Para qué utiliza esta información?",
                        // "¿Por cuáles medios prefiere acceder a la información? ¿Por qué?",
                        // "¿Cómo hace para acceder a este tipo de información?",
                        // "¿Dónde la busca?",
                        // "En internet: ¿A través de qué buscadores? ¿Qué tipo de páginas? ¿De qué empresas?",
                        // "Revistas especializadas: ¿Cuáles? ¿Por qué esas? ¿Cada cuánto las recibe?",
                        // "Periódicos ¿Cuáles? ¿Por qué esas?",
                        // "Subscripciones a publicaciones especializadas ¿Cuáles? ¿Por qué esas?",
                        // "¿Prefiere recibir la información de forma impresa o digital? ¿Por qué?",
                        // "Si yo le pregunto por 5 publicaciones (pueden ser impresas, digitales, como usted quiera) en las que usted pueda encontrar este tipo de información ¿cuáles son las primeras que se le vienen a la mente? ¿De quién son?",
                        // "¿Por qué pensó en estas?",
                        // "¿Conoce las publicaciones de Legis? ¿Por qué no las mencionó antes?",
                        // "Quiero que me diga las 5 primeras cosas que se le vienen a la mente cuando hablamos de Legis",
                        // "¿Por qué piensa eso?",
                        // "¿Usted contaba con la subscripción de LEGIS para la publicación: ________? ¿Qué piensa sobre esa publicación?",
                        // "¿Cuáles son las fortalezas de esa publicación y cuáles son las debilidades? ¿Por qué?",
                        // "Y ahora en general ¿Cuáles son las fortalezas de LEGIS? ¿Cuáles son las debilidades? ¿Por qué? ¿Puede darme algún ejemplo?",
                        // "¿Cuál cree usted que es la mayor competencia de LEGIS en relación con la publicación de información como la que estaba en la obra a la que usted estaba subscrito? ¿Por qué piensa esto?",
                        // "¿Cómo conoció la publicación? ¿Por cuánto tiempo lo tuvo?",
                        // "¿Qué lo atrajo o motivó a subscribirse? ¿Por qué?",
                        // "¿En cuál formato recibe la publicación (físico o digital)? ¿Qué opina sobre esos formatos? ¿cuál es su preferencia, cuál usa más? ¿por qué? ¿qué recomienda?",
                        // "¿Cómo le parecía la publicación? ¿Qué era lo bueno? ¿Qué era lo malo? ¿Qué era lo que más le gustaba? ¿Por qué?",
                        // "¿Usted llegó a recomendarle la publicación a algún amigo o colega? ¿Por qué?",
                        // "Si en este momento usted me fuera a hablar de esa publicación ¿qué me diría?",
                        // "¿Qué tipo de beneficios obtendría si me subscribiera a esa publicación?",
                        // "¿A qué tendría acceso?",
                        // "¿Cada cuánto recibiría esta información?",
                        // "¿Por cuáles medios podría consultar la información?",
                        // "¿Tendría alguna ventaja por tener mi suscripción con LEGIS? ¿Cuál?",
                        // "¿Cuánto tendría que pagar?"
                    ];

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
                    
                            const respuesta: any = await chain.call({ query: preguntaPersonalizada })
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