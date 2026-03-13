let firstPivotCell = null;
let firstGroup = null;
let cells = [];
let currentImage = '';

const correct = [
    "0% 0%", "33.3333% 0%", "66.6667% 0%", "100% 0%",
    "0% 50%", "33.3333% 50%", "66.6667% 50%", "100% 50%",
    "0% 100%", "33.3333% 100%", "66.6667% 100%", "100% 100%"
];

const levels = {
    1: { image: 'asset/image/image1.jpg', title: "Niveau 1" },
    2: { image: 'asset/image/image2.png', title: "Niveau 2" },
    3: { image: 'asset/image/image3.png', title: "Niveau 3" },
    4: { image: 'asset/image/image5.png', title: "Niveau 4 - Sous l'Océan" },
    5: { image: 'asset/image/image6.png', title: "Niveau 5 - Cosmos" },
    6: { image: 'asset/image/image7.png', title: "Niveau 6 - Forêt Magique" },
    7: { image: 'asset/image/image8.png', title: "Niveau 7 - Pyramides" },
    8: { image: 'asset/image/image9.png', title: "Niveau 8 - Cyberpunk" },
    9: { image: 'asset/image/image10.png', title: "Niveau 9 - Repaire du Dragon" }
};

/* --- SYSTÈME DE PROGRESSION --- */
const ProgressManager = {
    get() {
        const saved = localStorage.getItem('puzzleProgress');
        // Initial state: Level 1 unlocked, 0 pieces of the secret puzzle revealed
        return saved ? JSON.parse(saved) : { currentLevel: 1, unlockedLevels: [1], revealedPieces: 0 };
    },
    save(progress) {
        localStorage.setItem('puzzleProgress', JSON.stringify(progress));
    },
    completeLevel(level) {
        let p = this.get();
        // Reveal a piece of the secret puzzle (image4.png)
        if (p.revealedPieces < 9) {
            p.revealedPieces++;
        }
        // Unlock next level
        const nextLevel = level + 1;
        if (levels[nextLevel] && !p.unlockedLevels.includes(nextLevel)) {
            p.unlockedLevels.push(nextLevel);
            p.currentLevel = nextLevel;
        }
        this.save(p);
    }
};

/* --- SYSTÈME DE MENU --- */
function initLandingGrid() {
    const landingGrid = document.getElementById('landing-grid');
    if (!landingGrid) return;

    const progress = ProgressManager.get();
    const secretImg = 'asset/image/image4.png'; // La photo récompense
    
    // Positions pour un puzzle 3x3 sur l'accueil
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

    // Mettre à jour le titre ou le bouton si besoin
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

    // Difficulté progressive basée sur le niveau
    let gridSize;
    if (progress.currentLevel <= 2) {
        gridSize = { r: 3, c: 3 }; // Débutant
    } else if (progress.currentLevel <= 4) {
        gridSize = { r: 3, c: 4 }; // Facile
    } else if (progress.currentLevel <= 6) {
        gridSize = { r: 4, c: 4 }; // Moyen
    } else if (progress.currentLevel <= 8) {
        gridSize = { r: 4, c: 5 }; // Difficile
    } else {
        gridSize = { r: 5, c: 5 }; // Expert (Niveau 9)
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

/* --- INITIALISATION --- */
function initPuzzle(rows, cols) {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = "";
    grid.style.backgroundImage = "none";

    const bgSize = `${cols * 100}% ${rows * 100}%`;

    const correctPositions = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let posX = cols > 1 ? (x / (cols - 1)) * 100 : 0;
            let posY = rows > 1 ? (y / (rows - 1)) * 100 : 0;
            correctPositions.push(`${posX}% ${posY}%`);
        }
    }

    let images = [...correctPositions];
    for (let i = images.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }

    cells = [];
    for (let i = 0; i < rows * cols; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.backgroundImage = `url('${currentImage}')`;
        cell.style.backgroundSize = bgSize;
        cell.style.backgroundPosition = images[i];
        cell.onclick = function () { handleInteraction(this, cols, rows); };
        grid.appendChild(cell);
        cells.push(cell);
    }
    checkFusion(cols, rows);
}

/* --- LOGIQUE DE JEU --- */
function handleInteraction(clickedCell, cols, rows) {
    if (firstGroup === null) {
        firstGroup = getGroup(clickedCell, cols, rows);
        firstPivotCell = clickedCell;
        firstGroup.forEach(c => c.style.outline = "4px solid yellow");
    } else {
        let secondPivotCell = clickedCell;
        let secondGroup = getGroup(clickedCell, cols, rows);

        if (secondGroup.some(c => firstGroup.includes(c))) {
            firstGroup.forEach(c => c.style.outline = "none");
            firstGroup = null;
            return;
        }

        executeMove(firstPivotCell, secondPivotCell, cols, rows);
        firstGroup.forEach(c => c.style.outline = "none");
        firstGroup = null;
        checkFusion(cols, rows);
        checkWin(cols, rows);
    }
}

