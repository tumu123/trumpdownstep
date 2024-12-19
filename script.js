// 存储相关的常量
const STORAGE_KEYS = {
    VOTES: 'liuliu_votes',
    USER_VOTE: 'liuliu_user_vote',
    LAST_UPDATE: 'liuliu_last_update'
};

// 设置倒计时目标时间
const targetDateUTC = new Date('2029-01-20T17:00:00Z');
        document.addEventListener('DOMContentLoaded', function() {
            updateCountdown();
            setInterval(updateCountdown, 1000);
        });
// 初始化投票数据
let voteData = {
    positiveVotes: 0,
    neutralVotes: 0,
    negativeVotes: 0
};

// 初始化用户状态
let userVoteStatus = {
    hasVoted: false,
    choice: null,
    timestamp: null
};

// 从本地存储加载数据
function loadFromLocalStorage() {
    const savedVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
    const savedUserVote = localStorage.getItem(STORAGE_KEYS.USER_VOTE);
    
    if (savedUserVote) {
        userVoteStatus = JSON.parse(savedUserVote);
        if (userVoteStatus.hasVoted) {
            disableVoteButtons();
        }
    }

    // 即使有本地数据，也尝试从服务器获取最新数据
    syncWithServer();
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.USER_VOTE, JSON.stringify(userVoteStatus));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
}

// 更新显示的投票结果
function updateVoteDisplay() {
    document.getElementById("positive-votes").innerText = voteData.positiveVotes;
    document.getElementById("neutral-votes").innerText = voteData.neutralVotes;
    document.getElementById("negative-votes").innerText = voteData.negativeVotes;

    // 更新投票状态显示
    const voteStatusElement = document.getElementById('voteStatus');
    if (voteStatusElement) {
        if (userVoteStatus.hasVoted) {
            voteStatusElement.textContent = `You voted "${userVoteStatus.choice}" on ${new Date(userVoteStatus.timestamp).toLocaleString()}`;
            voteStatusElement.style.color = '#2ecc71';
        } else {
            voteStatusElement.textContent = 'You haven\'t voted yet';
            voteStatusElement.style.color = '#666';
        }
    }
}

// 禁用投票按钮
function disableVoteButtons() {
    const buttons = document.querySelectorAll('.vote-section button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

// 更新倒计时显示
function updateCountdown() {
    const currentDate = new Date();
    const timeDifference = targetDateUTC - currentDate;

    if (timeDifference <= 0) {
        document.querySelectorAll('.countdown-item span:first-child').forEach(element => {
            element.textContent = '00';
        });
        document.querySelector('.event-background p').textContent = "The countdown has ended!";
        return;
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// 投票函数
async function vote(choice) {
    if (userVoteStatus.hasVoted) {
        alert("You have already voted!");
        return;
    }

    try {
        const response = await fetch('/api/votes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ choice })
        });

        if (response.ok) {
            const updatedVotes = await response.json();
            voteData = updatedVotes;
            
            // 更新用户状态
            userVoteStatus = {
                hasVoted: true,
                choice: choice,
                timestamp: new Date().toISOString()
            };

            // 保存到本地存储
            saveToLocalStorage();
            
            // 更新显示
            updateVoteDisplay();
            disableVoteButtons();

            // 显示成功消息
            const voteStatusElement = document.getElementById('voteStatus');
            if (voteStatusElement) {
                voteStatusElement.textContent = `Thank you for voting "${choice}"!`;
                voteStatusElement.style.color = '#2ecc71';
            }
        } else {
            throw new Error('Voting failed');
        }
    } catch (error) {
        console.error('Voting failed:', error);
        alert('Failed to submit vote. Please try again later.');
    }
}

// 与服务器同步数据
async function syncWithServer() {
    try {
        const response = await fetch('/api/votes');
        if (response.ok) {
            const serverVotes = await response.json();
            voteData = serverVotes;
            updateVoteDisplay();
            
            // 更新同步状态
            const syncStatusElement = document.getElementById('syncStatus');
            if (syncStatusElement) {
                syncStatusElement.textContent = 'Last synced: ' + new Date().toLocaleTimeString();
                syncStatusElement.style.color = '#2ecc71';
            }
        }
    } catch (error) {
        console.error('Sync failed:', error);
        const syncStatusElement = document.getElementById('syncStatus');
        if (syncStatusElement) {
            syncStatusElement.textContent = 'Sync failed. Using local data.';
            syncStatusElement.style.color = '#e74c3c';
        }
    }
}

// 更新社交分享链接
function updateShareLinks() {
    const currentUrl = window.location.href;
    const shareText = "Check out this countdown!";
    
    const fbShare = document.querySelector('a[title="Share on Facebook"]');
    if (fbShare) {
        fbShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    }
    
    const twitterShare = document.querySelector('a[title="Share on Twitter"]');
    if (twitterShare) {
        twitterShare.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
    }
    
    const linkedinShare = document.querySelector('a[title="Share on LinkedIn"]');
    if (linkedinShare) {
        linkedinShare.href = `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(currentUrl)}`;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    updateCountdown(); // 立即更新倒计时
    setInterval(updateCountdown, 1000); // 每秒更新倒计时
    
    loadFromLocalStorage(); // 加载保存的数据
    updateShareLinks(); // 更新分享链接
    
    // 每30秒同步一次数据
    setInterval(syncWithServer, 30000);
});
