import { MoveType } from './MoveClassifier';

/**
 * Generates a simple explanation for the move.
 * @param {string} classification - The MoveType.
 * @param {object} move - The move object (from, to, piece, captured, flags).
 * @param {object} boardState - (Optional) To detect hangs, checks, etc.
 * @returns {string} The natural language explanation.
 */
export const explainMove = (classification, move, isCheck) => {
    const pieceName = getPieceName(move.piece);
    const target = move.to;

    switch (classification) {
        case MoveType.BRILLIANT:
            return `A brilliant ${pieceName} sacrifice that creates a distinct advantage.`;
        case MoveType.BEST:
            return `The best move. developing effectively and maintaining the advantage.`;
        case MoveType.EXCELLENT:
            return `An excellent move. You are playing accurately.`;
        case MoveType.GOOD:
            return `A solid move, though there might have been a slightly better option.`;
        case MoveType.INACCURACY:
            return `An inaccuracy. This move gives up some of your advantage.`;
        case MoveType.MISTAKE:
            return `A mistake. You lost significant material or position here.`;
        case MoveType.BLUNDER:
            return `A blunder. This move may have lost the game or a major piece.`;
        case MoveType.BOOK:
            return `This is standard opening theory.`;
        default:
            return isCheck ? `Checking the King!` : `A normal developing move.`;
    }
};

const getPieceName = (p) => {
    switch (p) {
        case 'p': return 'Pawn';
        case 'n': return 'Knight';
        case 'b': return 'Bishop';
        case 'r': return 'Rook';
        case 'q': return 'Queen';
        case 'k': return 'King';
        default: return 'Piece';
    }
};
