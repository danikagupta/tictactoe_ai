class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.player1 = { name: 'Human', type: 'human', symbol: 'X' };
        this.player2 = { name: 'Computer', type: 'computer', symbol: 'O' };
        this.victoryOverlay = document.getElementById('victory-overlay');
        this.victoryMessage = document.querySelector('.victory-message');
        this.historyList = document.getElementById('history-list');
        this.totalGamesElement = document.getElementById('total-games');
        this.totalDrawsElement = document.getElementById('total-draws');
        
        // Initialize game statistics
        this.stats = {
            totalGames: 0,
            totalDraws: 0
        };

        // Load history from localStorage if available
        this.loadHistory();
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        this.initializeGame();
    }

    initializeGame() {
        // DOM elements
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('status');
        this.startButton = document.getElementById('startGame');
        this.player1NameInput = document.getElementById('player1Name');
        this.player1TypeSelect = document.getElementById('player1Type');
        this.player2NameInput = document.getElementById('player2Name');
        this.player2TypeSelect = document.getElementById('player2Type');

        // Event listeners
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.startButton.addEventListener('click', () => this.startNewGame());
    }

    startNewGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.hideVictoryOverlay();
        
        // Update player configurations
        this.player1.name = this.player1NameInput.value || 'Player 1';
        this.player1.type = this.player1TypeSelect.value;
        this.player2.name = this.player2NameInput.value || 'Player 2';
        this.player2.type = this.player2TypeSelect.value;

        // Reset the board display
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
            cell.style.backgroundColor = ''; // Reset background color
        });

        this.updateStatus(`${this.getCurrentPlayerName()}'s turn`);

        // If first player is computer, make its move
        if (this.getCurrentPlayerType() === 'computer') {
            this.makeComputerMove();
        }
    }

    getCurrentPlayerName() {
        return this.currentPlayer === 'X' ? this.player1.name : this.player2.name;
    }

    getCurrentPlayerType() {
        return this.currentPlayer === 'X' ? this.player1.type : this.player2.type;
    }

    updateStatus(message) {
        this.statusDisplay.textContent = message;
    }

    handleCellClick(cell) {
        const index = cell.getAttribute('data-index');

        if (!this.gameActive || this.board[index] !== '' || 
            this.getCurrentPlayerType() === 'computer') {
            return;
        }

        this.makeMove(index);
    }

    makeMove(index) {
        if (this.board[index] !== '') {
            return false; // Cell is already occupied
        }

        this.board[index] = this.currentPlayer;
        const cell = this.cells[index];
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());

        if (this.checkWin()) {
            this.gameActive = false;
            const winner = this.getCurrentPlayerName();
            this.addToHistory(winner);
            this.showVictory(`${winner} wins!`);
            return true;
        }

        if (this.checkDraw()) {
            this.gameActive = false;
            this.addToHistory(null); // null indicates a draw
            this.updateStatus("Game ended in a draw!");
            return true;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus(`${this.getCurrentPlayerName()}'s turn`);

        // If next player is computer, make its move after a short delay
        if (this.getCurrentPlayerType() === 'computer' && this.gameActive) {
            setTimeout(() => this.makeComputerMove(), 700);
        }
    }

    makeComputerMove() {
        if (!this.gameActive) return;

        const availableMoves = this.available_moves();

        // Make a strategic move
        let move = this.findWinningMove(availableMoves) || 
                  this.findBlockingMove(availableMoves) || 
                  this.findStrategicMove(availableMoves) ||
                  availableMoves[Math.floor(Math.random() * availableMoves.length)];

        this.makeMove(move);
    }

    available_moves() {
        return this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);
    }

    findWinningMove(availableMoves) {
        return this.findBestMove(availableMoves, this.currentPlayer);
    }

    findBlockingMove(availableMoves) {
        const opponent = this.currentPlayer === 'X' ? 'O' : 'X';
        // Try each available move and see if it would result in a win for the opponent
        for (let move of availableMoves) {
            this.board[move] = opponent;
            if (this.checkWin(false)) {
                this.board[move] = '';
                return move;
            }
            this.board[move] = '';
        }
        return null;
    }

    findBestMove(availableMoves, player) {
        for (let move of availableMoves) {
            this.board[move] = player;
            if (this.checkWin(false)) {
                this.board[move] = '';
                return move;
            }
            this.board[move] = '';
        }
        return null;
    }

    findStrategicMove(availableMoves) {
        // Try to take center if available
        if (availableMoves.includes(4)) return 4;
        
        // Try to take corners
        const corners = [0, 2, 6, 8].filter(corner => availableMoves.includes(corner));
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        return null;
    }

    checkWin(updateBoard = true) {
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                if (updateBoard) {
                    this.highlightWinningCombination(combination);
                }
                return true;
            }
        }
        return false;
    }

    highlightWinningCombination(combination) {
        combination.forEach(index => {
            this.cells[index].style.backgroundColor = '#9ae6b4';
        });
    }

    showVictory(message) {
        this.updateStatus(message);
        this.victoryMessage.textContent = message;
        this.victoryOverlay.classList.remove('hidden');
        
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Add click listener to dismiss the overlay
        const dismissHandler = () => {
            this.hideVictoryOverlay();
            this.victoryOverlay.removeEventListener('click', dismissHandler);
        };
        this.victoryOverlay.addEventListener('click', dismissHandler);
    }

    hideVictoryOverlay() {
        this.victoryOverlay.classList.add('hidden');
    }

    addToHistory(winner) {
        const timestamp = new Date().toLocaleString();
        const gameResult = {
            winner: winner,
            player1: this.player1.name,
            player2: this.player2.name,
            timestamp: timestamp
        };

        // Create history entry element
        const entry = document.createElement('div');
        entry.className = `history-entry ${winner ? 'win' : 'draw'}`;
        
        const resultText = winner ? 
            `<div class="winner">${winner} won!</div>` :
            `<div class="winner">Draw</div>`;
            
        entry.innerHTML = `
            ${resultText}
            <div class="players">${this.player1.name} vs ${this.player2.name}</div>
            <div class="timestamp">${timestamp}</div>
        `;

        // Add to the beginning of the history list
        this.historyList.insertBefore(entry, this.historyList.firstChild);

        // Update stats
        this.stats.totalGames++;
        if (!winner) this.stats.totalDraws++;

        // Update display
        this.totalGamesElement.textContent = this.stats.totalGames;
        this.totalDrawsElement.textContent = this.stats.totalDraws;

        // Save to localStorage
        this.saveHistory();
    }

    loadHistory() {
        const savedStats = localStorage.getItem('tictactoe_stats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
            this.totalGamesElement.textContent = this.stats.totalGames;
            this.totalDrawsElement.textContent = this.stats.totalDraws;
        }

        const savedHistory = localStorage.getItem('tictactoe_history');
        if (savedHistory) {
            const history = JSON.parse(savedHistory);
            history.forEach(game => {
                const entry = document.createElement('div');
                entry.className = `history-entry ${game.winner ? 'win' : 'draw'}`;
                
                const resultText = game.winner ? 
                    `<div class="winner">${game.winner} won!</div>` :
                    `<div class="winner">Draw</div>`;
                    
                entry.innerHTML = `
                    ${resultText}
                    <div class="players">${game.player1} vs ${game.player2}</div>
                    <div class="timestamp">${game.timestamp}</div>
                `;
                
                this.historyList.appendChild(entry);
            });
        }
    }

    saveHistory() {
        // Save stats
        localStorage.setItem('tictactoe_stats', JSON.stringify(this.stats));

        // Save last 20 games
        const historyEntries = Array.from(this.historyList.children)
            .slice(0, 20)
            .map(entry => ({
                winner: entry.querySelector('.winner').textContent.replace(' won!', ''),
                player1: entry.querySelector('.players').textContent.split(' vs ')[0],
                player2: entry.querySelector('.players').textContent.split(' vs ')[1],
                timestamp: entry.querySelector('.timestamp').textContent
            }));

        localStorage.setItem('tictactoe_history', JSON.stringify(historyEntries));
    }

    checkDraw() {
        return !this.board.includes('');
    }
}

// Export the TicTacToe class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicTacToe;
} else {
    // Initialize the game when the page loads in browser
    document.addEventListener('DOMContentLoaded', () => {
        new TicTacToe();
    });
}
