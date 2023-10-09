'use server';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import supabaseClient from '@/lib/supabase'
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Message } from '@/types/message';
import { Document } from 'langchain/document';
import { BufferWindowMemory  } from "langchain/memory";
// import pdf from 'pdf-parse';
// import fs from 'fs/promises';


// async function extractTextFromPDF(pdfPath: string) {
//     const dataBuffer = await fs.readFile(pdfPath);
//     const pdfData = await pdf(dataBuffer);
//     return pdfData.text;
// }


const manageBotContext = async () => {

    try {
        const { data, error } = await supabaseClient
        .from('documents')
        .select()
        .eq('id', 77)

        if (error) {
            throw error;
        }

        const pdfContent = data && data.length > 0 ? data[0].content : null;

        const doc = new Document({ pageContent: pdfContent });

        const model = new OpenAI({
            temperature: 0.0,
        });

        const memory = new BufferWindowMemory({ k: 1 })

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 0,
        });

        const docs = await textSplitter.createDocuments([doc.pageContent]);

        const vectorStore = await MemoryVectorStore.fromDocuments(
            docs,
            new OpenAIEmbeddings(),
        );

        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), memory)

        const responses = [];

        const usuarios: { [key: string]: any } = {};

        const obtenerNombresEntrevistados = async () => {
            const consultaEntrevistados = "¿Quiénes son todos los entrevistados?";
            const respuesta: any = await chain.call({ query: consultaEntrevistados });
            let respuestasEntrevistados = respuesta.text.split(', ');
            respuestasEntrevistados = respuestasEntrevistados.map((nombre: string) => nombre.replace(/y /g, '').trim());
            return respuestasEntrevistados;
        }

        const entrevistados = await obtenerNombresEntrevistados();
        for (const entrevistado of entrevistados) {
            usuarios[entrevistado] = { respuestaPorUsuario: "" };
        }

        const pregunta = "Quiero que me diga las 5 primeras cosas que se le vienen a la mente cuando hablamos de Maquillaje"

        for (const usuario in usuarios) {
            const preguntaPersonalizada = `${usuario}, conteste la pregunta: ${pregunta}, si no lo sabe solo diga: "no tengo una respuesta para eso"`;
            console.log(preguntaPersonalizada);

            const respuesta: any = await chain.call({ query: preguntaPersonalizada })
            console.log(respuesta);

            const respuestaUsuario = respuesta.text;
            usuarios[usuario].respuestaPorUsuario = respuestaUsuario;

            responses.push({ pregunta, usuarios });
        }


        return responses;
    } catch (error) {
        console.error("Error en el bot:", error);
        throw error;
    }
}


export const sendMessageToBot = async (questions: string[]) => {

    try {
        const responses = await manageBotContext();
        return responses || "No se recibieron respuestas del modelo.";
    } catch (error) {
        console.error("Error en el bot:", error);
        throw error;
    }

}