function executeMove(p1, p2, cols, rows) {
    let idx1 = cells.indexOf(p1);
    let idx2 = cells.indexOf(p2);
    let dx = (idx2 % cols) - (idx1 % cols);
    let dy = Math.floor(idx2 / cols) - Math.floor(idx1 / cols);

    let targets = firstGroup.map(s => {
        let sIdx = cells.indexOf(s);
        let tx = (sIdx % cols) + dx;
        let ty = Math.floor(sIdx / cols) + dy;
        return (tx >= 0 && tx < cols && ty >= 0 && ty < rows) ? cells[ty * cols + tx] : null;
    });

    if (targets.includes(null)) return;

    let snapshot = new Map();
    cells.forEach(c => snapshot.set(c, c.style.backgroundPosition));

    let displaced = targets.filter(t => !firstGroup.includes(t));
    let displacedImgs = displaced.map(t => snapshot.get(t));

    firstGroup.forEach((s, i) => targets[i].style.backgroundPosition = snapshot.get(s));

    // Remplir les cases vidées par les images déplacées
    let vacated = firstGroup.filter(s => !targets.includes(s));
    vacated.forEach((v, i) => v.style.backgroundPosition = displacedImgs.shift());
}

/* --- FUSION ET GROUPES --- */
function isMatch(c1, c2, dx, dy, cols, rows) {
    let p1 = c1.style.backgroundPosition.split(" ").map(parseFloat);
    let p2 = c2.style.backgroundPosition.split(" ").map(parseFloat);

    let stepX = 100 / (cols - 1);
    let stepY = 100 / (rows - 1);

    if (dx !== 0) return Math.abs(p1[1] - p2[1]) < 0.1 && Math.abs((p2[0] - p1[0]) - stepX) < 0.5;
    if (dy !== 0) return Math.abs(p1[0] - p2[0]) < 0.1 && Math.abs((p2[1] - p1[1]) - stepY) < 0.5;
    return false;
}

function checkFusion(cols, rows) {
    cells.forEach(c => c.classList.remove('merged-right', 'merged-left', 'merged-top', 'merged-bottom'));
    for (let i = 0; i < cells.length; i++) {
        let x = i % cols, y = Math.floor(i / cols);
        if (x < cols - 1 && isMatch(cells[i], cells[i + 1], 1, 0, cols, rows)) {
            cells[i].classList.add('merged-right');
            cells[i + 1].classList.add('merged-left');
        }
        if (y < rows - 1 && isMatch(cells[i], cells[i + cols], 0, 1, cols, rows)) {
            cells[i].classList.add('merged-bottom');
            cells[i + cols].classList.add('merged-top');
        }
    }
}

function getGroup(cell, cols, rows) {
    let group = [], stack = [cell];
    while (stack.length > 0) {
        let curr = stack.pop();
        if (group.includes(curr)) continue;
        group.push(curr);
        let idx = cells.indexOf(curr);
        if (curr.classList.contains('merged-right')) stack.push(cells[idx + 1]);
        if (curr.classList.contains('merged-left')) stack.push(cells[idx - 1]);
        if (curr.classList.contains('merged-bottom')) stack.push(cells[idx + cols]);
        if (curr.classList.contains('merged-top')) stack.push(cells[idx - cols]);
    }
    return group;
}

function checkWin(cols, rows) {
    const isWin = cells.every((cell, i) => {
        const currentPos = cell.style.backgroundPosition.split(" ").map(parseFloat);
        const targetX = (i % cols) / (cols - 1) * 100;
        const targetY = Math.floor(i / cols) / (rows - 1) * 100;
        const matchX = Math.abs(currentPos[0] - targetX) < 0.5;
        const matchY = Math.abs(currentPos[1] - targetY) < 0.5;
        return matchX && matchY;
    });

    if (isWin) {
        const progress = ProgressManager.get();
        const levelFinished = progress.currentLevel;
        ProgressManager.completeLevel(levelFinished); 

        setTimeout(() => {
            const updatedProgress = ProgressManager.get();
            if (updatedProgress.revealedPieces >= 9 && levelFinished === 9) {
                triggerVictory();
            } else {
                alert(`Bravo ! Niveau ${levelFinished} terminé. Une nouvelle partie de la photo est révélée !`);
                goToHome();
            }
        }, 300);
    }
}

/* --- SYSTÈME DE VICTOIRE FINALE --- */
function triggerVictory() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');
    
    // Lancer les paillettes !
    createConfetti();
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#6366f1', '#c084fc', '#f43f5e', '#fbbf24', '#10b981'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Propriétés aléatoires
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 8 + 6 + 'px';
        confetti.style.height = confetti.style.width;
        
        // Animation aléatoire
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        confetti.style.animationDuration = duration + 's';
        confetti.style.animationDelay = delay + 's';
        
        container.appendChild(confetti);
        
        // Nettoyage
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