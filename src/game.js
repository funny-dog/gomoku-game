// 五子棋游戏逻辑
class GomokuGame {
  constructor() {
    // 初始化15x15棋盘，0表示空位，1表示黑子，2表示白子
    this.board = Array(15).fill().map(() => Array(15).fill(0));
    this.currentPlayer = 1; // 1为黑子，2为白子
    this.gameOver = false;
    this.winner = null;
    this.moveHistory = [];
    this.moveCount = 0;
    this.blackStones = 0;
    this.whiteStones = 0;
  }

  // 落子
  makeMove(row, col) {
    // 参数验证
    if (typeof row !== 'number' || typeof col !== 'number') {
      throw new Error('Row and col must be numbers');
    }

    if (row < 0 || row >= 15 || col < 0 || col >= 15) {
      throw new Error('Row and col must be between 0 and 14');
    }

    // 检查游戏是否已结束或位置是否已被占用
    if (this.gameOver || this.board[row][col] !== 0) {
      return false;
    }

    // 落子
    this.board[row][col] = this.currentPlayer;
    this.moveCount++;

    // 记录落子统计
    if (this.currentPlayer === 1) {
      this.blackStones++;
    } else {
      this.whiteStones++;
    }

    // 记录历史
    this.moveHistory.push({
      row,
      col,
      player: this.currentPlayer,
      boardState: JSON.parse(JSON.stringify(this.board)),
      moveCount: this.moveCount
    });

    // 检查是否获胜
    if (this.checkWin(row, col)) {
      this.gameOver = true;
      this.winner = this.currentPlayer;
      return true;
    }

    // 检查是否平局
    if (this.isBoardFull()) {
      this.gameOver = true;
      return true;
    }

    // 切换玩家
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    return true;
  }

  // 检查是否获胜
  checkWin(row, col) {
    const player = this.board[row][col];
    const directions = [
      [0, 1],  // 水平
      [1, 0],  // 垂直
      [1, 1],  // 对角线
      [1, -1]  // 反对角线
    ];

    for (let [dx, dy] of directions) {
      let count = 1; // 包含当前落子
      let leftBlocked = false;
      let rightBlocked = false;

      // 向一个方向检查
      for (let i = 1; i <= 5; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        if (r >= 0 && r < 15 && c >= 0 && c < 15) {
          if (this.board[r][c] === player) {
            count++;
          } else if (this.board[r][c] !== 0) {
            rightBlocked = true;
            break;
          } else {
            break;
          }
        } else {
          rightBlocked = true;
          break;
        }
      }

      // 向相反方向检查
      for (let i = 1; i <= 5; i++) {
        const r = row - dx * i;
        const c = col - dy * i;
        if (r >= 0 && r < 15 && c >= 0 && c < 15) {
          if (this.board[r][c] === player) {
            count++;
          } else if (this.board[r][c] !== 0) {
            leftBlocked = true;
            break;
          } else {
            break;
          }
        } else {
          leftBlocked = true;
          break;
        }
      }

      // 如果正好连成5子且两端都未被完全封堵，则获胜
      if (count === 5 && !(leftBlocked && rightBlocked)) {
        return true;
      }
      // 如果超过5子，按照标准五子棋规则不算获胜
      if (count > 5) {
        return false;
      }
    }

    return false;
  }

  // 检查棋盘是否已满
  isBoardFull() {
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if (this.board[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  // 悔棋
  undo() {
    if (this.moveHistory.length === 0) {
      return false;
    }

    const lastMove = this.moveHistory.pop();
    this.board = lastMove.boardState;
    this.currentPlayer = lastMove.player;
    this.moveCount = lastMove.moveCount - 1;
    this.gameOver = false;
    this.winner = null;

    // 更新棋子统计
    if (lastMove.player === 1) {
      this.blackStones--;
    } else {
      this.whiteStones--;
    }

    return true;
  }

  // 重新开始游戏
  reset() {
    this.board = Array(15).fill().map(() => Array(15).fill(0));
    this.currentPlayer = 1;
    this.gameOver = false;
    this.winner = null;
    this.moveHistory = [];
    this.moveCount = 0;
    this.blackStones = 0;
    this.whiteStones = 0;
  }

  // 获取当前玩家
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  // 获取游戏状态
  getGameState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameOver: this.gameOver,
      winner: this.winner,
      moveCount: this.moveCount,
      blackStones: this.blackStones,
      whiteStones: this.whiteStones,
      canUndo: this.moveHistory.length > 0
    };
  }

  // 获取游戏统计
  getGameStats() {
    return {
      moveCount: this.moveCount,
      blackStones: this.blackStones,
      whiteStones: this.whiteStones,
      isGameOver: this.gameOver,
      winner: this.winner
    };
  }
}

export default GomokuGame;