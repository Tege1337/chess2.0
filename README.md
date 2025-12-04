# Online Chess 2.0 ♟️

An online multiplayer chess application where you can play with friends from different devices, similar to chess.com.

## Features

- 🎮 **Real-time Multiplayer** - Play chess with friends or random opponents in real-time
- 🌐 **Cross-Device Compatible** - Play from any device with a web browser
- ♟️ **Full Chess Rules** - Complete implementation of chess rules including castling, en passant, and pawn promotion
- 🎨 **Clean UI** - Beautiful, responsive interface inspired by chess.com
- 🔄 **Auto-Matchmaking** - Automatic pairing with available players
- ⚡ **Instant Updates** - Moves are synchronized in real-time using WebSockets
- 🎯 **Game State Detection** - Automatically detects checkmate, stalemate, and draw conditions
- 👥 **Disconnect Handling** - Gracefully handles player disconnections

## Technologies Used

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript
- **Chess Logic**: chess.js
- **Chess Board UI**: chessboard.js

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Tege1337/chess2.0.git
cd chess2.0
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

1. **Start the Application**: Open the app in your browser
2. **Find a Game**: Click "Find Game" to join the matchmaking queue
3. **Wait for Opponent**: The app will automatically pair you with another player
4. **Play Chess**: Make moves by dragging and dropping pieces
5. **Game End**: The game ends when there's checkmate, stalemate, or draw

## Playing with Friends

To play with a friend:
1. One person starts the server (or deploy to a hosting service)
2. Share the URL with your friend
3. Both click "Find Game" at roughly the same time
4. You'll be automatically matched!

## Deployment

You can easily deploy this app to platforms like:
- **Heroku**: `git push heroku main`
- **Railway**: Connect your GitHub repository
- **Render**: Connect your GitHub repository
- **Vercel/Netlify**: (Requires slight configuration for WebSocket support)

Make sure to set the `PORT` environment variable if deploying to a platform that requires it.

## Project Structure

```
chess2.0/
├── server.js           # Node.js server with Socket.IO
├── package.json        # Project dependencies
├── public/
│   ├── index.html     # Main HTML page
│   ├── style.css      # Styling
│   └── game.js        # Client-side game logic
└── README.md          # This file
```

## Development

To run in development mode:
```bash
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable:
```bash
PORT=8080 npm start
```

## Game Rules

The application implements all standard chess rules:
- ✅ Piece movement validation
- ✅ Check and checkmate detection
- ✅ Castling (king-side and queen-side)
- ✅ En passant captures
- ✅ Pawn promotion
- ✅ Stalemate detection
- ✅ Threefold repetition
- ✅ Insufficient material
- ✅ Turn-based gameplay

## Future Enhancements

Potential features to add:
- User authentication and accounts
- Game history and replays
- Player ratings (ELO system)
- Chat functionality
- Private game rooms with invite codes
- Time controls (blitz, rapid, classical)
- Game analysis and move suggestions
- Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC
