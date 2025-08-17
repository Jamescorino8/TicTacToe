// Tic-Tac-Toe Game Logic

// DOM elements
const turnDisplay = document.getElementById('turnDisplay');
const startBtn = document.getElementById('startBtn');
const titleBtn = document.getElementById('titleBtn');
const endBtn = document.getElementById('endBtn');
const onlineBtn = document.getElementById('onlineBtn');
const cells = document.getElementById('cells');
const markerContainer = document.getElementById('marker-container'); 
const operatorContainer = document.getElementById('operator-container');
const titleContainer = document.getElementById('title-container');
const onlineDisplay = document.getElementById('online-display');

// All possible win conditions for a 3x3 board
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

let board; // Array representing the board state
let xTurn; // true if it's X's turn, false for O
let mode; // Retrieve selected mode from storage

// Initialize socket variable (will be assigned if online mode)
let socket;

// Player-specific variables for online mode
let myMarker; // 'X' or 'O' for this player
let myTurn = false; // true if it's this player's turn
let roomId; // Player's entered room ID

// Handles mode selection from the title screen (co-op, cpu, or online)
function modeSelect(selectedMode) {
    mode = selectedMode;
    if (mode === 'online') {
        if (!socket) socket = io(); // Initialize socket.io for online mode (only once)
        roomId = prompt("Enter Room ID"); // TODO require input or fix cancel
        socket.emit('joinRoom', roomId);
        titleContainer.hidden = true;
        // Skip marker selection (P1 = 'X', P2 = 'O')
        operatorContainer.style.display = 'flex';
        startBtn.hidden = true;
        startBtn.textContent = "restart?";
        onlineDisplay.hidden = false;
        turnDisplay.hidden = false;

        // Listen for marker assignment
        socket.on('markerAssigned', (marker) => {
            myMarker = marker;
            xTurn = marker === 'X';
            myTurn = xTurn;
            // Display room ID with assigned marker
            onlineDisplay.textContent = `Room ID: ${roomId} | Marker: ${myMarker}`;
        });

        // Listen for waiting status
        socket.on('waiting', () => {
            turnDisplay.textContent = 'Waiting for player...';
            titleBtn.hidden = false;
        });

        // Listen for game start
        socket.on('startGame', () => {
            cells.style.display = 'grid';
            start();
            turnDisplay.textContent = `X's Turn`;
        });

        // Listen for when player leaves
        socket.on('playerLeft', () => {
            cells.style.display = 'none';
            startBtn.hidden = true;
            turnDisplay.innerHTML = `<h2 id="turnDisplay">Player Left.</h2>
                                     <h2 id="turnDisplay">Waiting for new player...</h2>`;
        });

        // Listen for moves from other player
        socket.on('move', (data) => {
            const currentCell = document.getElementById(`cell-${data.cellNum}`);
            board[data.cellNum] = data.symbol;
            currentCell.textContent = data.symbol;
            currentCell.disabled = true;
            // Update turn
            xTurn = !xTurn;
            myTurn = true;
            turnDisplay.textContent = `${myMarker}'s Turn`;
        });

        // Listen for game end from server
        socket.on('gameEnd', (result) => {
            end(result);
        });

        // Listen if player gives up
        socket.on('giveUp', (marker) => {
            const disabledBtns = document.querySelectorAll('#cells button');
            disabledBtns.forEach(btn => btn.disabled = true);
            startBtn.hidden = false;
            titleBtn.hidden = false;
            endBtn.hidden = true;
            turnDisplay.textContent = `${marker}'s Forfeit!`;
        });

        // // Listen for restart
        socket.on('restart', () => {
            const disabledBtns = document.querySelectorAll('#cells button');
            disabledBtns.forEach(btn => {
                btn.textContent = '⊠';
                btn.disabled = false;
            });
            board = ['', '', '',
                     '', '', '',
                     '', '', ''];
            turnDisplay.textContent = `X's Turn`;
            myTurn = myMarker === 'X';
            startBtn.hidden = true;
            titleBtn.hidden = true;
            endBtn.hidden = false;
        });
    } else {
        titleContainer.hidden = true;
        markerContainer.hidden = false;
        operatorContainer.style = 'flex';
        titleBtn.hidden = false;
    }
}

// Retrieve user's selected marker
function selectMarker(marker) {
    localStorage.setItem('selectedMarker', marker);
    xTurn = marker === 'X';
    markerContainer.hidden = true;
    startBtn.hidden = false;
    cells.style.display = 'grid';
}

