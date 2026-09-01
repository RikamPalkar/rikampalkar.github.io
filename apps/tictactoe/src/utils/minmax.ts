export type Player = 'X' | 'O' | '';
export type Board = Player[];

// Winning combinations (indexes in 1D array for 3x3 grid)
const WINNING_COMBOS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

export function checkWinner(board: Board): Player {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return '';
}

export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== '');
}

export function getAvailableMoves(board: Board): number[] {
  return board
    .map((cell, index) => (cell === '' ? index : -1))
    .filter(index => index !== -1);
}

// MinMax Algorithm
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  const winner = checkWinner(board);

  // Terminal states
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of availableMoves) {
      board[move] = aiPlayer;
      const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
      board[move] = '';
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of availableMoves) {
      board[move] = humanPlayer;
      const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
      board[move] = '';
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

export function getBestMove(board: Board, aiPlayer: Player, humanPlayer: Player): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  const availableMoves = getAvailableMoves(board);

  for (const move of availableMoves) {
    board[move] = aiPlayer;
    const score = minimax(board, 0, false, aiPlayer, humanPlayer);
    board[move] = '';

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
