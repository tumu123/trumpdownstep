import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    let mongoClient = null;
    try {
        mongoClient = await client.connect();
        const collection = client.db("trumpdown").collection("votes");
        console.log('MongoDB connected successfully');

        // GET请求 - 获取投票数据
        if (req.method === 'GET') {
            const votes = await collection.findOne({ id: 'votes' }) || {
                id: 'votes',
                positiveVotes: 0,
                neutralVotes: 0,
                negativeVotes: 0,
                createdAt: new Date()
            };
            console.log('GET request - Current votes:', votes);
            return res.status(200).json(votes);
        }

        // POST请求 - 提交投票
        if (req.method === 'POST') {
            const { type } = req.body;
            console.log('Received vote type:', type);

            if (!['positive', 'neutral', 'negative'].includes(type)) {
                console.log('Invalid vote type:', type);
                return res.status(400).json({ error: 'Invalid vote type' });
            }

            const updateField = `${type}Votes`;
            const result = await collection.findOneAndUpdate(
                { id: 'votes' },
                { 
                    $inc: { [updateField]: 1 },
                    $setOnInsert: {
                        positiveVotes: type === 'positive' ? 1 : 0,
                        neutralVotes: type === 'neutral' ? 1 : 0,
                        negativeVotes: type === 'negative' ? 1 : 0,
                        createdAt: new Date()
                    }
                },
                { 
                    returnDocument: 'after',
                    upsert: true 
                }
            );

            console.log('Vote updated successfully:', result.value);
            return res.status(200).json(result.value);
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Database error',
            message: error.message 
        });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
}
