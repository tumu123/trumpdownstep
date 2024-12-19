import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        const db = client.db("trumpdown");
        const collection = db.collection("votes");
        
        // 插入一个初始文档来创建数据库和集合
        await collection.insertOne({
            id: 'test',
            positiveVotes: 0,
            neutralVotes: 0,
            negativeVotes: 0,
            createdAt: new Date(),
            test: true
        });
        
        // 读取刚插入的文档
        const result = await collection.findOne({ id: 'test' });
        
        res.status(200).json({ 
            status: 'success',
            message: 'Successfully created database and collection',
            database: 'trumpdown',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        });
    } finally {
        await client.close();
    }
}
