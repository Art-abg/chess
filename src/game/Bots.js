export const BOTS = [
  {
    id: 'martin',
    name: 'Martin',
    elo: 250,
    avatar: 'martin', 
    depth: 1,
    description: "I'm just learning! Be nice.",
    color: '#95afc0'
  },
  {
    id: 'nelson',
    name: 'Nelson',
    elo: 1000,
    avatar: 'nelson',
    depth: 2,
    description: "I love bringing my Queen out early!",
    color: '#ffbe76'
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    elo: 1600,
    avatar: 'antigravity',
    depth: 3,
    description: "I calculate 3 moves ahead. Challenge me!",
    color: '#6ab04c'
  },
  {
    id: 'stockfish_lite',
    name: 'Stockfish Lite',
    elo: 2000,
    avatar: 'stockfish',
    depth: 4,
    description: "I don't make many mistakes. Good luck.",
    color: '#eb4d4b'
  }
];

export const getBotById = (id) => BOTS.find(b => b.id === id) || BOTS[0];
