// API 基础URL
const API_BASE_URL = window.location.origin;

// 目标日期（UTC时间2029年1月20日17:00:00）
const TARGET_DATE = new Date('2029-01-20T17:00:00Z');

// Cookie相关函数
const CookieManager = {
    setVotedCookie: () => {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `hasVoted=true; expires=${expiryDate.toUTCString()}; path=/`;
    },

    checkIfVoted: () => {
        return document.cookie.split(';').some(cookie => 
            cookie.trim().startsWith('hasVoted='));
    }
};

// 倒计时管理器
const CountdownManager = {
    updateCountdown: () => {
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
};

// 投票管理器
const VoteManager = {
    updateVoteDisplay: (data) => {
        console.log('Updating vote display with data:', data); // 调试日志
        document.getElementById('positive-votes').textContent = data.positiveVotes || 0;
        document.getElementById('neutral-votes').textContent = data.neutralVotes || 0;
        document.getElementById('negative-votes').textContent = data.negativeVotes || 0;
    },

    disableVoteButtons: () => {
        document.querySelectorAll('.vote-section button').forEach(button => {
            button.disabled = true;
        });
    },

    showVoteMessage: (message, type) => {
        const voteStatus = document.getElementById('voteStatus');
        if (voteStatus) {
            voteStatus.textContent = message;
            voteStatus.style.color = type === 'success' ? '#2ecc71' : 
                                   type === 'warning' ? '#f1c40f' : '#e74c3c';
        }
    },

    getVoteResults: async () => {
        try {
            console.log('Fetching vote results...'); // 调试日志
            const response = await fetch(`${API_BASE_URL}/api/votes`);
            console.log('Response status:', response.status); // 调试日志
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received vote data:', data); // 调试日志
            VoteManager.updateVoteDisplay(data);
        } catch (error) {
            console.error('Detailed error:', error);
            VoteManager.showVoteMessage('Failed to load vote results: ' + error.message, 'error');
        }
    },

    vote: async (choice) => {
        if (CookieManager.checkIfVoted()) {
            VoteManager.showVoteMessage('You have already voted!', 'warning');
            VoteManager.disableVoteButtons();
            return;
        }

        try {
            console.log('Submitting vote:', choice); // 调试日志
            const response = await fetch(`${API_BASE_URL}/api/votes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ choice })
            });

            console.log('Vote response status:', response.status); // 调试日志

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit vote');
            }

            const data = await response.json();
            console.log('Vote response data:', data); // 调试日志

            CookieManager.setVotedCookie();
            VoteManager.updateVoteDisplay(data);
            VoteManager.disableVoteButtons();
            VoteManager.showVoteMessage('Thank you for voting!', 'success');
        } catch (error) {
            console.error('Voting error:', error);
            VoteManager.showVoteMessage('Failed to submit vote: ' + error.message, 'error');
        }
    },

    // 添加初始化投票按钮方法
    initVoteButtons: () => {
        document.querySelectorAll('.vote-section button').forEach(button => {
            button.addEventListener('click', function() {
                const choice = this.getAttribute('data-vote');
                if (choice) {
                    console.log('Vote button clicked:', choice); // 调试日志
                    VoteManager.vote(choice);
                }
            });
        });
    }
};

// 社交分享管理器
const ShareManager = {
    updateShareLinks: () => {
        const currentUrl = window.location.href;
        const shareText = "Check out this Trump Departure Countdown!";
        
        const shareLinks = {
            facebook: document.querySelector('a[title="Share on Facebook"]'),
            twitter: document.querySelector('a[title="Share on Twitter"]'),
            linkedin: document.querySelector('a[title="Share on LinkedIn"]'),
            // 添加 WhatsApp
            whatsapp: document.querySelector('a[title="Share on WhatsApp"]')
        };
        
        if (shareLinks.facebook) {
            shareLinks.facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        }
        
        if (shareLinks.twitter) {
            shareLinks.twitter.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
        }
        
        if (shareLinks.linkedin) {
            shareLinks.linkedin.href = `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(currentUrl)}`;
        }

        // 添加 WhatsApp 分享链接
        if (shareLinks.whatsapp) {
            shareLinks.whatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`;
        }
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...'); // 调试日志

    // 初始化投票按钮
    VoteManager.initVoteButtons();
    
    // 启动倒计时
    CountdownManager.updateCountdown();
    setInterval(CountdownManager.updateCountdown, 1000);
    
    // 获取初始投票数据
    VoteManager.getVoteResults();
    
    // 更新社交分享链接
    ShareManager.updateShareLinks();
    
    // 检查投票状态
    if (CookieManager.checkIfVoted()) {
        VoteManager.disableVoteButtons();
        VoteManager.showVoteMessage('You have already voted!', 'warning');
    }

    // 设置实时更新投票结果（每30秒更新一次）
    setInterval(VoteManager.getVoteResults, 30000);

    console.log('Application initialized'); // 调试日志
});
