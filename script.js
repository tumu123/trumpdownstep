// API 基础URL
const API_BASE_URL = 'https://trumpdownstep2.vercel.app';

// 目标日期（UTC时间2029年1月20日17:00:00）
const TARGET_DATE = new Date('2029-01-20T17:00:00Z');

// 检查是否已投票
function checkIfVoted() {
    return document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith('hasVoted='));
}

// 设置投票cookie
function setVotedCookie() {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `hasVoted=true; expires=${expiryDate.toUTCString()}; path=/`;
}

// 更新倒计时显示
function updateCountdown() {
    const now = new Date();
    const timeDifference = TARGET_DATE.getTime() - now.getTime();

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

// 更新投票显示
function updateVoteDisplay(data) {
    document.getElementById('positive-votes').textContent = data.positiveVotes || 0;
    document.getElementById('neutral-votes').textContent = data.neutralVotes || 0;
    document.getElementById('negative-votes').textContent = data.negativeVotes || 0;
}

// 禁用投票按钮
function disableVoteButtons() {
    document.querySelectorAll('.vote-section button').forEach(button => {
        button.disabled = true;
    });
}

// 显示投票消息
function showVoteMessage(message, type) {
    const voteStatus = document.getElementById('voteStatus');
    if (voteStatus) {
        voteStatus.textContent = message;
        voteStatus.style.color = type === 'success' ? '#2ecc71' : 
                                type === 'warning' ? '#f1c40f' : '#e74c3c';
    }
}

// 获取投票结果
async function getVoteResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/votes`);
        if (response.ok) {
            const data = await response.json();
            updateVoteDisplay(data);
        }
    } catch (error) {
        console.error('Failed to get vote results:', error);
        showVoteMessage('Failed to load vote results', 'error');
    }
}

// 投票功能
async function vote(choice) {
    if (checkIfVoted()) {
        showVoteMessage('You have already voted!', 'warning');
        disableVoteButtons();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                choice,
                voterIP: await getUserIP()
            })
        });

        const data = await response.json();

        if (response.ok) {
            setVotedCookie();
            updateVoteDisplay(data);
            disableVoteButtons();
            showVoteMessage('Thank you for voting!', 'success');
        } else {
            if (data.error === 'You have already voted') {
                setVotedCookie();
                showVoteMessage('You have already voted!', 'warning');
                disableVoteButtons();
            } else {
                throw new Error(data.error);
            }
        }
    } catch (error) {
        console.error('Voting error:', error);
        showVoteMessage('Failed to submit vote. Please try again later.', 'error');
    }
}

// 获取用户IP
async function getUserIP() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/timezone`);
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Failed to get IP:', error);
        return null;
    }
}

// 更新社交分享链接
function updateShareLinks() {
    const currentUrl = window.location.href;
    const shareText = "Check out this Trump Departure Countdown!";
    
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

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 开始倒计时
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // 获取初始投票数据
    getVoteResults();
    
    // 更新社交分享链接
    updateShareLinks();
    
    // 如果已经投过票，禁用投票按钮
    if (checkIfVoted()) {
        disableVoteButtons();
        showVoteMessage('You have already voted!', 'warning');
    }
});
