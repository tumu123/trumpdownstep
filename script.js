// 全局变量
const TRUMP_END_DATE = new Date('2029-01-20T17:00:00Z');
let hasVoted = false;

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initializeApp();
});

// 应用初始化
async function initializeApp() {
    // 检查是否已经投票
    checkVotingStatus();
    // 开始倒计时
    startCountdown();
    // 获取初始投票数据
    await fetchInitialVotes();
    // 设置实时更新
    setupRealtimeUpdates();
    // 设置投票按钮
    setupVoteButtons();
}

// 倒计时功能
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const distance = TRUMP_END_DATE - now;

        // 计算天、小时、分钟和秒
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // 更新倒计时显示
        document.getElementById('countdown').innerHTML = 
            `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;

        // 如果倒计时结束
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerHTML = "倒计时结束！";
        }
    }

    // 立即更新一次
    updateCountdown();
    // 每秒更新一次
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// 检查投票状态
function checkVotingStatus() {
    const voted = localStorage.getItem('hasVoted');
    if (voted) {
        hasVoted = true;
        disableVoteButtons();
    }
}

// 禁用投票按钮
function disableVoteButtons() {
    const buttons = document.querySelectorAll('.vote-button');
    buttons.forEach(button => {
        button.disabled = true;
        button.classList.add('voted');
    });
    document.getElementById('voteMessage').textContent = '您已经投过票了';
}

// 设置投票按钮
function setupVoteButtons() {
    const buttons = {
        'positiveBtn': 'positive',
        'neutralBtn': 'neutral',
        'negativeBtn': 'negative'
    };

    Object.entries(buttons).forEach(([btnId, voteType]) => {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', () => submitVote(voteType));
        }
    });
}

// 提交投票
async function submitVote(type) {
    if (hasVoted) {
        alert('您已经投过票了！');
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
        updateVoteCounts(data);
        
        // 标记已投票
        hasVoted = true;
        localStorage.setItem('hasVoted', 'true');
        disableVoteButtons();
        showVoteSuccess();

    } catch (error) {
        console.error('投票错误:', error);
        alert('投票失败，请稍后重试');
    }
}

// 获取初始投票数据
async function fetchInitialVotes() {
    try {
        const response = await fetch('/api/votes');
        if (!response.ok) {
            throw new Error('获取投票数据失败');
        }
        const data = await response.json();
        updateVoteCounts(data);
    } catch (error) {
        console.error('获取投票数据错误:', error);
    }
}

// 更新投票计数
function updateVoteCounts(data) {
    const total = data.positiveVotes + data.neutralVotes + data.negativeVotes;
    
    // 更新数字
    document.getElementById('positiveCount').textContent = data.positiveVotes;
    document.getElementById('neutralCount').textContent = data.neutralVotes;
    document.getElementById('negativeCount').textContent = data.negativeVotes;

    // 更新百分比
    document.getElementById('positivePercentage').textContent = 
        `${((data.positiveVotes / total) * 100).toFixed(1)}%`;
    document.getElementById('neutralPercentage').textContent = 
        `${((data.neutralVotes / total) * 100).toFixed(1)}%`;
    document.getElementById('negativePercentage').textContent = 
        `${((data.negativeVotes / total) * 100).toFixed(1)}%`;
}

// 设置实时更新
function setupRealtimeUpdates() {
    // 每30秒刷新一次数据
    setInterval(fetchInitialVotes, 30000);
}

// 显示投票成功消息
function showVoteSuccess() {
    const successMessage = document.createElement('div');
    successMessage.textContent = '投票成功！';
    successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        animation: fadeOut 2s forwards;
        z-index: 1000;
    `;
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.remove();
    }, 2000);
}

// 添加必要的 CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    .vote-button {
        transition: all 0.3s ease;
    }

    .vote-button.voted {
        opacity: 0.5;
        cursor: not-allowed;
    }

    #voteMessage {
        color: #666;
        font-style: italic;
    }
`;
document.head.appendChild(style);
