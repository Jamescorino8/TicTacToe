const turnDisplay = document.getElementById('turnDisplay');
const startBtn = document.getElementById('startBtn');
const endBtn = document.getElementById('endBtn');
const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                       [0, 3, 6], [1, 4, 7], [2, 5, 8],
                       [0, 4, 8], [2, 4, 6]];

let board;
let xTurn = true;

function cellClick(cellNum) {
    const currentCell = document.getElementById(`cell-${cellNum}`);
    
    board[cellNum] = xTurn ? 'X' : 'O';
    turnDisplay.textContent = `${xTurn ? 'O' : 'X'}'s Turn`;

    currentCell.textContent = board[cellNum];
    currentCell.disabled = true;
    
    isWin();
    
    xTurn = !xTurn;
}

function isWin() {
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            end(board[a]);
        }
    }
    if (board.every(cell => cell !== '')) {
        end('tie');
    }
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
    
    turnDisplay.textContent = "X's Turn";
    startBtn.textContent = "Restart";
    startBtn.hidden = true;
    endBtn.hidden = false;
}