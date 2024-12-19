let positiveVotes = 0;
let neutralVotes = 0;
let negativeVotes = 0;
let hasVoted = false;

// Countdown target date (e.g., January 1, 2024)
const targetDate = new Date("2024-01-01T00:00:00").getTime();

// Update the countdown timer
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
}

// Voting function
function vote(choice) {
    if (hasVoted) {
        alert("You have already voted!");
        return;
    }

    if (choice === 'positive') {
        positiveVotes++;
    } else if (choice === 'neutral') {
        neutralVotes++;
    } else if (choice === 'negative') {
        negativeVotes++;
    }

    // Update voting results
    document.getElementById("positive-votes").innerText = positiveVotes;
    document.getElementById("neutral-votes").innerText = neutralVotes;
    document.getElementById("negative-votes").innerText = negativeVotes;

    hasVoted = true;
}

// Initialize countdown timer
setInterval(updateCountdown, 1000);
