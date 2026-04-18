function initLandingGrid() {
    const landingGrid = document.getElementById('landing-grid');
    if (!landingGrid) return;

    const progress = ProgressManager.get();
    const secretImg = 'asset/image/image4.png';
    const positions = [
        "0% 0%", "50% 0%", "100% 0%",
        "0% 50%", "50% 50%", "100% 50%",
        "0% 100%", "50% 100%", "100% 100%"
    ];

    landingGrid.innerHTML = "";
    positions.forEach((pos, index) => {
        const piece = document.createElement('div');
        piece.className = 'landing-piece';

        if (index < progress.revealedPieces) {
            piece.style.backgroundImage = `url('${secretImg}')`;
            piece.style.backgroundPosition = pos;
            piece.classList.add('revealed');
        } else {
            piece.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
            piece.style.border = "1px solid rgba(255, 255, 255, 0.1)";
            piece.classList.add('hidden-card');
        }

        landingGrid.appendChild(piece);
    });

    const playBtn = document.getElementById('main-play-btn');
    if (playBtn) {
        playBtn.innerText = `Jouer au Niveau ${progress.currentLevel}`;
    }
}

function startGame() {
    const progress = ProgressManager.get();
    const levelData = levels[progress.currentLevel];
    currentImage = levelData.image;
    document.getElementById('level-title').innerText = levelData.title;

    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    let gridSize;
    if (progress.currentLevel <= 2) {
        gridSize = { r: 3, c: 3 };
    } else if (progress.currentLevel <= 4) {
        gridSize = { r: 3, c: 4 };
    } else if (progress.currentLevel <= 6) {
        gridSize = { r: 4, c: 4 };
    } else if (progress.currentLevel <= 8) {
        gridSize = { r: 4, c: 5 };
    } else {
        gridSize = { r: 5, c: 5 };
    }

    const grid = document.getElementById('puzzle-grid');
    grid.style.gridTemplateColumns = `repeat(${gridSize.c}, 150px)`;
    grid.style.gridTemplateRows = `repeat(${gridSize.r}, 150px)`;

    initPuzzle(gridSize.r, gridSize.c);
}

function goToHome() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    initLandingGrid();
}

window.addEventListener('DOMContentLoaded', initLandingGrid);
window.startGame = startGame;
window.goToHome = goToHome;
