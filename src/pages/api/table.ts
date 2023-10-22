import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        res.status(200).json({ message: "Okay, la operación se completó con éxito." });
    } catch (error) {
        console.error("Error en el bot:", error);
        res.status(500).json({ error: 'Hubo un error en el servidor' });
    }
}