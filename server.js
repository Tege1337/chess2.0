const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static('public'));

// Store active games
const games = new Map();
// Store waiting players
const waitingPlayers = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle player joining queue
  socket.on('findGame', () => {
    if (waitingPlayers.length > 0) {
      // Match with waiting player
      const opponent = waitingPlayers.shift();
      const gameId = `${socket.id}-${opponent.id}`;
      
      // Randomly assign colors
      const isSocketWhite = Math.random() < 0.5;
      const whitePlayer = isSocketWhite ? socket.id : opponent.id;
      const blackPlayer = isSocketWhite ? opponent.id : socket.id;
      
      // Create new game
      const game = {
        id: gameId,
        chess: new Chess(),
        white: whitePlayer,
        black: blackPlayer,
        turn: 'w'
      };
      
      games.set(gameId, game);
      
      // Join both players to game room
      socket.join(gameId);
      opponent.join(gameId);
      
      // Store game ID in socket data
      socket.data.gameId = gameId;
      opponent.data.gameId = gameId;
      
      // Notify both players
      socket.emit('gameStart', {
        gameId: gameId,
        color: isSocketWhite ? 'white' : 'black',
        fen: game.chess.fen()
      });
      
      opponent.emit('gameStart', {
        gameId: gameId,
        color: isSocketWhite ? 'black' : 'white',
        fen: game.chess.fen()
      });
      
      console.log(`Game started: ${gameId}`);
    } else {
      // Add to waiting queue
      waitingPlayers.push(socket);
      socket.emit('waiting');
      console.log('Player waiting:', socket.id);
    }
  });

  // Handle moves
  socket.on('move', (data) => {
    const gameId = socket.data.gameId;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }
    
    // Verify it's player's turn
    const playerColor = game.white === socket.id ? 'w' : 'b';
    if (game.chess.turn() !== playerColor) {
      socket.emit('error', 'Not your turn');
      return;
    }
    
    try {
      // Make move
      const move = game.chess.move({
        from: data.from,
        to: data.to,
        promotion: data.promotion || 'q'
      });
      
      if (move) {
        // Broadcast move to both players
        io.to(gameId).emit('moveMade', {
          move: move,
          fen: game.chess.fen(),
          turn: game.chess.turn()
        });
        
        // Check game status
        if (game.chess.isGameOver()) {
          let result = '';
          if (game.chess.isCheckmate()) {
            result = game.chess.turn() === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!';
          } else if (game.chess.isDraw()) {
            result = 'Draw!';
          } else if (game.chess.isStalemate()) {
            result = 'Draw by stalemate!';
          } else if (game.chess.isThreefoldRepetition()) {
            result = 'Draw by threefold repetition!';
          } else if (game.chess.isInsufficientMaterial()) {
            result = 'Draw by insufficient material!';
          }
          
          io.to(gameId).emit('gameOver', { result });
        } else if (game.chess.isCheck()) {
          io.to(gameId).emit('check');
        }
      } else {
        socket.emit('invalidMove', 'Invalid move');
      }
    } catch (error) {
      socket.emit('error', 'Invalid move');
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from waiting queue
    const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }
    
    // Handle game disconnection
    const gameId = socket.data.gameId;
    if (gameId) {
      const game = games.get(gameId);
      if (game) {
        // Notify opponent
        socket.to(gameId).emit('opponentDisconnected');
        games.delete(gameId);
      }
    }
  });

  // Handle rematch
  socket.on('rematch', () => {
    const gameId = socket.data.gameId;
    if (gameId) {
      socket.to(gameId).emit('rematchRequested');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chess server running on port ${PORT}`);
});
