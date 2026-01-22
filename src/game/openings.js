export const OPENINGS = [
  { name: "Ruy Lopez", moves: "e4 e5 Nf3 Nc6 Bb5" },
  { name: "Sicilian Defense", moves: "e4 c5" },
  { name: "French Defense", moves: "e4 e6" },
  { name: "Caro-Kann Defense", moves: "e4 c6" },
  { name: "Italian Game", moves: "e4 e5 Nf3 Nc6 Bc4" },
  { name: "Queen's Gambit", moves: "d4 d5 c4" },
  { name: "King's Indian Defense", moves: "d4 Nf6 c4 g6" },
  { name: "Scandinavian Defense", moves: "e4 d5" },
  { name: "English Opening", moves: "c4" },
  { name: "Reti Opening", moves: "Nf3" },
  { name: "Nimzo-Indian Defense", moves: "d4 Nf6 c4 e6 Nc3 Bb4" },
  { name: "Slav Defense", moves: "d4 d5 c4 c6" },
  { name: "Alekhine Defense", moves: "e4 Nf6" },
  { name: "Pirc Defense", moves: "e4 d6 d4 Nf6" },
  { name: "Giuoco Piano", moves: "e4 e5 Nf3 Nc6 Bc4 Bc5" },
  { name: "Scotch Game", moves: "e4 e5 Nf3 Nc6 d4" },
  { name: "Four Knights Game", moves: "e4 e5 Nf3 Nc6 Nc3 Nf6" }
];

export function detectOpening(history) {
  if (!history || history.length === 0) return null;
  
  const moveStr = history.map(m => m.san).join(" ");
  
  let bestMatch = null;
  let maxMoves = -1;
  
  for (const opening of OPENINGS) {
    if (moveStr.startsWith(opening.moves)) {
      const moveCount = opening.moves.split(" ").length;
      if (moveCount > maxMoves) {
        maxMoves = moveCount;
        bestMatch = opening.name;
      }
    }
  }
  
  return bestMatch;
}
