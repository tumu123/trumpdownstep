import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    try {
        await client.connect();
        const collection = client.db("trumpdown").collection("votes");

        // GET 请求处理 - 获取投票数据
        if (req.method === 'GET') {
            // 尝试获取现有投票记录
            let votes = await collection.findOne({ id: 'votes' });
            
            // 如果没有投票记录，创建一个新的
            if (!votes) {
                votes = {
                    id: 'votes',
                    positiveVotes: 0,
                    neutralVotes: 0,
                    negativeVotes: 0,
                    createdAt: new Date(),
                };
                await collection.insertOne(votes);
            }
            
            return res.status(200).json(votes);
        }

        // POST 请求处理 - 更新投票
        if (req.method === 'POST') {
            const { type } = req.body;
            
            // 验证投票类型
            if (!['positive', 'neutral', 'negative'].includes(type)) {
                return res.status(400).json({ error: 'Invalid vote type' });
            }

            // 构建更新查询
            const updateField = `${type}Votes`;
            
            // 使用 upsert 确保文档存在
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
                    upsert: true,
                    returnDocument: 'after'
                }
            );

            return res.status(200).json(result.value);
        }

        // 其他请求方法
        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
            error: 'Database error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        await client.close();
    }
}
