const { MongoClient } = require('mongodb');

// 允许跨域的中间件
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await fn(req, res);
};

const handler = async (req, res) => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('trumpdown');
    const collection = db.collection('votes');

    if (req.method === 'GET') {
      const results = await collection.findOne({ _id: 'voteResults' }) || {
        positiveVotes: 0,
        neutralVotes: 0,
        negativeVotes: 0
      };
      await client.close();
      return res.status(200).json(results);
    }

    if (req.method === 'POST') {
      const { choice } = req.body;

      if (!['positive', 'neutral', 'negative'].includes(choice)) {
        await client.close();
        return res.status(400).json({ error: 'Invalid vote choice' });
      }

      const updateField = `${choice}Votes`;
      const result = await collection.findOneAndUpdate(
        { _id: 'voteResults' },
        { $inc: { [updateField]: 1 } },
        { 
          upsert: true,
          returnDocument: 'after'
        }
      );

      await client.close();
      return res.status(200).json(result);
    }

    await client.close();
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};

module.exports = allowCors(handler);
