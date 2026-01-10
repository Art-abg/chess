import { Chess } from "chess.js";

export const promotions = [undefined, "b", "n", "r", "q"];

export const pieceValues = {
    "p": 1,
    "n": 3,
    "b": 3,
    "r": 5,
    "q": 9,
    "k": Infinity,
    "m": 0
};

function getBoardCoordinates(square) {
    return {
        x: "abcdefgh".indexOf(square.slice(0, 1)),
        y: parseInt(square.slice(1)) - 1
    };
}

function getSquare(coordinate) {
    return "abcdefgh".charAt(coordinate.x) + (coordinate.y + 1).toString();
}

export function getAttackers(fen, square) {
    let attackers = [];

    let board = new Chess(fen);
    let piece = board.get(square);
    if (!piece) return [];

    // Set colour to move to opposite of attacked piece
    // This regex replaces the active color 'w'/'b' with the opposite
    // And removes castling rights/en passant if needed for pure capture logic, 
    // but simply changing turn is enough for `board.moves` to generate captures for that side.
    // However, `chess.js` validation might be tricky if we manipulate FEN string manually too aggressively.
    // WintrChess strategy:
    // 1. Swap active color.
    // 2. Remove castling rights / ep to simplify? WintrChess replaces `/ [a-h][1-8] /g` with ` - ` which removes ep. Not castling rights.
    
    // Safer way with chess.js api if possible, but manual FEN manipulation is what WintrChess does.
    const parts = fen.split(' ');
    parts[1] = piece.color === 'w' ? 'b' : 'w'; // Swap turn
    parts[3] = '-'; // Remove en passant
    const testFen = parts.join(' ');

    board.load(testFen);
    
    // Find each legal move that captures attacked piece
    let legalMoves = board.moves({ verbose: true });

    for (let move of legalMoves) {
        if (move.to === square) {
            attackers.push({
                square: move.from,
                color: move.color,
                type: move.piece
            });
        }
    }

    // Checking for king attacks (if king is adjacent)
    // WintrChess logic manually checks offsets because Kings can't move into check, 
    // but they can technically "attack" a square if we ignore the check restriction for the purpose of "is piece hanging".
    
    let oppositeKing;
    let oppositeColour = piece.color === 'w' ? 'b' : 'w';
    let pieceCoordinate = getBoardCoordinates(square);

    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            if (xOffset === 0 && yOffset === 0) continue;

            let offsetSquare = getSquare({
                x: Math.min(Math.max(pieceCoordinate.x + xOffset, 0), 7),
                y: Math.min(Math.max(pieceCoordinate.y + yOffset, 0), 7)
            });
            
            // Need to reload original board to check what's actually there
            // Actually `board` has testFen (swapped turn).
            // We should use a helper or look at `board.get`.
            // The `board` instance has the pieces from `fen` (just swapped turn). 
            // So `board.get(offsetSquare)` works.
            
            let offsetPiece = board.get(offsetSquare);
            if (!offsetPiece) continue;

            if (offsetPiece.color === oppositeColour && offsetPiece.type === "k") {
                oppositeKing = {
                    color: offsetPiece.color,
                    square: offsetSquare,
                    type: offsetPiece.type
                };
                break;
            }
        }
        if (oppositeKing) break;
    }

    if (!oppositeKing) return attackers;

    // Check if king capture is "legal" (ignoring check for a moment, or rather if it CAN capture)
    // WintrChess tries to move the king.
    let kingCaptureLegal = false;
    try {
        board.move({
            from: oppositeKing.square,
            to: square
        });
        kingCaptureLegal = true;
    } catch (e) {}

    if (oppositeKing && (attackers.length > 0 || kingCaptureLegal)) {
        attackers.push(oppositeKing);
    }

    return attackers;
}

export function getDefenders(fen, square) {
    let board = new Chess(fen);
    let piece = board.get(square);
    if (!piece) return [];
    
    let testAttacker = getAttackers(fen, square)[0];

    // If there is an attacker we can test capture the piece with
    if (testAttacker) {
        const parts = fen.split(' ');
        parts[1] = testAttacker.color; // Set turn to attacker
        parts[3] = '-';
        board.load(parts.join(' '));

        // Capture the defended piece with the test attacker
        for (let promotion of promotions) {
            try {
                board.move({
                    from: testAttacker.square,
                    to: square,
                    promotion: promotion
                });

                // Return the attackers that can now capture the test attacker (which are the defenders of original piece)
                return getAttackers(board.fen(), square);
            } catch (e) {}
        }
    } else {
        // Set player to move to defended piece colour
        const parts = fen.split(' ');
        parts[1] = piece.color;
        parts[3] = '-';
        board.load(parts.join(' '));

        // Replace defended piece with an enemy queen
        board.put({
            color: piece.color === 'w' ? 'b' : 'w',
            type: "q"
        }, square);

        // Return the attackers of that piece
        return getAttackers(board.fen(), square);
    }

    return [];
}

export function isPieceHanging(lastFen, fen, square) {
    let lastBoard = new Chess(lastFen);
    let board = new Chess(fen);

    let lastPiece = lastBoard.get(square);
    let piece = board.get(square);
    
    if (!lastPiece || !piece) return false;

    let attackers = getAttackers(fen, square);
    let defenders = getDefenders(fen, square);

    // If piece was just traded equally or better, not hanging
    if (pieceValues[lastPiece.type] >= pieceValues[piece.type] && lastPiece.color !== piece.color) {
        return false;
    }

    // If a rook took a minor piece that was only defended by one other
    // minor piece, it was a favourable rook exchange, so rook not hanging
    if (
        piece.type === "r"
        && pieceValues[lastPiece.type] === 3 
        && attackers.every(atk => pieceValues[atk.type] === 3)
        && attackers.length === 1
    ) {
        return false;
    }

    // If piece has an attacker of lower value, hanging
    if (attackers.some(atk => pieceValues[atk.type] < pieceValues[piece.type])) {
        return true;
    }

    if (attackers.length > defenders.length) {
        let minAttackerValue = Infinity;
        for (let attacker of attackers) {
            minAttackerValue = Math.min(pieceValues[attacker.type], minAttackerValue);
        }

        // If taking the piece even though it has more attackers than defenders
        // would be a sacrifice in itself, not hanging
        if (
            pieceValues[piece.type] < minAttackerValue 
            && defenders.some(dfn => pieceValues[dfn.type] < minAttackerValue)
        ) {
            return false;
        }

        // If any of the piece's defenders are pawns, then the sacrificed piece
        // is the defending pawn. The least valuable attacker is equal in value
        // to the sacrificed piece at this point of the logic
        if (defenders.some(dfn => pieceValues[dfn.type] === 1)) {
            return false;
        }

        return true;
    }

    return false;
}
