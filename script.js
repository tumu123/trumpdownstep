// API 基础URL
const API_BASE_URL = 'https://trumpdownstep2.vercel.app';

// 目标日期（美国东部时间2029年1月20日中午12:00）
const TARGET_DATE_US = new Date('2029-01-20T17:00:00Z'); // UTC时间

// 存储用户信息
let userInfo = {
    ip: null,
    timezone: null,
    hasVoted: false
};

// 存储投票数据
let voteData = {
    positiveVotes: 0,
    neutralVotes: 0,
    negativeVotes: 0
};

// 获取用户时区信息
async function getUserTimezone() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/timezone`);
        if (response.ok) {
            userInfo = await response.json();
            updateCountdownWithTimezone();
        } else {
            console.error('Failed to get timezone info');
            // 如果获取失败，使用默认UTC时间
            updateCountdown();
        }
    } catch (error) {
        console.error('Timezone API error:', error);
        updateCountdown();
    }
}

// 根据用户时区更新倒计时
function updateCountdownWithTimezone() {
    const currentDate = new Date();
    // 计算时差
    const userOffset = userInfo.offset || 0;
    const timeDifference = TARGET_DATE_US.getTime() - currentDate.getTime();
    
    updateCountdownDisplay(timeDifference);
}

// 更新倒计时显示
function updateCountdownDisplay(timeDifference) {
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

// 投票功能
async function vote(choice) {
    if (!userInfo.ip) {
        alert("Please wait while we get your location information");
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
                voterIP: userInfo.ip
            })
        });

        const data = await response.json();

        if (response.ok) {
            voteData = data;
            userInfo.hasVoted = true;
            updateVoteDisplay();
            disableVoteButtons();
            showVoteMessage('Thank you for voting!', 'success');
        } else {
            if (data.error === 'You have already voted') {
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

// 更新投票显示
function updateVoteDisplay() {
    document.getElementById('positive-votes').textContent = voteData.positiveVotes || 0;
    document.getElementById('neutral-votes').textContent = voteData.neutralVotes || 0;
    document.getElementById('negative-votes').textContent = voteData.negativeVotes || 0;
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

// 获取实时投票数据
async function getVoteResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/votes`);
        if (response.ok) {
            voteData = await response.json();
            updateVoteDisplay();
        }
    } catch (error) {
        console.error('Failed to get vote results:', error);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取用户时区信息
    getUserTimezone();
    
    // 开始倒计时
    setInterval(updateCountdownWithTimezone, 1000);
    
    // 获取初始投票数据
    getVoteResults();
    
    // 定期更新投票数据（每30秒）
    setInterval(getVoteResults, 30000);
});

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

// 在页面加载时更新社交分享链接
document.addEventListener('DOMContentLoaded', updateShareLinks);
