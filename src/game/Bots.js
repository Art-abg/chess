export const BOTS = [
  // Beginner
  {
    id: 'martin',
    name: 'Martin',
    elo: 250,
    category: 'Beginner',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/75330830.65586947.200x200o.422d16460670.jpeg', 
    depth: 1,
    skillLevel: 0,
    description: "I'm just learning! I make many mistakes, but I love to play.",
    color: '#95afc0',
    flag: '🇺🇸'
  },
  {
    id: 'wayne',
    name: 'Wayne',
    elo: 450,
    category: 'Beginner',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/95529731.c3ca658e.200x200o.e12c1b82736c.jpeg',
    depth: 2,
    skillLevel: 2,
    description: "I play fast and loose. Let's have a fun game!",
    color: '#f0932b',
    flag: '🇺🇸'
  },
  
  // Intermediate
  {
    id: 'nelson',
    name: 'Nelson',
    elo: 1000,
    category: 'Intermediate',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/83726584.2882aee1.200x200o.0c96c4285b96.jpeg',
    depth: 4,
    skillLevel: 5,
    description: "I love bringing my Queen out early! Watch out for checkmate.",
    color: '#ffbe76',
    flag: '🇧🇷'
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    elo: 1600,
    category: 'Intermediate',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/129606827.46da9c66.200x200o.7486f0928236.jpeg', // Placeholder
    depth: 8,
    skillLevel: 10,
    description: "I calculate 8 moves ahead. I play solid and principled chess.",
    color: '#6ab04c',
    flag: '🤖'
  },

  // Advanced
  {
    id: 'wendy',
    name: 'Wendy',
    elo: 1800,
    category: 'Advanced',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/62823792.8354c478.200x200o.d297926715f3.jpeg',
    depth: 10,
    skillLevel: 12,
    description: "I play a very positional game. You won't find many tactical holes.",
    color: '#e056fd',
    flag: '🇨🇦'
  },
  {
    id: 'stockfish_lite',
    name: 'Stockfish Lite',
    elo: 2000,
    category: 'Advanced',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/36427506.49527237.200x200o.66e068c2794c.png',
    depth: 12,
    skillLevel: 15,
    description: "I don't make many mistakes. You'll need to be accurate.",
    color: '#eb4d4b',
    flag: '⚙️'
  },

  // Master
  {
      id: 'danny',
      name: 'Danny',
      elo: 2500,
      category: 'Master',
      avatar: 'https://images.chesscomfiles.com/uploads/v1/user/33215682.02237894.200x200o.c833d7192666.jpeg',
      depth: 14,
      skillLevel: 18,
      description: "IM Danny Rensch here! I'm going to throw some serious theory at you.",
      color: '#4834d4',
      flag: '🇺🇸'
  },
  {
      id: 'stockfish_grandmaster',
      name: 'Stockfish 16',
      elo: 3200,
      category: 'Master',
      avatar: 'https://images.chesscomfiles.com/uploads/v1/user/57002572.76d6396e.200x200o.8471c4c34863.png',
      depth: 20,
      skillLevel: 20,
      description: "You will not win. But you will learn.",
      color: '#000000',
      flag: '🏆'
  }
];

export const getBotById = (id) => BOTS.find(b => b.id === id) || BOTS[0];
