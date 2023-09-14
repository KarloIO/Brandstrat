'use server';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Message } from '@/types/message';

export const sendMessageToBot = async (message: Message) => {
    try {

        const model = new OpenAI({
            temperature: 0.0,
        });

        const text = message.data;

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 0,
        });

        const docs = await textSplitter.createDocuments([text])

        const vectorStore = await MemoryVectorStore .fromDocuments(
            docs,
            new OpenAIEmbeddings(),
        );

        const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
            returnSourceDocuments: true,
        })

        const question = message.content;

        const response = await chain.call({ question, chat_history: [] })

        return response || "No se recibió respuesta del modelo.";
    } catch (error) {
        console.error("Error en el bot:", error);
        throw error;
    }
};