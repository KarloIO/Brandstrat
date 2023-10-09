'use server';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import supabaseClient from '@/lib/supabase'
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Message } from '@/types/message';
import { Document } from 'langchain/document';
import { BufferWindowMemory } from "langchain/memory";
import { PromptTemplate } from "langchain/prompts";
import * as fs from "fs";
// import pdf from 'pdf-parse';
// import fs from 'fs/promises';


// async function extractTextFromPDF(pdfPath: string) {
//     const dataBuffer = await fs.readFile(pdfPath);
//     const pdfData = await pdf(dataBuffer);
//     return pdfData.text;
// }


const promptTemplate = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Answer in Italian:`;
const prompt = PromptTemplate.fromTemplate(promptTemplate);

const model = new OpenAI({});
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1500 });
const docs = await textSplitter.createDocuments([text]);

const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQAStuffChain(model, { prompt }),
    retriever: vectorStore.asRetriever(),
});

const res = await chain.call({
    query: "What did the president say about Justice Breyer?",
});

console.log({ res });