// Handles a player's move when a cell is clicked
function cellClick(cellNum) {
    const currentCell = document.getElementById(`cell-${cellNum}`);

    if (mode === 'online') {
        // Only allow move if it's your turn and cell is empty
        if (!myTurn || board[cellNum]) return;

        socket.emit('move', { cellNum, symbol: myMarker });
        board[cellNum] = myMarker;
        currentCell.textContent = myMarker;
        currentCell.disabled = true;
        // Update turn
        xTurn = !xTurn;
        myTurn = false;
        turnDisplay.textContent = `${myMarker === 'X' ? 'O' : 'X'}'s Turn`;
        // Win/tie check
        const result = getGameResult(board);
        if (result === 'X' || result === 'O' || result === 'tie') {
            socket.emit('gameEnd', result); 
            return;
        }
        return;
    } else {
        // Local/CPU mode
        board[cellNum] = xTurn ? 'X' : 'O';
        if (mode === 'coop') turnDisplay.textContent = `${xTurn ? 'O' : 'X'}'s Turn`;
        currentCell.textContent = board[cellNum];
        currentCell.disabled = true;
        const result = getGameResult(board);
        if (result === 'X' || result === 'O') {
            end(result);
            return;
        } else if (result === 'tie') {
            end('tie');
            return;
        }
        xTurn = !xTurn;
        if (mode === 'cpu') compTurn();
    }
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
    let cellNum = compMove(openCells);
    const currentCell = document.getElementById(`cell-${cellNum}`);

    // Set board and UI for computer's move
    board[cellNum] = xTurn ? 'X' : 'O';
    currentCell.textContent = board[cellNum];
    currentCell.disabled = true;

    // Win/tie check
    const result = getGameResult(board);
    if (result === 'X' || result === 'O') {
        end(result);
        return;
    } else if (result === 'tie') {
        end('tie');
        return;
    }

    xTurn = !xTurn;
}

// Find optimal move for CPU
// Return index of best possible move on board, otherwise random.
function compMove(openCells) {
    let optimalMove = openCells[Math.floor(Math.random() * openCells.length)];

    // Check if opponent one move away from win and return index to defend loss
    for (let i = 0; i < openCells.length; i++) {
        let boardCopy = [...board];
        boardCopy[openCells[i]] = xTurn ? 'O' : 'X';
        const result = getGameResult(boardCopy);
        if (result === (xTurn ? 'O' : 'X')) {
            optimalMove = openCells[i];
        }
    }
    // Check if O's are one move away from win and return index to win
    // Override previous optimal move to prioritize winning over blocking
    for (let i = 0; i < openCells.length; i++) {
        let boardCopy = [...board];
        boardCopy[openCells[i]] = xTurn ? 'X' : 'O';
        const result = getGameResult(boardCopy);
        if (result === (xTurn ? 'X' : 'O')) {
            optimalMove = openCells[i];
        }
    }
    return optimalMove;
}

// Checks for a win or tie
// Returns 'X' or 'O' if there is a winner, 'tie' if tie, or null if game continues
function getGameResult(currentBoard) {
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (
            currentBoard[a] &&
            currentBoard[a] === currentBoard[b] &&
            currentBoard[a] === currentBoard[c]
        ) {
            return currentBoard[a]; // Return 'X' or 'O'
        }
    }
    if (currentBoard.every(cell => cell !== '')) {
        return 'tie';
    }
    return null;
}

// Ends the game, disables board, and displays result
function end(condition) {
    // Disable all cell buttons
    const disabledBtns = document.querySelectorAll('#cells button');
    disabledBtns.forEach(btn => btn.disabled = true);
    // Show result message
    if (condition === 'X' || condition === 'O') {
        turnDisplay.textContent = `${condition}'s Win!`;
    } else if (condition === 'tie') {
        turnDisplay.textContent = "It's a tie!";
    } else {
        turnDisplay.textContent = "";
        if (mode === 'online') socket.emit('giveUp', myMarker); 
    }
    // Show/hide appropriate buttons
    startBtn.hidden = false;
    titleBtn.hidden = false;
    endBtn.hidden = true;
}

// Starts or restarts the game, resets board and UI
function start() {
    if (mode === 'online') {
        socket.emit('restart');
        return;
    }
    // Enable and reset all board buttons
    const disabledBtns = document.querySelectorAll('#cells button');
    disabledBtns.forEach(btn => {
        btn.textContent = '⊠';
        btn.disabled = false;
    });

    // Reset game state
    if (mode !== 'online') xTurn = localStorage.getItem('selectedMarker') === 'X'; // Retrieve selected marker from storage
    board = ['', '', '',
             '', '', '',
             '', '', ''];
    
    // Set initial turn display
    turnDisplay.textContent = "";
    if (mode === 'coop') xTurn ? turnDisplay.textContent = "X's Turn" : turnDisplay.textContent = "O's Turn";
    startBtn.textContent = "restart?";
    startBtn.hidden = true;
    titleBtn.hidden = true;
    endBtn.hidden = false;
    // xTurn = myMarker === 'X';
}

// Reset UI and game state to default (SPA style)
function resetToTitleScreen() {
    // Hide all game containers
    markerContainer.hidden = true;
    cells.style.display = 'none';
    operatorContainer.style.display = 'none';
    titleContainer.hidden = false;
    turnDisplay.textContent = "";
    startBtn.hidden = true;
    startBtn.textContent = "Start";

    const disabledBtns = document.querySelectorAll('button:disabled');
    disabledBtns.forEach(btn => {
        btn.textContent = '⊠';
    });

    if (mode === 'online') {
        onlineDisplay.hidden = true;
        turnDisplay.hidden = true;
        socket.emit('manual-disconnect');
        return;
    }

    board = undefined; // Reset array representing the board state
    xTurn = undefined; // Reset true if it's X's turn, false for O
    mode = undefined; // Reset selected mode
}