const turnDisplay = document.getElementById('turnDisplay');
const startBtn = document.getElementById('startBtn');
const titleBtn = document.getElementById('titleBtn');
const endBtn = document.getElementById('endBtn');
const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                       [0, 3, 6], [1, 4, 7], [2, 5, 8],
                       [0, 4, 8], [2, 4, 6]];

let board;
let xTurn = true;
let isComp = false;

function titleSelect(mode) {
    console.log(mode);
    isComp = mode === 'comp';
    localStorage.setItem('currentMode', isComp ? 'true' : 'false');
    window.location.href = 'index.html';
}

function cellClick(cellNum) {
    const currentCell = document.getElementById(`cell-${cellNum}`);
    isComp = localStorage.getItem('currentMode') === 'true';
    
    board[cellNum] = xTurn ? 'X' : 'O';
    turnDisplay.textContent = `${xTurn ? 'O' : 'X'}'s Turn`;

    currentCell.textContent = board[cellNum];
    currentCell.disabled = true;

    if (isWin(board)) {
        end(xTurn ? 'X' : 'O');
    } else if (isWin(board) === 'tie') {
        end('tie');
    }
    xTurn = !xTurn;

    if (isComp) compTurn();
}

function compTurn() {
    let openCells = [];
    board.forEach((cell, i) => {
        if (cell === '') openCells.push(i);
    });

    let cellNum = openCells[Math.floor(Math.random() * openCells.length)];
    const currentCell = document.getElementById(`cell-${cellNum}`);

    board[cellNum] = 'O';
    currentCell.textContent = board[cellNum];
    currentCell.disabled = true;

    if (isWin(board)) {
        end(xTurn ? 'X' : 'O');
    } else if (isWin(board) === 'tie') {
        end('tie');
    }

    xTurn = !xTurn;
}

function compMove(openCells) {
    let cellNum;
    let cells = openCells;
    let boardCopy = [...board];
    for (let i = 0; i < boardCopy.length; i++) {
        
    }
}

function isWin(currentBoard) {
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
            // end(board[a]);
            return true;
        }
    }
    if (currentBoard.every(cell => cell !== '')) {
        // end('tie');
        return 'tie';
    }
    return false;
}

function end(turn) {
    const disabledBtns = document.querySelectorAll('button:not(:disabled):not(.operatorBtn)');
    disabledBtns.forEach(btn => btn.disabled = true);
    if (turn === 'X' || turn === 'O') {
        turnDisplay.textContent = `${turn}'s Win!`;
    } else if (turn === 'tie') {
        turnDisplay.textContent = "It's a tie!";
    } else {
        turnDisplay.textContent = "";
    }
    startBtn.hidden = false;
    titleBtn.hidden = false;
    endBtn.hidden = true;
}

function start() {
    const disabledBtns = document.querySelectorAll('button:disabled');
    disabledBtns.forEach(btn => {
        btn.textContent = '⊠';
        btn.disabled = false;
    });

    xTurn = true;
    board = ['', '', '',
             '', '', '',
             '', '', ''];
    
    if (!isComp) turnDisplay.textContent = "X's Turn";
    startBtn.textContent = "Restart";
    startBtn.hidden = true;
    titleBtn.hidden = true;
    endBtn.hidden = false;
}