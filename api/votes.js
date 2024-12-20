import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    try {
        await client.connect();
        const db = client.db('trumpdown');
        const collection = db.collection('votes');

        // 获取投票结果
        if (req.method === 'GET') {
            const results = await collection.findOne({ _id: 'voteResults' });
            return res.status(200).json(results || {
                positiveVotes: 0,
                neutralVotes: 0,
                negativeVotes: 0
            });
        }

        // 处理投票
        if (req.method === 'POST') {
            const { choice, voterIP } = req.body;

            // 检查是否已经投票
            const existingVote = await collection.findOne({ 
                _id: `vote_${voterIP}` 
            });

            if (existingVote) {
                return res.status(400).json({ error: 'You have already voted' });
            }

            // 记录投票
            await collection.insertOne({
                _id: `vote_${voterIP}`,
                choice,
                timestamp: new Date()
            });

            // 更新投票结果
            const updateField = `${choice}Votes`;
            await collection.updateOne(
                { _id: 'voteResults' },
                { $inc: { [updateField]: 1 } },
                { upsert: true }
            );

            // 返回最新结果
            const results = await collection.findOne({ _id: 'voteResults' });
            return res.status(200).json(results);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
}
