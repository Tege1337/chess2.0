// Initialize Socket.IO
const socket = io();

// Game state
let board = null;
let game = null;
let playerColor = null;
let gameId = null;

// UI Elements
const startScreen = document.getElementById('startScreen');
const waitingScreen = document.getElementById('waitingScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const disconnectScreen = document.getElementById('disconnectScreen');

const findGameBtn = document.getElementById('findGameBtn');
const newGameBtn = document.getElementById('newGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

const playerColorElement = document.getElementById('playerColor');
const turnIndicator = document.getElementById('turnIndicator');
const gameStatus = document.getElementById('gameStatus');
const gameResult = document.getElementById('gameResult');

// Show specific screen
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Initialize the chess board
function initBoard(orientation) {
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'lib/img/chesspieces/wikipedia/{piece}.png',
        orientation: orientation
    };
    
    board = ChessBoard('board', config);
    game = new Chess();
    
    // Resize board to fit container
    window.setTimeout(() => board.resize(), 0);
    
    // Update UI
    updateStatus();
}

// Check if it's player's turn
function onDragStart(source, piece, position, orientation) {
    // Don't pick up pieces if game is over
    if (game.isGameOver()) return false;

    // Only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }

    // Don't allow moves if it's not player's turn
    if ((playerColor === 'white' && game.turn() !== 'w') ||
        (playerColor === 'black' && game.turn() !== 'b')) {
        return false;
    }
}

// Handle piece drop
function onDrop(source, target) {
    // Check if move is a promotion
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });

    // Illegal move
    if (move === null) return 'snapback';

    // Send move to server
    socket.emit('move', {
        from: source,
        to: target,
        promotion: 'q'
    });

    // The server will broadcast the move back, so we'll update then
    // For now, snapback to show it's processing
    return 'snapback';
}

// Update board after move completes
function onSnapEnd() {
    board.position(game.fen());
}

// Update game status display
function updateStatus() {
    if (!game) return;

    let statusText = '';
    
    // Check game state
    if (game.isCheckmate()) {
        statusText = 'Checkmate!';
    } else if (game.isDraw()) {
        statusText = 'Draw!';
    } else if (game.isStalemate()) {
        statusText = 'Stalemate!';
    } else if (game.isThreefoldRepetition()) {
        statusText = 'Draw (Threefold Repetition)';
    } else if (game.isInsufficientMaterial()) {
        statusText = 'Draw (Insufficient Material)';
    } else if (game.isCheck()) {
        statusText = 'Check!';
        gameStatus.classList.add('check');
        setTimeout(() => gameStatus.classList.remove('check'), 500);
    } else {
        statusText = '';
        gameStatus.classList.remove('check');
    }
    
    gameStatus.textContent = statusText;

    // Update turn indicator
    const isPlayerTurn = (playerColor === 'white' && game.turn() === 'w') ||
                         (playerColor === 'black' && game.turn() === 'b');
    
    if (isPlayerTurn) {
        turnIndicator.textContent = 'Your Turn';
        turnIndicator.className = 'turn-indicator your-turn';
    } else {
        turnIndicator.textContent = "Opponent's Turn";
        turnIndicator.className = 'turn-indicator opponent-turn';
    }
}

// Socket event handlers
socket.on('waiting', () => {
    showScreen(waitingScreen);
});

socket.on('gameStart', (data) => {
    gameId = data.gameId;
    playerColor = data.color;
    
    // Initialize board with correct orientation
    initBoard(playerColor);
    
    // Update player color display
    playerColorElement.textContent = `You are playing as ${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}`;
    playerColorElement.className = `player-badge ${playerColor}`;
    
    showScreen(gameScreen);
    console.log(`Game started! You are ${playerColor}`);
});

socket.on('moveMade', (data) => {
    // Update game state
    game.load(data.fen);
    board.position(data.fen);
    
    // Update status
    updateStatus();
});

socket.on('invalidMove', (message) => {
    console.log('Invalid move:', message);
    // Reset board to current position
    board.position(game.fen());
});

socket.on('check', () => {
    console.log('Check!');
});

socket.on('gameOver', (data) => {
    gameResult.textContent = data.result;
    setTimeout(() => {
        showScreen(gameOverScreen);
    }, 2000);
});

socket.on('opponentDisconnected', () => {
    showScreen(disconnectScreen);
});

socket.on('error', (message) => {
    console.error('Error:', message);
});

// Button event listeners
findGameBtn.addEventListener('click', () => {
    socket.emit('findGame');
});

newGameBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to start a new game? This will abandon the current game.')) {
        location.reload();
    }
});

playAgainBtn.addEventListener('click', () => {
    location.reload();
});

backToMenuBtn.addEventListener('click', () => {
    location.reload();
});

// Handle page visibility to detect if user navigates away
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameId) {
        // User navigated away, socket will handle disconnect
    }
});
