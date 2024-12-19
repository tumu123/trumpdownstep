// /api/votes.js
let votes = {
    positiveVotes: 0,
    neutralVotes: 0,
    negativeVotes: 0
};

export default function handler(req, res) {
    if (req.method === 'GET') {
        res.status(200).json(votes);
    } else if (req.method === 'POST') {
        const { choice } = req.body;
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
        res.status(200).json(votes);
    }
}
