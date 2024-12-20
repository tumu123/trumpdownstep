// API 基础URL
const API_BASE_URL = 'https://trumpdownstep2.vercel.app';

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
            const response = await fetch(`${API_BASE_URL}/api/votes`);
            if (response.ok) {
                const data = await response.json();
                VoteManager.updateVoteDisplay(data);
            }
        } catch (error) {
            console.error('Failed to get vote results:', error);
            VoteManager.showVoteMessage('Failed to load vote results', 'error');
        }
    },

    vote: async (choice) => {
        if (CookieManager.checkIfVoted()) {
            VoteManager.showVoteMessage('You have already voted!', 'warning');
            VoteManager.disableVoteButtons();
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/votes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ choice })
            });

            const data = await response.json();

            if (response.ok) {
                CookieManager.setVotedCookie();
                VoteManager.updateVoteDisplay(data);
                VoteManager.disableVoteButtons();
                VoteManager.showVoteMessage('Thank you for voting!', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Voting error:', error);
            VoteManager.showVoteMessage('Failed to submit vote. Please try again later.', 'error');
        }
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
            linkedin: document.querySelector('a[title="Share on LinkedIn"]')
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
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
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
});
