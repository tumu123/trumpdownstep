// 全局变量
const TRUMP_END_DATE = new Date('2029-01-20T17:00:00Z');
let hasVoted = false;
let voteData = {
    positiveVotes: 0,
    neutralVotes: 0,
    negativeVotes: 0
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    checkVotingStatus();
    startCountdown();
    await fetchVotes(); // 初始获取投票数据
    setupVoteButtons();
    setupAutoRefresh();
}

// 倒计时功能
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const distance = TRUMP_END_DATE - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.textContent = `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// 检查是否已投票
function checkVotingStatus() {
    hasVoted = localStorage.getItem('hasVoted') === 'true';
    if (hasVoted) {
        disableVoteButtons();
    }
}

// 设置投票按钮
function setupVoteButtons() {
    const voteTypes = ['positive', 'neutral', 'negative'];
    voteTypes.forEach(type => {
        const button = document.getElementById(`${type}Btn`);
        if (button) {
            button.addEventListener('click', () => handleVote(type));
        }
    });
}

// 处理投票
async function handleVote(type) {
    if (hasVoted) {
        showMessage('您已经投过票了', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/votes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type })
        });

        if (!response.ok) {
            throw new Error('投票失败');
        }

        const data = await response.json();
        
        // 更新本地数据
        voteData = data;
        updateDisplay();
        
        // 标记已投票
        hasVoted = true;
        localStorage.setItem('hasVoted', 'true');
        
        // 禁用按钮
        disableVoteButtons();
        
        // 显示成功消息
        showMessage('投票成功！', 'success');

    } catch (error) {
        console.error('Vote error:', error);
        showMessage('投票失败，请稍后重试', 'error');
    }
}

// 获取投票数据
async function fetchVotes() {
    try {
        const response = await fetch('/api/votes');
        if (!response.ok) {
            throw new Error('Failed to fetch votes');
        }
        const data = await response.json();
        voteData = data;
        updateDisplay();
    } catch (error) {
        console.error('Error fetching votes:', error);
        showMessage('获取投票数据失败', 'error');
    }
}

// 更新显示
function updateDisplay() {
    const total = voteData.positiveVotes + voteData.neutralVotes + voteData.negativeVotes;
    
    // 更新计数
    updateCount('positive', voteData.positiveVotes, total);
    updateCount('neutral', voteData.neutralVotes, total);
    updateCount('negative', voteData.negativeVotes, total);
}

// 更新单个计数和百分比
function updateCount(type, count, total) {
    const countElement = document.getElementById(`${type}Count`);
    const percentElement = document.getElementById(`${type}Percentage`);
    
    if (countElement) {
        countElement.textContent = count;
    }
    
    if (percentElement) {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
        percentElement.textContent = `${percentage}%`;
    }
}

// 禁用投票按钮
function disableVoteButtons() {
    const buttons = document.querySelectorAll('.vote-button');
    buttons.forEach(button => {
        button.disabled = true;
        button.classList.add('voted');
    });
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeOut 2s forwards;
        background-color: ${type === 'success' ? '#4CAF50' : 
                          type === 'error' ? '#f44336' : 
                          type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
    `;
    
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 2000);
}

// 设置自动刷新
function setupAutoRefresh() {
    // 每30秒刷新一次数据
    setInterval(fetchVotes, 30000);
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
    }

    .vote-button {
        transition: all 0.3s ease;
        margin: 5px;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .vote-button:hover:not(.voted) {
        transform: scale(1.05);
    }

    .vote-button.voted {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .message {
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
`;
document.head.appendChild(style);
