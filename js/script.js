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
    3: { image: 'asset/image/image3.png', title: "Niveau 3" }
};

/* --- SYSTÈME DE MENU --- */
function startGame(levelId) {
    currentImage = levels[levelId].image;
    document.getElementById('level-title').innerText = levels[levelId].title;
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    initPuzzle();
}

function goToHome() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
}

window.startGame = startGame;
window.goToHome = goToHome;

/* --- INITIALISATION --- */
function initPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = "";
    grid.style.backgroundImage = "none";

    let images = [...correct];
    for (let i = images.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }

    cells = [];
    for (let i = 0; i < 12; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.backgroundImage = `url('${currentImage}')`;
        cell.style.backgroundSize = "400% 300%";
        cell.style.backgroundPosition = images[i];
        cell.onclick = function () { handleInteraction(this); };
        grid.appendChild(cell);
        cells.push(cell);
    }
    checkFusion();
}

/* --- LOGIQUE DE JEU --- */
function handleInteraction(clickedCell) {
    if (firstGroup === null) {
        firstGroup = getGroup(clickedCell);
        firstPivotCell = clickedCell;
        firstGroup.forEach(c => c.style.outline = "4px solid yellow");
    } else {
        let secondPivotCell = clickedCell;
        let secondGroup = getGroup(clickedCell);

        if (secondGroup.some(c => firstGroup.includes(c))) {
            firstGroup.forEach(c => c.style.outline = "none");
            firstGroup = null;
            return;
        }

        executeMove(firstPivotCell, secondPivotCell);
        firstGroup.forEach(c => c.style.outline = "none");
        firstGroup = null;
        checkFusion();
        checkWin();
    }
}

function executeMove(p1, p2) {
    let idx1 = cells.indexOf(p1);
    let idx2 = cells.indexOf(p2);
    let dx = (idx2 % 4) - (idx1 % 4);
    let dy = Math.floor(idx2 / 4) - Math.floor(idx1 / 4);

    let targets = firstGroup.map(s => {
        let sIdx = cells.indexOf(s);
        let tx = (sIdx % 4) + dx;
        let ty = Math.floor(sIdx / 4) + dy;
        return (tx >= 0 && tx < 4 && ty >= 0 && ty < 3) ? cells[ty * 4 + tx] : null;
    });

    if (targets.includes(null)) return;

    let snapshot = new Map();
    cells.forEach(c => snapshot.set(c, c.style.backgroundPosition));

    let displaced = targets.filter(t => !firstGroup.includes(t));
    let displacedImgs = displaced.map(t => snapshot.get(t));
    let vacated = firstGroup.filter(s => !targets.includes(s));

    firstGroup.forEach((s, i) => targets[i].style.backgroundPosition = snapshot.get(s));
    vacated.forEach((v, i) => v.style.backgroundPosition = displacedImgs.shift());
}

/* --- FUSION ET GROUPES --- */
function isMatch(c1, c2, dx, dy) {
    let p1 = c1.style.backgroundPosition.split(" ").map(parseFloat);
    let p2 = c2.style.backgroundPosition.split(" ").map(parseFloat);
    if (dx !== 0) return Math.abs(p1[1] - p2[1]) < 0.1 && Math.abs((p2[0] - p1[0]) - 33.3333) < 0.5;
    if (dy !== 0) return Math.abs(p1[0] - p2[0]) < 0.1 && Math.abs((p2[1] - p1[1]) - 50) < 0.5;
    return false;
}

function checkFusion() {
    cells.forEach(c => c.classList.remove('merged-right', 'merged-left', 'merged-top', 'merged-bottom'));
    for (let i = 0; i < cells.length; i++) {
        let x = i % 4, y = Math.floor(i / 4);
        if (x < 3 && isMatch(cells[i], cells[i + 1], 1, 0)) {
            cells[i].classList.add('merged-right');
            cells[i + 1].classList.add('merged-left');
        }
        if (y < 2 && isMatch(cells[i], cells[i + 4], 0, 1)) {
            cells[i].classList.add('merged-bottom');
            cells[i + 4].classList.add('merged-top');
        }
    }
}

function getGroup(cell) {
    let group = [], stack = [cell];
    while (stack.length > 0) {
        let curr = stack.pop();
        if (group.includes(curr)) continue;
        group.push(curr);
        let idx = cells.indexOf(curr), x = idx % 4;
        if (curr.classList.contains('merged-right')) stack.push(cells[idx + 1]);
        if (curr.classList.contains('merged-left')) stack.push(cells[idx - 1]);
        if (curr.classList.contains('merged-bottom')) stack.push(cells[idx + 4]);
        if (curr.classList.contains('merged-top')) stack.push(cells[idx - 4]);
    }
    return group;
}

function checkWin() {
    if (cells.every((c, i) => c.style.backgroundPosition === correct[i])) {
        setTimeout(() => alert("Bravo ! 🎉"), 300);
    }
}