// server.js
const express = require('express');
const app = express();
const port = 3000;

// 使用内存存储投票数据（实际应用中应使用数据库）
let globalVotes = {
    positiveVotes: 0,
    neutralVotes: 0,
    negativeVotes: 0
};

app.use(express.json());

// 获取投票数据
app.get('/api/votes', (req, res) => {
    res.json(globalVotes);
});

// 提交投票
app.post('/api/vote', (req, res) => {
    const { choice } = req.body;
    
    switch(choice) {
        case 'positive':
            globalVotes.positiveVotes++;
            break;
        case 'neutral':
            globalVotes.neutralVotes++;
            break;
        case 'negative':
            globalVotes.negativeVotes++;
            break;
        default:
            return res.status(400).json({ error: 'Invalid choice' });
    }
    
    res.json(globalVotes);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});