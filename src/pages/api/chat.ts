'use server';
import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export const runtime = 'edge'

const apiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY!
})

const openai = new OpenAIApi(apiConfig)

export default async function handler(req: Request, res: Response) {
    if (req.method === 'POST') {
        const { messages } = await req.json()

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo-1106',
            stream: true,
            messages
        })

        const stream = OpenAIStream(response)

        return new StreamingTextResponse(stream)
    } else {
        const statusCode = res.status
        console.log(statusCode);
    }
}