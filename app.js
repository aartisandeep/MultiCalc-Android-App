const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const PORT = 3000;

// Initial number of stones in each pile
let stones = {
    pile1: 8,
    pile2: 5,
    pile3: 6
};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for Player 1
app.get('/player1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player1.html'));
});

// Route for Player 2
app.get('/player2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player2.html'));
});

// Event handler for new connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Track the current player
    let currentPlayer = 'player1';

    // Event handler for 'join' event
    socket.on('join', (player) => {
        console.log(player + ' joined the game');
        socket.emit('updateStones', stones);
    });

    // Event handler for 'makeMove' event
    socket.on('makeMove', ({ player, pile, stones: numStones }) => {
        let selectedPile = 'pile' + pile;
        if (numStones >= 1 && numStones <= 3 && numStones <= stones[selectedPile]) {
            stones[selectedPile] -= numStones;
            io.emit('updateStones', stones);
            checkGameOver(player);
        }
    });

    // Function to check if the game is over
    function checkGameOver(player) {
        if (stones.pile1 === 0 && stones.pile2 === 0 && stones.pile3 === 0) {
            // Emit 'gameOver' event with the losing player
            io.emit('gameOver', player);
        } else {
            // Switch the current player
            currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
            // Emit 'updateCurrentPlayer' event with the current player
            io.emit('updateCurrentPlayer', currentPlayer);
        }
    }

    // Event handler for 'disconnect' event
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
