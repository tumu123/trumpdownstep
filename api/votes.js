import { MongoClient } from 'mongodb';

// MongoDB 连接配置
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
}

const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 30000,
});

// 创建数据库连接池
let clientPromise;
if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    clientPromise = client.connect();
}

// 验证投票选项
function isValidChoice(choice) {
    return ['positive', 'neutral', 'negative'].includes(choice);
}

// API 处理函数
export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('trumpdown');
        const collection = db.collection('votes');

        // GET 请求 - 获取投票结果
        if (req.method === 'GET') {
            const results = await collection.findOne({ _id: 'voteResults' });
            return res.status(200).json(results || {
                positiveVotes: 0,
                neutralVotes: 0,
                negativeVotes: 0
            });
        }

        // POST 请求 - 处理投票
        if (req.method === 'POST') {
            const { choice, voterIP } = req.body;

            // 验证输入
            if (!choice || !voterIP) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            if (!isValidChoice(choice)) {
                return res.status(400).json({ error: 'Invalid choice' });
            }

            // 检查重复投票
            const existingVote = await collection.findOne({ 
                _id: `vote_${voterIP}` 
            });

            if (existingVote) {
                return res.status(400).json({ error: 'You have already voted' });
            }

            // 使用事务处理投票
            const session = client.startSession();
            try {
                await session.withTransaction(async () => {
                    // 记录投票
                    await collection.insertOne({
                        _id: `vote_${voterIP}`,
                        choice,
                        timestamp: new Date()
                    }, { session });

                    // 更新总票数
                    const updateField = `${choice}Votes`;
                    await collection.updateOne(
                        { _id: 'voteResults' },
                        { $inc: { [updateField]: 1 } },
                        { upsert: true, session }
                    );
                });

                // 返回最新结果
                const results = await collection.findOne({ _id: 'voteResults' });
                return res.status(200).json(results);
            } finally {
                await session.endSession();
            }
        }

        // 其他请求方法
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
