/**
 * @jest-environment jsdom
 */

describe('TicTacToe Game', () => {
    let game;
    let container;

    beforeEach(() => {
        // Set up our document body
        document.body.innerHTML = `
            <div class="app-container">
                <div class="container">
                    <div class="game-setup">
                        <div class="player-setup">
                            <input type="text" id="player1Name" value="Player 1">
                            <select id="player1Type">
                                <option value="human">Human</option>
                                <option value="computer">Computer</option>
                            </select>
                        </div>
                        <div class="player-setup">
                            <input type="text" id="player2Name" value="Player 2">
                            <select id="player2Type">
                                <option value="computer">Computer</option>
                                <option value="human">Human</option>
                            </select>
                        </div>
                        <button id="startGame">Start New Game</button>
                    </div>
                    <div class="game-board">
                        <div class="board">
                            ${Array(9).fill('').map((_, i) => `
                                <div class="cell" data-index="${i}"></div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="game-status">
                        <p id="status">Configure players and click Start New Game</p>
                    </div>
                    <div id="victory-overlay" class="victory-overlay hidden">
                        <div class="victory-message"></div>
                    </div>
                </div>
                <div class="history-panel">
                    <h2>Game History</h2>
                    <div class="history-stats">
                        <div class="stat-box">
                            <h3>Total Games</h3>
                            <p id="total-games">0</p>
                        </div>
                        <div class="stat-box">
                            <h3>Draws</h3>
                            <p id="total-draws">0</p>
                        </div>
                    </div>
                    <div class="history-list" id="history-list"></div>
                </div>
            </div>
        `;

        // Create a new game instance
        const TicTacToe = require('./game.js');
        game = new TicTacToe();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Game Initialization', () => {
        test('should initialize with empty board', () => {
            expect(game.board).toEqual(Array(9).fill(''));
            expect(game.gameActive).toBeFalsy();
        });

        test('should initialize with default player names and types', () => {
            expect(game.player1.name).toBe('Human');
            expect(game.player1.type).toBe('human');
            expect(game.player2.name).toBe('Computer');
            expect(game.player2.type).toBe('computer');
        });
    });

    describe('Game Mechanics', () => {
        beforeEach(() => {
            game.startNewGame();
        });

        test('should start new game correctly', () => {
            expect(game.gameActive).toBeTruthy();
            expect(game.board).toEqual(Array(9).fill(''));
            expect(game.currentPlayer).toBe('X');
        });

        test('should make valid moves', () => {
            game.makeMove(0);
            expect(game.board[0]).toBe('X');
            expect(game.currentPlayer).toBe('O');
        });

        test('should not allow moves on occupied cells', () => {
            game.makeMove(0); // X's move
            const boardStateBefore = [...game.board];
            game.makeMove(0); // Try to move in same spot
            expect(game.board).toEqual(boardStateBefore);
        });

        test('should detect horizontal win', () => {
            // X X X
            // - - -
            // - - -
            game.makeMove(0); // X
            game.makeMove(3); // O
            game.makeMove(1); // X
            game.makeMove(4); // O
            game.makeMove(2); // X wins
            
            expect(game.checkWin()).toBeTruthy();
            expect(game.gameActive).toBeFalsy();
        });

        test('should detect vertical win', () => {
            // X O -
            // X O -
            // X - -
            game.makeMove(0); // X
            game.makeMove(1); // O
            game.makeMove(3); // X
            game.makeMove(4); // O
            game.makeMove(6); // X wins
            
            expect(game.checkWin()).toBeTruthy();
            expect(game.gameActive).toBeFalsy();
        });

        test('should detect diagonal win', () => {
            // X O -
            // O X -
            // - - X
            game.makeMove(0); // X
            game.makeMove(1); // O
            game.makeMove(4); // X
            game.makeMove(3); // O
            game.makeMove(8); // X wins
            
            expect(game.checkWin()).toBeTruthy();
            expect(game.gameActive).toBeFalsy();
        });

        test('should detect draw', () => {
            // X O X
            // X O O
            // O X X
            const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
            moves.forEach(move => game.makeMove(move));
            
            expect(game.checkDraw()).toBeTruthy();
            expect(game.gameActive).toBeFalsy();
        });
    });

    describe('Computer Player', () => {
        beforeEach(() => {
            game.startNewGame();
        });

        test('should make winning move when available', () => {
            // Set up board where computer (O) can win
            // O O -
            // X X -
            // X - -
            game.board = [
                'O', 'O', '',
                'X', 'X', '',
                'X', '', ''
            ];
            
            const move = game.findWinningMove(game.available_moves());
            expect(move).toBe(2); // Should choose position 2 to win
        });

        test('should block opponent winning move', () => {
            // Set up board where opponent (X) could win
            // X X -
            // O O -
            // - - -
            game.board = [
                'X', 'X', '',
                'O', 'O', '',
                '', '', ''
            ];
            game.currentPlayer = 'O'; // Current player is O, needs to block X's win
            
            const move = game.findBlockingMove(game.available_moves());
            expect(move).toBe(2); // Should block position 2
        });
    });

    describe('Game History', () => {
        beforeEach(() => {
            game.startNewGame();
        });

        test('should update history after win', () => {
            // Play a winning game
            game.makeMove(0);
            game.makeMove(3);
            game.makeMove(1);
            game.makeMove(4);
            game.makeMove(2);

            expect(game.stats.totalGames).toBe(1);
            expect(game.stats.totalDraws).toBe(0);
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        test('should update history after draw', () => {
            // Play a draw game
            const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
            moves.forEach(move => game.makeMove(move));

            expect(game.stats.totalGames).toBe(1);
            expect(game.stats.totalDraws).toBe(1);
            expect(localStorage.setItem).toHaveBeenCalled();
        });
    });
});
