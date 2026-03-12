let firstPivotCell = null;
let firstGroup = null;
let cells = document.querySelectorAll(".cell");

/* ordre correct */
let correct = [
    "0% 0%","33.3333% 0%","66.6667% 0%","100% 0%",
    "0% 50%","33.3333% 50%","66.6667% 50%","100% 50%",
    "0% 100%","33.3333% 100%","66.6667% 100%","100% 100%"
];

let images = [...correct];

/* mélange */
for(let i = images.length-1;i>0;i--){
    let j = Math.floor(Math.random()*(i+1));

    let temp = images[i];
    images[i] = images[j];
    images[j] = temp;

}

/* remplir */
cells.forEach(function(cell,i){
    cell.style.backgroundImage="url('asset/image/image1.jpg')";
    cell.style.backgroundSize="400% 300%";
    cell.style.backgroundRepeat="no-repeat";
    cell.style.backgroundPosition=images[i];
});

checkFusion();

/* victoire */
function checkWin(){

    let win = true;

    cells.forEach(function(cell,i){

        if(cell.style.backgroundPosition!==correct[i]){
            win=false;
        }

    });

    if(win){

        let grid=document.querySelector(".grid");

        grid.innerHTML="";
        grid.style.backgroundImage="url('asset/image/image1.jpg')";
        grid.style.backgroundSize="cover";
        grid.style.backgroundPosition="center";
        grid.style.backgroundRepeat="no-repeat";

        alert("Bravo ! Puzzle terminé 🎉");

    }

}

/* échange */
cells.forEach(function(cell){

    cell.addEventListener("click", function(){

        if(firstGroup === null){

            firstGroup = getGroup(this);
            firstPivotCell = this;

            firstGroup.forEach(function(c){
                c.style.outline = "3px solid yellow";
                c.style.outlineOffset = "-3px";
            });

        }
        else{
            let secondPivotCell = this;
            let secondGroup = getGroup(this);

            if(secondGroup.some(c => firstGroup.includes(c))){
                firstGroup.forEach(c=>c.style.outline="none");
                firstGroup = null;
                firstPivotCell = null;
                return;
            }

            let cellsArray = Array.from(cells);
            let idx1 = cellsArray.indexOf(firstPivotCell);
            let idx2 = cellsArray.indexOf(secondPivotCell);

            let x1 = idx1 % 4; let y1 = Math.floor(idx1 / 4);
            let x2 = idx2 % 4; let y2 = Math.floor(idx2 / 4);

            let dx = x2 - x1;
            let dy = y2 - y1;

            // 1. Snapshot complet de l'état actuel pour garantir une permutation parfaite
            let snapshot = new Map();
            cells.forEach(c => snapshot.set(c, c.style.backgroundPosition));

            // 2. Identifier les Sources (le bloc qui bouge) et les Destinations
            let sources = firstGroup;
            let targets = sources.map(s => {
                let sIdx = cellsArray.indexOf(s);
                let sx = sIdx % 4; let sy = Math.floor(sIdx / 4);
                let tx = sx + dx; let ty = sy + dy;
                return (tx >= 0 && tx < 4 && ty >= 0 && ty < 3) ? cells[ty * 4 + tx] : null;
            });

            // Sécurité : si une partie du bloc sort de la grille, on annule pour ne pas le briser
            if(targets.includes(null)){
                alert("Mouvement impossible : le groupe sortirait de la grille !");
                firstGroup.forEach(c=>c.style.outline="none");
                firstGroup = null;
                firstPivotCell = null;
                return;
            }

            // 3. Logique d'échange atomique (Permutation parfaite)
            let sourceSet = new Set(sources);
            let targetSet = new Set(targets);

            // Cellules de destination qui ne font pas partie du groupe source (nouvelles zones occupées)
            let displacedCells = targets.filter(t => !sourceSet.has(t));
            let displacedImages = displacedCells.map(t => snapshot.get(t));

            // Cellules sources qui ne sont pas des destinations (zones libérées par le bloc)
            let vacatedCells = sources.filter(s => !targetSet.has(s));

            // 4. Mise à jour de la grille
            // On place chaque image source à sa destination
            sources.forEach((s, i) => {
                targets[i].style.backgroundPosition = snapshot.get(s);
            });
            // On remplit les zones libérées avec les images qui ont été "poussées"
            vacatedCells.forEach((v, i) => {
                v.style.backgroundPosition = displacedImages[i];
            });

            /* enlever sélection */
            firstGroup.forEach(c=>c.style.outline="none");
            firstGroup = null;
            firstPivotCell = null;

            checkFusion();
            checkWin();
        }
    });
});

/* fusion */
function isMatch(cell1, cell2, dx, dy) {
    if(!cell1 || !cell2) return false;
    let pos1 = cell1.style.backgroundPosition.split(" ");
    let pos2 = cell2.style.backgroundPosition.split(" ");
    let x1 = parseFloat(pos1[0]); let y1 = parseFloat(pos1[1]);
    let x2 = parseFloat(pos2[0]); let y2 = parseFloat(pos2[1]);

    if (dx !== 0) { // Horizontal
        return Math.abs(y1 - y2) < 0.1 && Math.abs((x2 - x1) - 33.3333) < 0.1;
    }
    if (dy !== 0) { // Vertical
        return Math.abs(x1 - x2) < 0.1 && Math.abs((y2 - y1) - 50) < 0.1;
    }
    return false;
}

function checkFusion(){
    cells.forEach(function(cell){
        cell.style.border = "1px solid black";
        cell.style.margin = "0px";
    });

    for(let i=0; i < cells.length; i++){    
        let x = i % 4;
        let y = Math.floor(i / 4);

        if (x < 3) {
            if (isMatch(cells[i], cells[i+1], 1, 0)) {
                // Horizontal fusion
                cells[i].style.borderRight = "none";
                cells[i+1].style.borderLeft = "none";
                cells[i].style.marginRight = "-15px";
            }
        }
        if (y < 2) {
            if (isMatch(cells[i], cells[i+4], 0, 1)) {
                // Vertical fusion
                cells[i].style.borderBottom = "none";
                cells[i+4].style.borderTop = "none";
                cells[i].style.marginBottom = "-15px";
            }
        }
    }
}

function getGroup(cell){
    let group = [];
    let stack = [cell];
    let cellsArray = Array.from(cells);

    while(stack.length > 0){
        let current = stack.pop();
        if(group.includes(current)) continue;
        group.push(current);

        let index = cellsArray.indexOf(current);
        let x = index % 4;
        let y = Math.floor(index / 4);
        let style = window.getComputedStyle(current);

        if(style.borderRightStyle === "none" && x < 3) stack.push(cells[index+1]);
        if(style.borderLeftStyle === "none" && x > 0) stack.push(cells[index-1]);
        if(style.borderBottomStyle === "none" && y < 2) stack.push(cells[index+4]);
        if(style.borderTopStyle === "none" && y > 0) stack.push(cells[index-4]);
    }
    return group;
}

