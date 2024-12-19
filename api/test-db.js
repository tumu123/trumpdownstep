import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        await client.db("trumpdown").command({ ping: 1 });
        res.status(200).json({ 
            status: 'success',
            message: 'Successfully connected to MongoDB',
            database: 'trumpdown',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        await client.close();
    }
}
