let game;
let canvas;

let lightColor = '#ffffff';
let darkColor = '#000000';

let boardSize = 480;



class ChessPiece {
    constructor(type, color, row, col) {
        this.type = type;
        this.color = color;
        this.row = row;
        this.col = col;
    }

    getSymbol() {
        const symbols = {
            'K': { white: '♔', black: '♚' },
            'Q': { white: '♕', black: '♛' },
            'R': { white: '♖', black: '♜' },
            'B': { white: '♗', black: '♝' },
            'N': { white: '♘', black: '♞' },
            'P': { white: '♙', black: '♟' }
        };
        return symbols[this.type][this.color];
    }

    draw(sqSize) {
        textSize(sqSize * 0.8);
        textAlign(CENTER, CENTER);

        let xPos = this.col * sqSize + sqSize / 2;
        let yPos = this.row * sqSize + sqSize / 2;

        fill(this.color === 'white' ? 240 : 20);

        stroke(this.color === 'white' ? 20 : 240);
        strokeWeight(2);

        text(this.getSymbol(), xPos, yPos);

        noStroke();
    }


    getValidMoves(board) {
        let moves = [];

        if (this.type === 'P') {
            let direction = this.color === 'white' ? -1 : 1;
            let newRow = this.row + direction;

            if (board.isValidCell(newRow, this.col) && board.isEmpty(newRow, this.col)) {
                moves.push({ row: newRow, col: this.col });
                if ((this.color === 'white' && this.row === 6) || (this.color === 'black' && this.row === 1)) {
                    let doubleRow = this.row + 2 * direction;
                    if (board.isEmpty(doubleRow, this.col)) {
                        moves.push({ row: doubleRow, col: this.col });
                    }
                }
            }
            for (let dc of [-1, 1]) {
                let c = this.col + dc;
                if (board.isValidCell(newRow, c)) {
                    let target = board.getPiece(newRow, c);
                    if (target && target.color !== this.color) {
                        moves.push({ row: newRow, col: c });
                    }
                }
            }
        }

        else if (this.type === 'R') {
            moves = moves.concat(
                board.getLinearMoves(this, [
                    [0, 1], [0, -1], [1, 0], [-1, 0]
                ])
            );
        }
        else if (this.type === 'B') {
            moves = moves.concat(
                board.getLinearMoves(this, [
                    [1, 1], [1, -1], [-1, 1], [-1, -1]
                ])
            );
        }

        else if (this.type === 'Q') {
            moves = moves.concat(
                board.getLinearMoves(this, [
                    [0, 1], [0, -1], [1, 0], [-1, 0],
                    [1, 1], [1, -1], [-1, 1], [-1, -1]
                ])
            );
        }

        else if (this.type === 'N') {
            let knightMoves = [
                { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
                { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
                { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
                { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
            ];
            for (let m of knightMoves) {
                let r = this.row + m.dr;
                let c = this.col + m.dc;
                if (board.isValidCell(r, c)) {
                    let target = board.getPiece(r, c);
                    if (!target || target.color !== this.color) {
                        moves.push({ row: r, col: c });
                    }
                }
            }
        }

        else if (this.type === 'K') {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    let r = this.row + dr;
                    let c = this.col + dc;
                    if (board.isValidCell(r, c)) {
                        let target = board.getPiece(r, c);
                        if (!target || target.color !== this.color) {
                            moves.push({ row: r, col: c });
                        }
                    }
                }
            }
        }

        return moves;
    }
}

class ChessBoard {
    constructor() {
        this.rows = 8;
        this.cols = 8;
        this.grid = [];
        this.sqSize = 80;
        this.setupBoard();
    }

    setupBoard() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = null;
            }
        }

        const backRankBlack = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        for (let c = 0; c < this.cols; c++) {
            this.grid[0][c] = new ChessPiece(backRankBlack[c], 'black', 0, c);
            this.grid[1][c] = new ChessPiece('P', 'black', 1, c);
        }

        for (let c = 0; c < this.cols; c++) {
            this.grid[6][c] = new ChessPiece('P', 'white', 6, c);
        }
        const backRankWhite = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        for (let c = 0; c < this.cols; c++) {
            this.grid[7][c] = new ChessPiece(backRankWhite[c], 'white', 7, c);
        }
    }

    drawBoard() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if ((r + c) % 2 === 0) {
                    fill(lightColor);
                } else {
                    fill(darkColor);
                }
                stroke(0);
                rect(c * this.sqSize, r * this.sqSize, this.sqSize, this.sqSize);
            }
        }
    }

    drawPieces() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let piece = this.grid[r][c];
                if (piece) {
                    piece.draw(this.sqSize);
                }
            }
        }
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    getPiece(row, col) {
        if (!this.isValidCell(row, col)) return null;
        return this.grid[row][col];
    }

    isEmpty(row, col) {
        return this.getPiece(row, col) == null;
    }

    movePiece(piece, newRow, newCol) {
        this.grid[piece.row][piece.col] = null;

        let captured = this.getPiece(newRow, newCol);
        if (captured) {
        }

        piece.row = newRow;
        piece.col = newCol;
        this.grid[newRow][newCol] = piece;

        if (piece.type === 'P' && (newRow === 0 || newRow === 7)) {
            piece.type = 'Q';
        }
    }

    getLinearMoves(piece, directions) {
        let moves = [];
        for (let [dr, dc] of directions) {
            let r = piece.row;
            let c = piece.col;
            while (true) {
                r += dr;
                c += dc;
                if (!this.isValidCell(r, c)) break;
                let target = this.getPiece(r, c);
                if (!target) {
                    moves.push({ row: r, col: c });
                } else {
                    if (target.color !== piece.color) {
                        moves.push({ row: r, col: c });
                    }
                    break;
                }
            }
        }
        return moves;
    }

    clone() {
        let newBoard = new ChessBoard();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                newBoard.grid[r][c] = null;
            }
        }
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = this.grid[r][c];
                if (piece) {
                    newBoard.grid[r][c] = new ChessPiece(piece.type, piece.color, r, c);
                }
            }
        }
        return newBoard;
    }
}