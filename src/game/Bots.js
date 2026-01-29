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
    flag: '🇺🇸',
    personality: {
        greetings: ["Hi! I'm Martin. Do you want to play chess?", "Hello! Let's have a fun game.", "Be nice to me, I'm still learning!"],
        onPlayerBlunder: ["Oh! Did you mean to do that?", "I think I might be winning now!", "Wow, thanks for the piece!"],
        onBotBlunder: ["Oops, I didn't see that!", "Oh no! My piece!", "You are very good at this."],
        onCapture: ["I got one!", "Check out my new piece!", "Taking that!"],
        onWin: ["I won! I can't believe it!", "Good game! I played well for once.", "Yay! Beginner's luck?"],
        onLoss: ["You're too good for me!", "Oh well, maybe next time.", "I'll keep practicing!"]
    }
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
    flag: '🇺🇸',
    personality: {
        greetings: ["Ready for some action?", "Let's roll!", "Hope you're ready for my style."],
        onPlayerBlunder: ["Easy pickings!", "You're making it too easy.", "Ka-ching!"],
        onBotBlunder: ["Whatever, I've got more pieces.", "Calculated risk... maybe.", "You got lucky."],
        onCapture: ["Boom!", "Gotcha!", "Next!"],
        onWin: ["Too fast for you!", "Piece of cake.", "Next victim, please!"],
        onLoss: ["Beginner's luck, kid.", "I was distracted.", "GG I guess."]
    }
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
    flag: '🇧🇷',
    personality: {
        greetings: ["Beware my Queen!", "I hope you know your theory.", "Let's see if you can handle the pressure."],
        onPlayerBlunder: ["My Queen is coming for you now.", "That was a mistake.", "I've seen this before. It doesn't end well for you."],
        onBotBlunder: ["Intriguing... I must re-evaluate.", "A temporary setback.", "You're playing better than I expected."],
        onCapture: ["The Queen strikes!", "One step closer to victory.", "Efficient."],
        onWin: ["The Queen always prevails.", "Checkmate. Better luck next time.", "Knowledge is power."],
        onLoss: ["An impressive performance.", "I overestimated my position.", "Well played. I'll learn from this."]
    }
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
    flag: '🤖',
    personality: {
        greetings: ["Analyzing opponent... depth 8 achieved.", "Principles first, tactics second.", "Shall we begin the calculation?"],
        onPlayerBlunder: ["Evaluation shifted by +2.5. Significant error detected.", "Optimizing victory path.", "Inefficient move choice."],
        onBotBlunder: ["Logic error detected in branch prune. Fascinating.", "Search depth insufficient for that line.", "Recalculating..."],
        onCapture: ["Material parity adjusted.", "Executing capture sequence.", "Piece removed from board state."],
        onWin: ["Calculation complete. Result: Victory.", "Principles maintained throughout the game.", "The silicon mind prevails."],
        onLoss: ["Error in evaluation function. You've surpassed my current logic.", "Impressive depth of thought.", "Human intuition wins this time."]
    }
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
    flag: '🇨🇦',
    personality: {
        greetings: ["Patience is the key to chess.", "Let's see if you can find the weaknesses in my structure.", "A quiet game is a deep game."],
        onPlayerBlunder: ["Your structure is starting to crumble.", "Precision is required at this level.", "That move creates too many holes."],
        onBotBlunder: ["I've missed a subtle nuance.", "An uncharacteristic lapse in concentration.", "Very sharp. I missed that."],
        onCapture: ["Slowly tightening the noose.", "Positional advantage secured.", "Every piece counts."],
        onWin: ["Total control from start to finish.", "A victory of strategy over tactics.", "Patience rewarded."],
        onLoss: ["You found the cracks in my defense.", "Beautifully played.", "A lesson in positional pressure."]
    }
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
    flag: '⚙️',
    personality: {
        greetings: ["Engine initialized. Ready to process.", "Accuracy: 99%. Initiating.", "Game start. Depth 12 fixed."],
        onPlayerBlunder: ["Error code: BLUNDER. Advantage +3.2.", "Move not found in Top 3 PV.", "Evaluation peak detected."],
        onBotBlunder: ["Depth limit reached. Horizon effect error.", "Unexpected variation.", "Recalculating Top 1."],
        onCapture: ["Material balance updated.", "Optimal move executed.", "Capture confirmed."],
        onWin: ["Efficiency maximized. End of line.", "Checkmate found in depth 8.", "Process terminated successfully."],
        onLoss: ["Input error. Re-reading database...", "You have defeated the machine.", "Critical failure in bot logic."]
    }
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
      flag: '🇺🇸',
      personality: {
          greetings: ["Danny Rensch here! Let's talk about those light squares.", "Ready for some bullet? Just kidding, let's take our time.", "Welcome to the show!"],
          onPlayerBlunder: ["Wait, what was that?! Call the police!", "That move is a total 'yikes'.", "Incentive structure: compromised."],
          onBotBlunder: ["I'm going to have to do a whole video explaining why I just did that.", "Total coffee-house chess by me there.", "You got me!"],
          onCapture: ["Taking that with authority!", "Nom nom pieces.", "That's a free lunch right there."],
          onWin: ["And that's why we control the center, folks!", "Great game. See you in the analysis room.", "Mission accomplished."],
          onLoss: ["I'm calling the Fair Play team! Just kidding, amazing job.", "You're playing like a GM today.", "I'm humbled. GG."]
      }
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
      flag: '🏆',
      personality: {
          greetings: ["I am the culmination of decades of chess research.", "Your game is already decided.", "Seek meaning in the struggle."],
          onPlayerBlunder: ["Predictable.", "Efficiency: 0%.", "The end is near."],
          onBotBlunder: ["Impossible.", "...", "Error..."],
          onCapture: ["Inevitable.", "Optimal.", "Extinguished."],
          onWin: ["As expected.", "Logic is the only truth.", "Rest."],
          onLoss: ["You are the chosen one.", "Universe reset.", "God?"]
      }
  }
];

export const getBotById = (id) => BOTS.find(b => b.id === id) || BOTS[0];
