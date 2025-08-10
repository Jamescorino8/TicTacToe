const turnDisplay = document.getElementById('turnDisplay');
const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                       [0, 3, 6], [1, 4, 7], [2, 5, 8],
                       [0, 4, 8], [2, 4, 6]];

let board;

// let isRunning = true;
let xTurn = true;

function cellClick(cellNum) {
    const currentCell = document.getElementById(`cell-${cellNum}`);
    
    board[cellNum] = xTurn ? 'X' : 'O';
    turnDisplay.textContent = `${xTurn ? 'O' : 'X'}'s Turn`;

    currentCell.textContent = board[cellNum];
    currentCell.disabled = true;
    
    checkWin() ? (turnDisplay.textContent = `${xTurn ? 'X' : 'O'}'s WIN`) : null;
    
    xTurn = !xTurn;
    console.log(board);
}

function checkWin() {
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
}

function start() {
    const disabledBtns = document.querySelectorAll('button:disabled');
    disabledBtns.forEach(btn => {
        btn.textContent = '⊠';
        btn.disabled = false;
    });

    board = ['⊠', '⊠', '⊠',
             '⊠', '⊠', '⊠',
             '⊠', '⊠', '⊠'];

    turnDisplay.textContent = "X's Turn";
}