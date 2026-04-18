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
            // On arrondit pour éviter les problèmes de précision flottante
            const posString = `${posX.toFixed(4)}% ${posY.toFixed(4)}%`;
            correctPositions.push(posString);
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
        cell.dataset.pos = images[i]; // Stockage fiable pour la vérification
        cell.onclick = function () { handleInteraction(this, cols, rows); };
        grid.appendChild(cell);
        cells.push(cell);
    }
    checkFusion(cols, rows);
}

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
    cells.forEach(c => snapshot.set(c, c.dataset.pos));

    let displaced = targets.filter(t => !firstGroup.includes(t));
    let displacedImgs = displaced.map(t => snapshot.get(t));

    firstGroup.forEach((s, i) => {
        const newPos = snapshot.get(s);
        targets[i].style.backgroundPosition = newPos;
        targets[i].dataset.pos = newPos;
    });

    let vacated = firstGroup.filter(s => !targets.includes(s));
    vacated.forEach((v, i) => {
        const newPos = displacedImgs.shift();
        v.style.backgroundPosition = newPos;
        v.dataset.pos = newPos;
    });
}

function isMatch(c1, c2, dx, dy, cols, rows) {
    let p1 = c1.dataset.pos.split(" ").map(parseFloat);
    let p2 = c2.dataset.pos.split(" ").map(parseFloat);

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
        const currentPos = cell.dataset.pos.split(" ").map(parseFloat);
        const targetX = (i % cols) / (cols - 1) * 100;
        const targetY = Math.floor(i / cols) / (rows - 1) * 100;
        const matchX = Math.abs(currentPos[0] - targetX) < 0.1;
        const matchY = Math.abs(currentPos[1] - targetY) < 0.1;
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
                // Utilisation de guillemets simples pour éviter les bugs d'encodage selon le navigateur
                alert('Bravo ! Niveau ' + levelFinished + ' terminé. Une nouvelle partie de la photo est révélée !');
                goToHome();
            }
        }, 300);
    }
}
