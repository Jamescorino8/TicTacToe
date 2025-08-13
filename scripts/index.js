
// Tic-Tac-Toe Game Logic


// DOM elements
const turnDisplay = document.getElementById('turnDisplay');
const startBtn = document.getElementById('startBtn');
const titleBtn = document.getElementById('titleBtn');
const endBtn = document.getElementById('endBtn');

// All possible win conditions for a 3x3 board
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

let board;         // Array representing the board state
let xTurn = true;  // true if it's X's turn, false for O
let isComp = false; // true if playing against CPU

// Handles mode selection from the title screen (co-op or CPU)
function titleSelect(mode) {
    isComp = mode === 'comp';
    localStorage.setItem('currentMode', isComp ? 'true' : 'false'); // Store mode selected as string representation
    window.location.href = 'index.html';
}

// Handles a player's move when a cell is clicked
function cellClick(cellNum) {
    const currentCell = document.getElementById(`cell-${cellNum}`);
    isComp = localStorage.getItem('currentMode') === 'true'; // Retrieve selected mode from storage
    
    // Set the board state for this cell
    board[cellNum] = xTurn ? 'X' : 'O';
    // Update turn display
    turnDisplay.textContent = `${xTurn ? 'O' : 'X'}'s Turn`;

    // Update UI for the clicked cell
    currentCell.textContent = board[cellNum];
    currentCell.disabled = true;

    // Check for win or tie
    console.log(board);
    if (isWin(board)) {
        end(xTurn ? 'X' : 'O');
    } else if (isWin(board) === 'tie') {
        end('tie');
    }
    xTurn = !xTurn;

    // If playing against CPU, trigger computer's move
    if (isComp) compTurn();
}


// Handles the computer's move (random open cell)
function compTurn() {
    let openCells = [];
    // Find all empty cells
    board.forEach((cell, i) => { // Change to Array.filter() ???
        if (cell === '') openCells.push(i);
    });

    if (openCells.length === 0) return;

    // Pick a random open cell
    let cellNum = openCells[Math.floor(Math.random() * openCells.length)];
    const currentCell = document.getElementById(`cell-${cellNum}`);

    // Set board and UI for computer's move
    board[cellNum] = 'O';
    currentCell.textContent = board[cellNum];
    currentCell.disabled = true;

    // Check for win or tie
    if (isWin(board)) {
        end('O');
    } else if (isWin(board) === 'tie') {
        end('tie');
    }

    xTurn = !xTurn;
}

// function compMove(openCells) {
//     let boardCopy = [...board];

// }

// Checks if the current board is a win or tie
// Returns true if win, 'tie' if tie, false otherwise
function isWin(currentBoard) {
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
            return true;
        }
    }
    // If all cells are filled and no win, it's a tie
    if (currentBoard.every(cell => cell !== '')) {
        return 'tie';
    }
    return false;
}

// Ends the game, disables board, and displays result
function end(turn) {
    // Disable all non-operator buttons
    const disabledBtns = document.querySelectorAll('button:not(:disabled):not(.operatorBtn)');
    disabledBtns.forEach(btn => btn.disabled = true);
    // Show result message
    if (turn === 'X' || turn === 'O') {
        turnDisplay.textContent = `${turn}'s Win!`;
    } else if (turn === 'tie') {
        turnDisplay.textContent = "It's a tie!";
    } else {
        turnDisplay.textContent = "";
    }
    // Show/hide appropriate buttons
    startBtn.hidden = false;
    titleBtn.hidden = false;
    endBtn.hidden = true;
}

// Starts or restarts the game, resets board and UI
function start() {
    // Enable and reset all board buttons
    const disabledBtns = document.querySelectorAll('button:disabled');
    disabledBtns.forEach(btn => {
        btn.textContent = '⊠';
        btn.disabled = false;
    });

    // Reset game state
    xTurn = true;
    board = ['', '', '',
             '', '', '',
             '', '', ''];
    
    // Set initial turn display
    if (!isComp) turnDisplay.textContent = "X's Turn";
    startBtn.textContent = "Restart";
    startBtn.hidden = true;
    titleBtn.hidden = true;
    endBtn.hidden = false;
}