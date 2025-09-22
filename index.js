class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.moves = [];
        this.gameState = {
            currentPlayer: this.currentPlayer,
            isInCheck: false,
            isCheckmate: false,
            isStalemate: false,
            moves: this.moves
        };
        this.selectedSquare = null;
        this.validMoves = [];
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Place white pieces
        board[7][0] = { type: 'rook', color: 'white' };
        board[7][1] = { type: 'knight', color: 'white' };
        board[7][2] = { type: 'bishop', color: 'white' };
        board[7][3] = { type: 'queen', color: 'white' };
        board[7][4] = { type: 'king', color: 'white' };
        board[7][5] = { type: 'bishop', color: 'white' };
        board[7][6] = { type: 'knight', color: 'white' };
        board[7][7] = { type: 'rook', color: 'white' };
        
        for (let i = 0; i < 8; i++) {
            board[6][i] = { type: 'pawn', color: 'white' };
        }

        // Place black pieces
        board[0][0] = { type: 'rook', color: 'black' };
        board[0][1] = { type: 'knight', color: 'black' };
        board[0][2] = { type: 'bishop', color: 'black' };
        board[0][3] = { type: 'queen', color: 'black' };
        board[0][4] = { type: 'king', color: 'black' };
        board[0][5] = { type: 'bishop', color: 'black' };
        board[0][6] = { type: 'knight', color: 'black' };
        board[0][7] = { type: 'rook', color: 'black' };
        
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
        }

        return board;
    }

    positionToIndices(position) {
        const fileIndex = position.file.charCodeAt(0) - 'a'.charCodeAt(0);
        const rankIndex = 8 - position.rank;
        return [rankIndex, fileIndex];
    }

    indicesToPosition(rankIndex, fileIndex) {
        const file = String.fromCharCode('a'.charCodeAt(0) + fileIndex);
        const rank = 8 - rankIndex;
        return { file, rank };
    }

    getPieceAt(position) {
        const [rankIndex, fileIndex] = this.positionToIndices(position);
        return this.board[rankIndex][fileIndex];
    }

    setPieceAt(position, piece) {
        const [rankIndex, fileIndex] = this.positionToIndices(position);
        this.board[rankIndex][fileIndex] = piece;
    }

    getValidMoves(position) {
        const piece = this.getPieceAt(position);
        if (!piece || piece.color !== this.currentPlayer) {
            return [];
        }

        const moves = this.generatePieceMoves(position, piece);
        return moves.filter(move => !this.wouldBeInCheckAfterMove(position, move));
    }

    generatePieceMoves(position, piece) {
        switch (piece.type) {
            case 'pawn':
                return this.generatePawnMoves(position, piece.color);
            case 'rook':
                return this.generateRookMoves(position);
            case 'bishop':
                return this.generateBishopMoves(position);
            case 'queen':
                return [...this.generateRookMoves(position), ...this.generateBishopMoves(position)];
            case 'knight':
                return this.generateKnightMoves(position);
            case 'king':
                return this.generateKingMoves(position);
            default:
                return [];
        }
    }

    generatePawnMoves(position, color) {
        const moves = [];
        const [rankIndex, fileIndex] = this.positionToIndices(position);
        const direction = color === 'white' ? -1 : 1;
        const startRank = color === 'white' ? 6 : 1;

        // Forward move
        const newRankIndex = rankIndex + direction;
        if (newRankIndex >= 0 && newRankIndex < 8) {
            if (!this.board[newRankIndex][fileIndex]) {
                moves.push(this.indicesToPosition(newRankIndex, fileIndex));

                // Double move from starting position
                if (rankIndex === startRank && !this.board[newRankIndex + direction][fileIndex]) {
                    moves.push(this.indicesToPosition(newRankIndex + direction, fileIndex));
                }
            }
        }

        // Capture moves
        for (const captureFile of [fileIndex - 1, fileIndex + 1]) {
            if (captureFile >= 0 && captureFile < 8 && newRankIndex >= 0 && newRankIndex < 8) {
                const targetPiece = this.board[newRankIndex][captureFile];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push(this.indicesToPosition(newRankIndex, captureFile));
                }
            }
        }

        return moves;
    }

    generateRookMoves(position) {
        const moves = [];
        const [rankIndex, fileIndex] = this.positionToIndices(position);
        const piece = this.board[rankIndex][fileIndex];

        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dr, df] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRank = rankIndex + dr * i;
                const newFile = fileIndex + df * i;

                if (newRank < 0 || newRank >= 8 || newFile < 0 || newFile >= 8) break;

                const targetPiece = this.board[newRank][newFile];
                if (!targetPiece) {
                    moves.push(this.indicesToPosition(newRank, newFile));
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push(this.indicesToPosition(newRank, newFile));
                    }
                    break;
                }
            }
        }

        return moves;
    }

    generateBishopMoves(position) {
        const moves = [];
        const [rankIndex, fileIndex] = this.positionToIndices(position);
        const piece = this.board[rankIndex][fileIndex];

        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        for (const [dr, df] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRank = rankIndex + dr * i;
                const newFile = fileIndex + df * i;

                if (newRank < 0 || newRank >= 8 || newFile < 0 || newFile >= 8) break;

                const targetPiece = this.board[newRank][newFile];
                if (!targetPiece) {
                    moves.push(this.indicesToPosition(newRank, newFile));
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push(this.indicesToPosition(newRank, newFile));
                    }
                    break;
                }
            }
        }

        return moves;
    }

    generateKnightMoves(position) {
        const moves = [];
        const [rankIndex, fileIndex] = this.positionToIndices(position);
        const piece = this.board[rankIndex][fileIndex];

        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, df] of knightMoves) {
            const newRank = rankIndex + dr;
            const newFile = fileIndex + df;

            if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
                const targetPiece = this.board[newRank][newFile];
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push(this.indicesToPosition(newRank, newFile));
                }
            }
        }

        return moves;
    }

    generateKingMoves(position) {
        const moves = [];
        const [rankIndex, fileIndex] = this.positionToIndices(position);
        const piece = this.board[rankIndex][fileIndex];

        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, df] of kingMoves) {
            const newRank = rankIndex + dr;
            const newFile = fileIndex + df;

            if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
                const targetPiece = this.board[newRank][newFile];
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push(this.indicesToPosition(newRank, newFile));
                }
            }
        }

        return moves;
    }

    wouldBeInCheckAfterMove(from, to) {
        const piece = this.getPieceAt(from);
        const capturedPiece = this.getPieceAt(to);

        // Make the move temporarily
        this.setPieceAt(from, null);
        this.setPieceAt(to, piece);

        const inCheck = this.isInCheck(this.currentPlayer);

        // Undo the move
        this.setPieceAt(from, piece);
        this.setPieceAt(to, capturedPiece);

        return inCheck;
    }

    isInCheck(color) {
        const king = this.getKing(color);
        if (!king) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const piece = this.board[rank][file];
                if (piece && piece.color === opponentColor) {
                    const position = this.indicesToPosition(rank, file);
                    const moves = this.generatePieceMoves(position, piece);
                    if (moves.some(move => move.file === king.file && move.rank === king.rank)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    getKing(color) {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const piece = this.board[rank][file];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return this.indicesToPosition(rank, file);
                }
            }
        }
        return null;
    }

    makeMove(from, to) {
        const piece = this.getPieceAt(from);
        if (!piece) {
            return { success: false, message: 'No piece at source position' };
        }

        if (piece.color !== this.currentPlayer) {
            return { success: false, message: 'Not your piece' };
        }

        const validMoves = this.getValidMoves(from);
        const isValidMove = validMoves.some(move => move.file === to.file && move.rank === to.rank);

        if (!isValidMove) {
            return { success: false, message: 'Invalid move' };
        }

        const capturedPiece = this.getPieceAt(to);

        // Make the move
        this.setPieceAt(from, null);
        this.setPieceAt(to, { ...piece, hasMoved: true });

        const move = {
            from,
            to,
            piece,
            capturedPiece: capturedPiece || undefined,
        };

        this.moves.push(move);
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        this.updateGameState();

        return { success: true };
    }

    updateGameState() {
        const isInCheck = this.isInCheck(this.currentPlayer);
        const hasValidMoves = this.hasValidMoves(this.currentPlayer);

        this.gameState = {
            currentPlayer: this.currentPlayer,
            isInCheck,
            isCheckmate: isInCheck && !hasValidMoves,
            isStalemate: !isInCheck && !hasValidMoves,
            moves: this.moves
        };
    }

    hasValidMoves(color) {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const piece = this.board[rank][file];
                if (piece && piece.color === color) {
                    const position = this.indicesToPosition(rank, file);
                    const validMoves = this.getValidMoves(position);
                    if (validMoves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getGameState() {
        return { ...this.gameState };
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.moves = [];
        this.selectedSquare = null;
        this.validMoves = [];
        this.updateGameState();
    }
}

// Piece symbols
const PIECE_SYMBOLS = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

// Game instance
let chessGame;
let selectedSquare = null;
let validMoves = [];

// Initialize game
function initGame() {
    chessGame = new ChessGame();
    renderBoard();
    updateUI();
    
    // Add event listener for new game button
    document.getElementById('new-game-btn').addEventListener('click', () => {
        chessGame.resetGame();
        selectedSquare = null;
        validMoves = [];
        renderBoard();
        updateUI();
    });
}

// Render the chess board
function renderBoard() {
    const boardElement = document.getElementById('chess-board');
    boardElement.innerHTML = '';
    
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
    
    ranks.forEach(rank => {
        files.forEach(file => {
            const position = { file, rank };
            const square = createSquare(position);
            boardElement.appendChild(square);
        });
    });
}

// Create a chess square
function createSquare(position) {
    const square = document.createElement('div');
    square.className = 'chess-square';
    
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const isLight = (files.indexOf(position.file) + position.rank) % 2 === 1;
    square.classList.add(isLight ? 'light' : 'dark');
    
    // Add highlight classes
    const highlight = getSquareHighlight(position);
    if (highlight) {
        square.classList.add(highlight);
    }
    
    // Add piece if present
    const piece = chessGame.getPieceAt(position);
    if (piece) {
        const pieceElement = createPiece(piece);
        square.appendChild(pieceElement);
    }
    
    // Add click handler
    square.addEventListener('click', () => handleSquareClick(position));
    
    return square;
}

// Create a chess piece element
function createPiece(piece) {
    const pieceElement = document.createElement('div');
    pieceElement.className = `chess-piece ${piece.color}`;
    pieceElement.textContent = PIECE_SYMBOLS[piece.color][piece.type];
    return pieceElement;
}

// Get square highlight type
function getSquareHighlight(position) {
    if (selectedSquare && selectedSquare.file === position.file && selectedSquare.rank === position.rank) {
        return 'selected';
    }
    if (validMoves.some(move => move.file === position.file && move.rank === position.rank)) {
        return 'valid-move';
    }
    if (chessGame.getGameState().isInCheck) {
        const king = chessGame.getKing(chessGame.getGameState().currentPlayer);
        if (king && king.file === position.file && king.rank === position.rank) {
            return 'check';
        }
    }
    return null;
}

// Handle square click
function handleSquareClick(position) {
    if (selectedSquare) {
        // Try to make a move
        const moveResult = chessGame.makeMove(selectedSquare, position);
        if (moveResult.success) {
            selectedSquare = null;
            validMoves = [];
            renderBoard();
            updateUI();
        } else {
            // If move failed, try selecting the new square
            const piece = chessGame.getPieceAt(position);
            if (piece && piece.color === chessGame.getGameState().currentPlayer) {
                selectedSquare = position;
                validMoves = chessGame.getValidMoves(position);
                renderBoard();
            } else {
                selectedSquare = null;
                validMoves = [];
                renderBoard();
            }
        }
    } else {
        // Select a square
        const piece = chessGame.getPieceAt(position);
        if (piece && piece.color === chessGame.getGameState().currentPlayer) {
            selectedSquare = position;
            validMoves = chessGame.getValidMoves(position);
            renderBoard();
        }
    }
}

// Update UI elements
function updateUI() {
    const gameState = chessGame.getGameState();
    const currentPlayerText = document.getElementById('current-player-text');
    const gameStatus = document.getElementById('game-status');
    
    currentPlayerText.textContent = gameState.currentPlayer === 'white' ? 'Brancas' : 'Pretas';
    
    gameStatus.className = 'game-status';
    if (gameState.isCheckmate) {
        gameStatus.textContent = `Xeque-mate! ${gameState.currentPlayer === 'white' ? 'Pretas' : 'Brancas'} vencem!`;
        gameStatus.classList.add('checkmate');
    } else if (gameState.isStalemate) {
        gameStatus.textContent = 'Empate por afogamento!';
        gameStatus.classList.add('stalemate');
    } else if (gameState.isInCheck) {
        gameStatus.textContent = 'Xeque!';
        gameStatus.classList.add('check');
    } else {
        gameStatus.textContent = '';
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);
