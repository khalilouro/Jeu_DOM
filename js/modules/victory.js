function triggerVictory() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');
    createConfetti();
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#6366f1', '#c084fc', '#f43f5e', '#fbbf24', '#10b981'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 8 + 6 + 'px';
        confetti.style.height = confetti.style.width;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        confetti.style.animationDuration = duration + 's';
        confetti.style.animationDelay = delay + 's';
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), (duration + delay) * 1000);
    }
}

function restartGame() {
    if (confirm("Voulez-vous vraiment recommencer l'aventure depuis le début ?")) {
        localStorage.removeItem('puzzleProgress');
        document.getElementById('victory-screen').classList.add('hidden');
        document.getElementById('home-screen').classList.remove('hidden');
        initLandingGrid();
    }
}

window.restartGame = restartGame;
