import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('trumpdown');
        const collection = db.collection('votes');

        // GET 请求 - 获取投票结果
        if (req.method === 'GET') {
            const results = await collection.findOne({ _id: 'voteResults' }) || {
                positiveVotes: 0,
                neutralVotes: 0,
                negativeVotes: 0
            };
            
            return res.status(200).json(results);
        }

        // POST 请求 - 提交新投票
        if (req.method === 'POST') {
            const { choice } = req.body;

            // 验证投票选项
            if (!['positive', 'neutral', 'negative'].includes(choice)) {
                return res.status(400).json({ error: 'Invalid vote choice' });
            }

            // 更新计数器
            const updateField = `${choice}Votes`;
            const result = await collection.findOneAndUpdate(
                { _id: 'voteResults' },
                { $inc: { [updateField]: 1 } },
                { 
                    upsert: true,
                    returnDocument: 'after'
                }
            );

            return res.status(200).json(result);
        }

        // 其他请求方法
        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: 'Database error' });
    }
}
