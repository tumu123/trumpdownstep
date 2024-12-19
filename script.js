// 存储相关的常量
const STORAGE_KEYS = {
    VOTES: 'liuliu_votes',
    USER_VOTE: 'liuliu_user_vote',
    LAST_UPDATE: 'liuliu_last_update'
};

// 初始化投票数据
let voteData = {
    positiveVotes: 0,
    neutralVotes: 0,
    negativeVotes: 0
};

// 初始化用户状态
let userVoteStatus = {
    hasVoted: false,
    choice: null
};

// 从本地存储加载数据
function loadFromLocalStorage() {
    const savedVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
    const savedUserVote = localStorage.getItem(STORAGE_KEYS.USER_VOTE);
    
    if (savedVotes) {
        voteData = JSON.parse(savedVotes);
        updateVoteDisplay();
    }
    
    if (savedUserVote) {
        userVoteStatus = JSON.parse(savedUserVote);
        if (userVoteStatus.hasVoted) {
            disableVoteButtons();
        }
    }
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(voteData));
    localStorage.setItem(STORAGE_KEYS.USER_VOTE, JSON.stringify(userVoteStatus));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
}

// 更新显示的投票结果
function updateVoteDisplay() {
    document.getElementById("positive-votes").innerText = voteData.positiveVotes;
    document.getElementById("neutral-votes").innerText = voteData.neutralVotes;
    document.getElementById("negative-votes").innerText = voteData.negativeVotes;
}

// 禁用投票按钮
function disableVoteButtons() {
    const buttons = document.querySelectorAll('.vote-section button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

// 投票函数
async function vote(choice) {
    if (userVoteStatus.hasVoted) {
        alert("You have already voted!");
        return;
    }

    // 更新本地数据
    switch(choice) {
        case 'positive':
            voteData.positiveVotes++;
            break;
        case 'neutral':
            voteData.neutralVotes++;
            break;
        case 'negative':
            voteData.negativeVotes++;
            break;
    }

    // 更新用户状态
    userVoteStatus.hasVoted = true;
    userVoteStatus.choice = choice;

    // 保存到本地存储
    saveToLocalStorage();
    
    // 更新显示
    updateVoteDisplay();
    disableVoteButtons();

    // 同步到服务器（后面会实现）
    try {
        await syncWithServer();
    } catch (error) {
        console.error('Failed to sync with server:', error);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    // 启动定时同步
    setInterval(syncWithServer, 30000); // 每30秒同步一次
});

// 在 script.js 中添加
async function syncWithServer() {
    try {
        // 获取服务器数据
        const response = await fetch('/api/votes');
        const serverVotes = await response.json();
        
        // 如果本地有新投票，发送到服务器
        if (userVoteStatus.hasVoted && !userVoteStatus.synced) {
            await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    choice: userVoteStatus.choice
                })
            });
            userVoteStatus.synced = true;
            saveToLocalStorage();
        }
        
        // 更新本地数据
        voteData = serverVotes;
        updateVoteDisplay();
        
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

function updateCountdown() {
    const currentDate = new Date();
    const timeDifference = targetDateUTC - currentDate;

    if (timeDifference <= 0) {
        // 如果已经到达或超过目标时间
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        return;
    }

    // 计算天、小时、分钟和秒
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    // 更新显示
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}