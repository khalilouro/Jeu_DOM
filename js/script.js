let firstCell = null;
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
let firstGroup = null;

cells.forEach(function(cell){

    cell.addEventListener("click", function(){

        if(firstGroup === null){

            firstGroup = getGroup(this);

            firstGroup.forEach(function(c){
                c.style.outline = "3px solid yellow";
                c.style.outlineOffset = "-3px";
            });

        }
        else{
            let secondGroup = getGroup(this);

            if(secondGroup.some(c => firstGroup.includes(c))){
                firstGroup.forEach(c=>c.style.outline="none");
                firstGroup = null;
                return;
            }

            firstGroup = sortGroup(firstGroup);
            secondGroup = sortGroup(secondGroup);

            /* échange complet */
            let min = Math.min(firstGroup.length, secondGroup.length);

            for(let i=0;i<min;i++){

                let temp = firstGroup[i].style.backgroundPosition;

                firstGroup[i].style.backgroundPosition =
                secondGroup[i].style.backgroundPosition;

                secondGroup[i].style.backgroundPosition = temp;

            }
            /* enlever sélection */
            firstGroup.forEach(c=>c.style.outline="none");
            secondGroup.forEach(c=>c.style.outline="none");

            firstGroup = null;

            checkFusion();
            checkWin();

        }

    });

});

/* fusion */
function checkFusion(){

    cells.forEach(function(cell){
        cell.style.borderRight="1px solid black";
        cell.style.borderLeft="1px solid black";
        cell.style.marginRight="0px";
    });

    for(let i=0;i<cells.length;i++){    

        let right=i+1;

        if(i%4!==3){

            let pos1=cells[i].style.backgroundPosition.split(" ");
            let pos2=cells[right].style.backgroundPosition.split(" ");

            let x1=parseFloat(pos1[0]);
            let y1=parseFloat(pos1[1]);

            let x2=parseFloat(pos2[0]);
            let y2=parseFloat(pos2[1]);

            if(
            y1===y2 &&
            (x2 - x1 > 33 && x2 - x1 < 34)
            ){
                cells[i].style.borderRight="none";
                cells[right].style.borderLeft="none";

                cells[i].style.marginRight="-15px";
            }
        }
    }
}

function getGroup(cell){

    let group = [];
    let stack = [cell];

    while(stack.length > 0){

        let current = stack.pop();

        if(group.includes(current)) continue;

        group.push(current);

        let index = Array.from(cells).indexOf(current);
        let style = window.getComputedStyle(current);

        /* droite */
        if(style.borderRightStyle === "none" && index % 4 !== 3){
            stack.push(cells[index+1]);
        }

        /* gauche */
        if(style.borderLeftStyle === "none" && index % 4 !== 0){
            stack.push(cells[index-1]);
        }

    }

    return group;
}

function sortGroup(group){

    return group.sort(function(a,b){
        return Array.from(cells).indexOf(a) - Array.from(cells).indexOf(b);
    });

}

