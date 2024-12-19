// api/votes.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    try {
        await client.connect();
        const collection = client.db("trumpdown").collection("votes");

        // 设置 CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method === 'GET') {
            const votes = await collection.findOne({ id: 'votes' }) || { id: 'votes', yes: 0, no: 0 };
            res.status(200).json(votes);
            return;
        }

        if (req.method === 'POST') {
            const { vote } = req.body;
            if (vote === 'yes' || vote === 'no') {
                const update = { $inc: { [vote]: 1 } };
                const result = await collection.findOneAndUpdate(
                    { id: 'votes' },
                    update,
                    { upsert: true, returnDocument: 'after' }
                );
                res.status(200).json(result.value);
                return;
            }
            res.status(400).json({ error: 'Invalid vote' });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        await client.close();
    }
}
