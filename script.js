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

class ChessGame {
    constructor() {
        // 1) Creăm o nouă tablă
        this.board = new ChessBoard();

        // 2) Inițial nicio piesă nu e selectată, nicio mutare validă nu e calculată
        this.selectedPiece = null;
        this.validMoves = [];

        // 3) Alb începe întotdeauna
        this.currentTurn = 'white';

        // 4) Citim modul de joc din UI (dacă există)
        this.gameMode = document.getElementById('gameMode')?.value || 'human';

        // 5) Citim numele jucătorilor (dacă există, altfel defaulturi)
        this.playerNames = {
            white: document.getElementById('player1')?.value || 'Jucător 1',
            black: document.getElementById('player2')?.value || 'Jucător 2'
        };

        // 6) Actualizăm afișajele din HTML
        this.updatePlayerDisplay();
        this.updateTurnDisplay();
    }

    // Actualizează “Jucători: Alb vs Negru”
    updatePlayerDisplay() {
        let pd = document.getElementById('playerDisplay');
        if (!pd) return;
        pd.innerText = `Jucători: ${this.playerNames.white} vs ${this.playerNames.black}`;
    }

    // Actualizează “Runda: <nume> (<culoare>)”
    updateTurnDisplay() {
        let td = document.getElementById('turnDisplay');
        if (!td) return;
        let txt =
            this.currentTurn === 'white'
                ? `${this.playerNames.white} (Alb)`
                : `${this.playerNames.black} (Negru)`;
        td.innerText = `Runda: ${txt}`;
    }

    // Resetează jocul complet
    resetGame() {
        // 1) Resetăm tabla la poziția inițială
        this.board.setupBoard();

        // 2) Nicio piesă nu e selectată, nici mutări valide
        this.selectedPiece = null;
        this.validMoves = [];

        // 3) Alb începe din nou
        this.currentTurn = 'white';

        // 4) Luăm iar valorile din UI (nume, modul de joc)
        this.gameMode = document.getElementById('gameMode')?.value || 'human';
        this.playerNames.white = document.getElementById('player1')?.value || 'Jucător 1';
        this.playerNames.black = document.getElementById('player2')?.value || 'Jucător 2';

        // 5) Actualizăm afișajele HTML
        this.updatePlayerDisplay();
        this.updateTurnDisplay();
    }

    // Desenează tabla, piesele și mutările valide
    draw() {
        clear();

        // 1) Recalculăm dimensiunea pătratului conform canvas-ului
        this.board.sqSize = width / this.board.cols;

        // 2) Desenăm tabla
        this.board.drawBoard();

        // 3) Dacă există piesă selectată, evidențiem mutările valide
        if (this.selectedPiece) {
            // Pătrate verzi semi-transparente
            fill(0, 255, 0, 100);
            for (let mv of this.validMoves) {
                rect(
                    mv.col * this.board.sqSize,
                    mv.row * this.board.sqSize,
                    this.board.sqSize,
                    this.board.sqSize
                );
            }
            // Pătrat galben semi-transparent pe piesa selectată
            fill(255, 255, 0, 150);
            rect(
                this.selectedPiece.col * this.board.sqSize,
                this.selectedPiece.row * this.board.sqSize,
                this.board.sqSize,
                this.board.sqSize
            );
        }


        this.board.drawPieces();


        this.updateTurnDisplay();
    }


    handleClick(mouseX, mouseY) {
        let col = floor(mouseX / this.board.sqSize);
        let row = floor(mouseY / this.board.sqSize);
        if (!this.board.isValidCell(row, col)) return;

        let clickedPiece = this.board.getPiece(row, col);


        if (this.selectedPiece) {

            if (this.validMoves.some(m => m.row === row && m.col === col)) {

                let opponentColor = this.currentTurn === 'white' ? 'black' : 'white';


                this.board.movePiece(this.selectedPiece, row, col);
                this.selectedPiece = null;
                this.validMoves = [];


                this.currentTurn = opponentColor;
                this.updateTurnDisplay();


                if (this.isInCheck(opponentColor) && !this.hasAnyLegalMove(opponentColor)) {
                    alert(`ȘAH-MAT! ${opponentColor === 'white' ? this.playerNames.white : this.playerNames.black} a pierdut.`);
                    return;
                }


                if (this.gameMode !== 'human' && this.currentTurn === 'black') {
                    if (this.gameMode === 'computer-easy') {
                        setTimeout(() => this.computerEasyMove(), 300);
                    } else if (this.gameMode === 'computer-moderate') {
                        setTimeout(() => this.computerModerateMove(), 300);
                    }
                }
                return;
            }

            else {
                if (clickedPiece && clickedPiece.color === this.currentTurn) {
                    this.selectedPiece = clickedPiece;
                    this.validMoves = this.filterLegalMoves(clickedPiece);
                } else {

                    this.selectedPiece = null;
                    this.validMoves = [];
                }
            }
        }

        else {

            if (clickedPiece && clickedPiece.color === this.currentTurn) {
                this.selectedPiece = clickedPiece;
                this.validMoves = this.filterLegalMoves(clickedPiece);
            }
        }
    }


