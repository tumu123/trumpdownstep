// /api/votes.js
let votes = {
    positiveVotes: 0,
    neutralVotes: 0,
    negativeVotes: 0
};

export default function handler(req, res) {
    // 允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'GET') {
        // 返回当前投票数据
        res.status(200).json(votes);
    } 
    else if (req.method === 'POST') {
        const { choice } = req.body;
        
        // 更新投票数据
        if (choice) {
            switch(choice) {
                case 'positive':
                    votes.positiveVotes++;
                    break;
                case 'neutral':
                    votes.neutralVotes++;
                    break;
                case 'negative':
                    votes.negativeVotes++;
                    break;
            }
        }
        
        // 返回更新后的数据
        res.status(200).json(votes);
    }
    else if (req.method === 'OPTIONS') {
        // 处理预检请求
        res.status(200).end();
    }
    else {
        res.status(405).end();
    }
}
