# ♟️ Chess Pro - Advanced AI Chess Platform

Welcome to **Chess Pro**, a modern, feature-rich chess platform built with React and Vite. Play against intelligent AI bots, analyze your moves in real-time, and improve your game with professional-grade tools.

![Chess Pro Demo](https://via.placeholder.com/800x450.png?text=Chess+Pro+Interface+Demo) <!-- Replace with a real screenshot/preview later -->

## 🚀 Features

- **🤖 Intelligent AI Bots**: Challenge multiple bots with different personalities and skill levels (from Martin to Magnus).
- **📊 Real-time Move Analysis**: Get instant feedback on your moves. The engine classifies your play as *Best*, *Excellent*, *Good*, *Inaccuracy*, *Mistake*, or *Blunder*.
- **📈 Evaluation Bar**: A dynamic vertical bar showing the current material and positional advantage, just like professional chess sites.
- **💡 Move Hints**: Stuck in a position? Request a hint from the engine to see the best tactical continuation.
- **↩️ Undo/Takeback**: Learn from your mistakes by undoing moves and trying different variations.
- **📱 Responsive UI**: A sleek, dark-themed interface designed for both desktop and mobile play.
- **⚡ Web Worker Integration**: The chess engine runs in a separate background thread (Web Worker) to ensure smooth UI performance even during heavy calculations.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite
- **Logic**: [Chess.js](https://github.com/jhlywa/chess.js) (Move validation & Game state)
- **Engine**: Custom Minimax implementation with Alpha-Beta pruning
- **Styles**: Pure CSS (Modern Design System)

## 🏗️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Art-abg/chess.git
   cd chess-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🎮 How to Play

1. **Select an Opponent**: Choose a bot from the sidebar to change the difficulty.
2. **Make a Move**: Click on a piece to see valid moves (dots) and click on the destination square.
3. **Analyze**: Watch the status area after your move for the engine's feedback.
4. **Use Tools**: Click "Hint" for suggestions or "Undo" to rethink your strategy.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for the chess community.*