    filterLegalMoves(piece) {
        let legal = [];
        let rawMoves = piece.getValidMoves(this.board);
        for (let mv of rawMoves) {

            let tmpBoard = this.board.clone();

            let tmpPiece = tmpBoard.getPiece(piece.row, piece.col);

            tmpBoard.movePiece(tmpPiece, mv.row, mv.col);

            if (!this.isInCheckAfterMove(tmpBoard, piece.color)) {
                legal.push(mv);
            }
        }
        return legal;
    }


    isInCheck(color) {
        return this.isInCheckAfterMove(this.board, color);
    }


    isInCheckAfterMove(boardToCheck, color) {

        let kingRow = -1, kingCol = -1;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = boardToCheck.getPiece(r, c);
                if (p && p.type === 'K' && p.color === color) {
                    kingRow = r; kingCol = c;
                    break;
                }
            }
            if (kingRow !== -1) break;
        }
        if (kingRow === -1) {

            return true;
        }

        let opponentColor = (color === 'white' ? 'black' : 'white');
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = boardToCheck.getPiece(r, c);
                if (p && p.color === opponentColor) {
                    let raw = p.getValidMoves(boardToCheck);

                    for (let mv of raw) {
                        if (mv.row === kingRow && mv.col === kingCol) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }


    hasAnyLegalMove(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = this.board.getPiece(r, c);
                if (p && p.color === color) {
                    let legal = this.filterLegalMoves(p);
                    if (legal.length > 0) return true;
                }
            }
        }
        return false;
    }


    computerEasyMove() {
        let allLegal = [];

        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                let piece = this.board.getPiece(r, c);
                if (piece && piece.color === 'black') {
                    let legal = this.filterLegalMoves(piece);
                    for (let mv of legal) {
                        allLegal.push({ pieceRow: r, pieceCol: c, destRow: mv.row, destCol: mv.col });
                    }
                }
            }
        }

        if (allLegal.length === 0) {
            alert(`ȘAH-MAT! ${this.playerNames.black} a pierdut.`);
            return;
        }

        let chosen = random(allLegal);
        let p = this.board.getPiece(chosen.pieceRow, chosen.pieceCol);
        this.board.movePiece(p, chosen.destRow, chosen.destCol);


        this.currentTurn = 'white';
        this.updateTurnDisplay();


        if (this.isInCheck('white') && !this.hasAnyLegalMove('white')) {
            alert(`ȘAH-MAT! ${this.playerNames.white} a pierdut.`);
            return;
        }
    }


    computerModerateMove() {
        let captureMoves = [];
        let otherMoves = [];

        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                let piece = this.board.getPiece(r, c);
                if (piece && piece.color === 'black') {
                    let legal = this.filterLegalMoves(piece);
                    for (let mv of legal) {

                        let target = this.board.getPiece(mv.row, mv.col);
                        if (target) {

                            captureMoves.push({ pieceRow: r, pieceCol: c, destRow: mv.row, destCol: mv.col });
                        } else {
                            otherMoves.push({ pieceRow: r, pieceCol: c, destRow: mv.row, destCol: mv.col });
                        }
                    }
                }
            }
        }

        let chosen;
        if (captureMoves.length > 0) {

            chosen = random(captureMoves);
        } else if (otherMoves.length > 0) {

            chosen = random(otherMoves);
        } else {

            alert(`ȘAH-MAT! ${this.playerNames.black} a pierdut.`);
            return;
        }


        let p = this.board.getPiece(chosen.pieceRow, chosen.pieceCol);
        this.board.movePiece(p, chosen.destRow, chosen.destCol);


        this.currentTurn = 'white';
        this.updateTurnDisplay();


        if (this.isInCheck('white') && !this.hasAnyLegalMove('white')) {
            alert(`ȘAH-MAT! ${this.playerNames.white} a pierdut.`);
            return;
        }
    }
}