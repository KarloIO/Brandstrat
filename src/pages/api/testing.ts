import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';
import supabaseClient from '@/lib/supabase'

async function extractTextFromPDF(dataBuffer: ArrayBuffer) {
    const buffer = Buffer.from(dataBuffer);
    const pdfData = await pdf(buffer);
    return pdfData.text;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { url } = req.body;
    console.log(url);

    const filteredUrl = url.replace('https://xhvzztgjptwivzgscwgz.supabase.co/storage/v1/object/public/documents/', '');
    console.log(filteredUrl);

    const { data, error } = await supabaseClient.storage
        .from('documents')
        .download(filteredUrl);

    if (error) {
        console.log('Error downloading file:', error);
        res.status(500).send('Error downloading file');
        return;
    }

    const pdfBlob = new Blob([data]);

    try {
        const dataBuffer = await pdfBlob.arrayBuffer();
        let content = await extractTextFromPDF(dataBuffer);

        const upload = content.toString()

        const { data, error } = await supabaseClient
            .from('documents')
            .insert({ content: upload })
            .select()
            const ID = data && data.length > 0 ? data[0].id : null;


        if (error) {
            console.error('Error al insertar el contenido:', error);
            return;
        }

        const document = await supabaseClient
        .from('documents')
        .select('content')
        .eq('id', ID);

        res.status(200).json({ data: document.data });
    } catch (error) {
        console.error('Error en el proceso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export default handler;






// Hola












// import { NextApiRequest, NextApiResponse } from 'next';
// import supabaseClient from '@/lib/supabase';
// import { Document } from 'langchain/document';
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import pdf from 'pdf-parse';
// import fs from 'fs/promises';

// // async function extractTextFromPDF(pdfPath: any) {
// //     const dataBuffer = await fs.readFile(pdfPath);
// //     const pdfData = await pdf(dataBuffer);
// //     return pdfData.text;
// // }

// // async function updateContentInSupabase(documentID: number, content: string) {
// //     const { data, error } = await supabaseClient
// //         .from('documents')
// //         .update({ content })
// //         .eq('id', documentID);

// //     if (error) {
// //         console.error('Error al actualizar en Supabase:', error);
// //         throw error;
// //     }

// //     return data;
// // }

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//     const documentID = 5;
//     // const pdfPath = './3033_Lega_74_Empresas_AbogadoJurídico.pdf';

//     try {
//         const { data } = await supabaseClient
//         .from('documents')
//         .select('content')
//         .eq('id', documentID);

//         // const splitter = new RecursiveCharacterTextSplitter({
//         //     chunkSize: 2000,
//         //     chunkOverlap: 0,
//         // });

//         // const chunks = await splitter.splitDocuments([
//         //     new Document({ pageContent: data![0].content }),
//         // ]);

//         // const { data: createdData, error: creationError } = await supabaseClient
//         //     .from('documents')
//         //     .insert([{ content }])
//         //     .single();

//         // if (creationError) {
//         //     console.error('Error al crear el documento en Supabase:', creationError);
//         //     throw creationError;
//         // }

//         // const createdDocumentID = createdData;

//         // const response = await fetch(`/api/testing/${createdDocumentID}`);
//         // if (response.ok) {
//         //     const data = await response.json();
//         //     console.log('Documento creado en Supabase:', data);
//         // } else {
//         //     console.error('No se pudo obtener el documento recién creado.');
//         // }

//         // await updateContentInSupabase(documentID, content);

//         // const jsonContent = JSON.stringify(content);
//         res.status(200).json({ data: data });
//     } catch (error) {
//         console.error('Error en el proceso:', error);
//         res.status(500).json({ error: 'Error interno del servidor' });
//     }
// };

// export default handler;