# 🎮 Tic-Tac-Toe AI with MinMax Algorithm

<div align="center">

![Tic-Tac-Toe AI](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?style=for-the-badge&logo=vite)

**An intelligent Tic-Tac-Toe game featuring an unbeatable AI powered by the MinMax algorithm**

[Live Demo](https://rikampalkar.github.io/tictactoe) • [Report Bug](https://github.com/RikamPalkar/rikampalkar.github.io.TicTacToe/issues) • [Request Feature](https://github.com/RikamPalkar/rikampalkar.github.io.TicTacToe/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [The MinMax Algorithm](#the-minmax-algorithm)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [About the Developer](#about-the-developer)
- [Learning Resources](#learning-resources)
- [License](#license)
- [Connect](#connect)

---

## 🎯 About The Project

This is an advanced implementation of the classic Tic-Tac-Toe game that challenges you to beat an unbeatable AI opponent. The AI uses the **MinMax Algorithm**, a decision-making algorithm commonly used in game theory and artificial intelligence, to calculate the optimal move at every turn.

Unlike traditional Tic-Tac-Toe implementations with random or basic AI, this version provides a true challenge where the AI never makes a mistake. The best you can hope for is a draw!

### Why This Project?

This project serves multiple purposes:

- **Educational**: Demonstrates practical implementation of the MinMax algorithm
- **Interactive**: Provides a hands-on way to understand AI decision-making
- **Portfolio Piece**: Showcases modern web development practices with React, TypeScript, and advanced algorithms
- **Challenge**: Tests your strategic thinking against perfect play

---

## 🧠 The MinMax Algorithm

### What is MinMax?

The **MinMax Algorithm** is a recursive decision-making algorithm used in game theory and artificial intelligence. It's designed to find the optimal move for a player, assuming that the opponent also plays optimally.

### How It Works

The algorithm works by:

1. **Simulating All Possible Moves**: Starting from the current board state, it explores every possible future move recursively
2. **Evaluating End States**: When it reaches a terminal state (win, lose, or draw), it assigns a score:
   - **+10**: AI wins
   - **-10**: Human wins
   - **0**: Draw

3. **Maximizing/Minimizing**: 
   - **Maximizing Player (AI)**: Chooses the move with the highest score
   - **Minimizing Player (Human)**: Assumes the opponent will choose moves that minimize the AI's score

4. **Backtracking**: The algorithm backtracks through the game tree, propagating scores up to determine the best move at the current state

### Example Visualization

```
Current Board State
     |     |     
  X  |  O  |  X  
_____|_____|_____
     |     |     
  O  |  X  |     
_____|_____|_____
     |     |     
     |     |  O  

AI evaluates all possible moves:
- Position 5: Leads to draw (score: 0)
- Position 7: Leads to win (score: +10) ✓ BEST MOVE
- Position 8: Leads to loss (score: -10)

AI chooses Position 7
```

### Key Characteristics

- **Complete**: Explores all possible game states
- **Optimal**: Always finds the best move
- **Deterministic**: Given the same board state, always chooses the same move
- **Complexity**: O(b^d) where b is branching factor and d is depth

### Real-World Applications

The MinMax algorithm is used in:
- Chess engines
- Checkers and board games
- Two-player zero-sum games
- Decision-making systems
- Game AI development

---

## ✨ Features

### Core Functionality

- 🤖 **Unbeatable AI**: Powered by the MinMax algorithm with perfect play
- 🎮 **Interactive Gameplay**: Smooth, responsive user interface
- 📊 **Live Score Tracking**: Keeps track of wins, losses, and ties across games
- 🎨 **Modern UI/UX**: Beautiful design with smooth animations and transitions
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Lightning Fast**: Built with Vite for optimal performance
- 🎯 **Strategic Delay**: AI includes a slight thinking delay for better UX

### Technical Features

- **Type-Safe**: Written in TypeScript for enhanced code reliability
- **Component-Based**: Clean, reusable React component architecture
- **Optimized Rendering**: Efficient state management and React hooks
- **Custom Algorithm**: Hand-crafted MinMax implementation
- **Clean Code**: Well-documented and maintainable codebase

---

## 🛠 Technology Stack

### Frontend Framework
- **React 18.2.0** - Modern UI library with hooks
- **TypeScript 5.2.2** - Type-safe JavaScript
- **Vite 5.0.8** - Next-generation frontend tooling

### Styling
- **CSS3** - Custom styling with modern features
- **Bootstrap Icons** - Beautiful icon library
- **Google Fonts** - Poppins & Raleway typography

### Build Tools
- **ESLint** - Code quality and consistency
- **TypeScript Compiler** - Type checking

### Design System
- **Color Palette**:
  - Background: `#040404` (Dark)
  - Primary Accent: `#18d26e` (Green)
  - Hover Color: `#35e888` (Light Green)
  - Text: `#fff` (White)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RikamPalkar/rikampalkar.github.io.TicTacToe.git
cd rikampalkar.github.io.TicTacToe
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser** and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized build will be generated in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

---
> **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

---

## 👨‍💻 About the Developer

<div align="center">
<img src="public/rikam-icon.svg" alt="Rikam Palkar" width="150" height="150" style="border-radius: 50%;">

### Rikam Palkar

**Microsoft MVP | Software Engineer | Technical Writer | Speaker**

</div>

I'm Rikam Palkar, a passionate software engineer and technology enthusiast with a deep love for artificial intelligence, algorithms, and creating elegant solutions to complex problems. This project represents my exploration of game theory and AI decision-making algorithms.

### 🏆 Achievements & Recognition

#### Microsoft MVP (Most Valuable Professional)
- **Category**: Developer Technologies
- Recognized by Microsoft for exceptional technical community leadership and contributions
- Part of an elite global community of technology experts

#### Published Author
- **Platform**: Amazon KDP
- Published technical books helping developers learn and grow
- [View Books on Amazon](https://amzn.eu/d/bJZtOPK)

#### Technical Writing
- **Medium**: Regular contributor with articles on software development, AI, and algorithms
- **C# Corner**: Technical articles and tutorials
- **Level Up Coding**: Advanced programming concepts and guides
- Thousands of readers across multiple platforms

#### Open Source Contributions
- Active contributor on GitHub
- Created multiple educational projects and tools
- Focused on making complex concepts accessible

#### Speaking Engagements
- Technical speaker at developer communities
- YouTube channel with programming tutorials
- Mentoring aspiring developers

### 💡 Areas of Expertise

- **Languages**: TypeScript, JavaScript, C#, Python
- **Frameworks**: React, .NET, Blazor, Node.js
- **Specializations**: Algorithms, AI, Game Theory, Web Development
- **Cloud**: Azure, Cloud Architecture
- **Tools**: Git, VS Code, Visual Studio

### 📚 Featured Content

#### Articles & Tutorials
- [Step-by-Step Guide: Develop Tic-Tac-Toe AI with Blazor](https://levelup.gitconnected.com/step-by-step-guide-to-develop-tic-tac-toe-ai-with-blazor-b11c194aac6b) - Comprehensive guide to building AI-powered games
- Articles on Medium covering software architecture, algorithms, and best practices
- C# Corner contributions on .NET and modern web development

#### Video Content
- [Tic-Tac-Toe AI Implementation Tutorial](https://youtu.be/r_-Z6Zk4Hko?si=lFUh0A-_Oi-Bxwn3) - Watch the step-by-step implementation
- Programming tutorials and concept explanations
- Live coding sessions and technical discussions

---

## 📖 Learning Resources

Want to learn more about the MinMax algorithm and game AI? Check out these resources:

### My Content
- 📝 [Detailed Blog Post](https://levelup.gitconnected.com/step-by-step-guide-to-develop-tic-tac-toe-ai-with-blazor-b11c194aac6b) - Step-by-step guide with code examples
- 🎥 [Video Tutorial](https://youtu.be/r_-Z6Zk4Hko?si=lFUh0A-_Oi-Bxwn3) - Watch me build this from scratch
- 💻 [Source Code](https://github.com/RikamPalkar/rikampalkar.github.io.TicTacToe) - This repository

### Additional Resources
- [Game Theory Basics](https://en.wikipedia.org/wiki/Game_theory)
- [Alpha-Beta Pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning) - Optimization of MinMax
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎓 Educational Use

This project is perfect for:

- **Computer Science Students**: Understanding AI algorithms and game theory
- **Web Developers**: Learning React, TypeScript, and modern web development
- **Algorithm Enthusiasts**: Exploring decision-making algorithms
- **Portfolio Projects**: Building impressive interactive applications

Feel free to:
- ⭐ Star this repository if you find it helpful
- 🔨 Fork and modify for your own learning
- 📝 Use it in your coursework (with proper attribution)
- 🐛 Report bugs or suggest improvements

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/RikamPalkar/rikampalkar.github.io.TicTacToe/issues).

### How to Contribute

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - feel free to use this project for learning and personal projects!

---

## 🌐 Connect With Me

<div align="center">

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://rikampalkar.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rikampalkar/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RikamPalkar)
[![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@RikamPalkar)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/channel/UCqJ-tIcAuRqcuA0OZ1A3EVw)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/rikam_cz)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/rikampalkar/)
[![LeetCode](https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=white)](https://leetcode.com/Rikam/)
[![C# Corner](https://img.shields.io/badge/C%23_Corner-239120?style=for-the-badge)](https://www.c-sharpcorner.com/members/rikam-palkar)
[![Amazon Books](https://img.shields.io/badge/Amazon_Books-FF9900?style=for-the-badge&logo=amazon&logoColor=white)](https://amzn.eu/d/bJZtOPK)

</div>

---

## 💬 Feedback

If you have any feedback, questions, or just want to say hi, please feel free to reach out!

- 📧 Email: Available on [LinkedIn](https://www.linkedin.com/in/rikampalkar/)
- 💼 LinkedIn: [Connect with me](https://www.linkedin.com/in/rikampalkar/)
- 🐦 Twitter: [@rikam_cz](https://twitter.com/rikam_cz)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ and ☕ by [Rikam Palkar](https://rikampalkar.github.io)

*"The best way to predict the future is to create it."*

</div>
