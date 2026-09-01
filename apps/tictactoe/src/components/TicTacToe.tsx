import { useState, useEffect } from 'react';
import { 
  Board, 
  Player, 
  checkWinner, 
  isBoardFull, 
  getBestMove 
} from '../utils/minmax';
import './TicTacToe.css';

const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>('');
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });

  const humanPlayer: Player = 'X';
  const aiPlayer: Player = 'O';

  useEffect(() => {
    // Check for winner or tie
    const gameWinner = checkWinner(board);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
      setScores(prev => ({
        ...prev,
        [gameWinner]: prev[gameWinner as 'X' | 'O'] + 1
      }));
    } else if (isBoardFull(board)) {
      setGameOver(true);
      setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
    }
  }, [board]);

  useEffect(() => {
    // AI makes move
    if (currentPlayer === aiPlayer && !gameOver) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...board], aiPlayer, humanPlayer);
        if (bestMove !== -1) {
          handleMove(bestMove);
        }
      }, 500); // Add slight delay for better UX

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver, board]);

  const handleMove = (index: number) => {
    if (board[index] !== '' || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const handleSquareClick = (index: number) => {
    if (currentPlayer === humanPlayer && !gameOver) {
      handleMove(index);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setWinner('');
    setGameOver(false);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, ties: 0 });
    resetGame();
  };

  return (
    <div className="tictactoe-wrapper">
      {/* Header Section */}
      <header className="game-header">
        <div className="header-content">
          <div className="home-icon">
            <img src="tictactoe-icon.svg" alt="Tic-Tac-Toe" />
          </div>
          
          <div className="header-title-section">
            <h1 className="title">Tic-Tac-Toe AI</h1>
            <p className="subtitle">Challenge the MinMax Algorithm</p>
          </div>
          
          <div className="social-links">
            <a href="https://rikampalkar.github.io/" className="social-icon" target="_blank" rel="noreferrer" title="Portfolio">
              <img src="rikam-icon.svg" alt="Portfolio" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </a>
            <a href="https://amzn.eu/d/bJZtOPK" className="social-icon" target="_blank" rel="noreferrer" title="Books">
              <i className="bi bi-book" />
            </a>
            <a href="https://github.com/RikamPalkar" className="social-icon" target="_blank" rel="noreferrer" title="GitHub">
              <i className="bi bi-github" />
            </a>
            <a href="https://leetcode.com/Rikam/" className="social-icon" target="_blank" rel="noreferrer" title="LeetCode">
              <i className="bi bi-code-square" />
            </a>
            <a href="https://medium.com/@RikamPalkar" className="social-icon" target="_blank" rel="noreferrer" title="Medium">
              <i className="bi bi-medium" />
            </a>
            <a href="https://www.linkedin.com/in/rikampalkar/" className="social-icon" target="_blank" rel="noreferrer" title="LinkedIn">
              <i className="bi bi-linkedin" />
            </a>
            <a href="https://www.c-sharpcorner.com/members/rikam-palkar" className="social-icon" target="_blank" rel="noreferrer" title="C# Corner">
              <i className="bi bi-journal-text" />
            </a>
            <a href="https://www.instagram.com/rikampalkar/" className="social-icon" target="_blank" rel="noreferrer" title="Instagram">
              <i className="bi bi-instagram" />
            </a>
            <a href="https://www.youtube.com/channel/UCqJ-tIcAuRqcuA0OZ1A3EVw" className="social-icon" target="_blank" rel="noreferrer" title="YouTube">
              <i className="bi bi-youtube" />
            </a>
            <a href="https://twitter.com/rikam_cz" className="social-icon" target="_blank" rel="noreferrer" title="Twitter">
              <i className="bi bi-twitter" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Game Container */}
      <div className="tictactoe-container">
        <div className="game-card">
          {/* Scoreboard */}
          <div className="scoreboard">
            <div className="score-labels">
              <span className="score-label">
                <i className="bi bi-person-fill" /> You (X)
              </span>
              <span className="score-label">
                <i className="bi bi-dash-circle" /> Ties
              </span>
              <span className="score-label">
                <i className="bi bi-cpu" /> AI (O)
              </span>
            </div>
            <div className="score-values">
              <div className="score-item player-score">
                <span className="score-value">{scores.X}</span>
              </div>
              <div className="score-item tie-score">
                <span className="score-value">{scores.ties}</span>
              </div>
              <div className="score-item ai-score">
                <span className="score-value">{scores.O}</span>
              </div>
            </div>
          </div>

          {/* Game Status */}
          <div className="game-status">
            {gameOver ? (
              winner ? (
                <span className={`status-text ${winner === humanPlayer ? 'win' : 'lose'}`}>
                  {winner === humanPlayer ? (
                    <><i className="bi bi-trophy-fill" /> You Win!</>
                  ) : (
                    <><i className="bi bi-robot" /> AI Wins!</>
                  )}
                </span>
              ) : (
                <span className="status-text tie"><i className="bi bi-dash-circle" /> It's a Tie!</span>
              )
            ) : (
              <span className={`status-text ${currentPlayer === humanPlayer ? 'your-turn' : 'ai-turn'}`}>
                {currentPlayer === humanPlayer ? (
                  <><i className="bi bi-cursor-fill" /> Your Turn</>
                ) : (
                  <><i className="bi bi-hourglass-split" /> AI is thinking...</>
                )}
              </span>
            )}
          </div>

          {/* Game Board */}
          <div className="board">
            {board.map((cell, index) => (
              <div
                key={index}
                className={`square ${cell ? 'filled' : ''} ${cell === 'X' ? 'x-cell' : cell === 'O' ? 'o-cell' : ''} ${
                  gameOver ? 'game-over' : ''
                }`}
                onClick={() => handleSquareClick(index)}
              >
                {cell}
              </div>
            ))}
          </div>

          {/* Button Group */}
          <div className="button-group">
            <button className="btn btn-primary" onClick={resetGame}>
              <i className="bi bi-arrow-clockwise" /> New Game
            </button>
            <button className="btn btn-secondary" onClick={resetScores}>
              <i className="bi bi-bar-chart" /> Reset Scores
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-header">
              <i className="bi bi-cpu" />
              <h3>About the MinMax Algorithm</h3>
            </div>
            <p className="info-text">
              This game uses the <strong>MinMax Algorithm</strong>, an AI decision-making 
              algorithm that evaluates all possible moves to find the optimal strategy. 
              The AI simulates every possible game outcome to make the best move.
            </p>
          </div>

          <div className="info-card resources-card">
            <div className="info-header">
              <i className="bi bi-lightbulb" />
              <h3>Learn More</h3>
            </div>
            <div className="resources-links">
              <a 
                href="https://levelup.gitconnected.com/step-by-step-guide-to-develop-tic-tac-toe-ai-with-blazor-b11c194aac6b" 
                className="resource-link" 
                target="_blank" 
                rel="noreferrer"
              >
                <i className="bi bi-file-text" />
                <div>
                  <strong>Step-by-Step Guide</strong>
                  <span>Develop Tic-Tac-Toe AI with Blazor</span>
                </div>
              </a>
              <a 
                href="https://youtu.be/r_-Z6Zk4Hko?si=lFUh0A-_Oi-Bxwn3" 
                className="resource-link" 
                target="_blank" 
                rel="noreferrer"
              >
                <i className="bi bi-play-circle" />
                <div>
                  <strong>Video Tutorial</strong>
                  <span>Watch the implementation on YouTube</span>
                </div>
              </a>
            </div>
          </div>

          <div className="info-card footer-card">
            <div className="footer-content">
              <p className="footer-text">
                <i className="bi bi-code-slash" /> Designed and Developed by <strong>Rikam Palkar</strong>
              </p>
              <p className="footer-links">
                <a href="https://rikampalkar.github.io" target="_blank" rel="noreferrer">Portfolio</a>
                <span className="separator">•</span>
                <a href="https://github.com/RikamPalkar" target="_blank" rel="noreferrer">GitHub</a>
                <span className="separator">•</span>
                <a href="https://medium.com/@RikamPalkar" target="_blank" rel="noreferrer">Articles</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
