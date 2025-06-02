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