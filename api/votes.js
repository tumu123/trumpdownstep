// api/votes.js
let votes = {
  yes: 0,
  no: 0
};

export default function handler(req, res) {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求（预检请求）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json(votes);
    return;
  }

  if (req.method === 'POST') {
    const { vote } = req.body;
    if (vote === 'yes' || vote === 'no') {
      votes[vote]++;
      res.status(200).json(votes);
      return;
    }
    res.status(400).json({ error: 'Invalid vote' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
