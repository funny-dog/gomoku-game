// 五子棋游戏逻辑
class GomokuGame {
  constructor() {
    // 初始化15x15棋盘，0表示空位，1表示黑子，2表示白子
    this.board = Array(15).fill().map(() => Array(15).fill(0));
    this.currentPlayer = 1; // 1为黑子，2为白子
    this.gameOver = false;
    this.winner = null;
  }

  // 落子
  makeMove(row, col) {
    // 检查游戏是否已结束或位置是否已被占用
    if (this.gameOver || this.board[row][col] !== 0) {
      return false;
    }

    // 落子
    this.board[row][col] = this.currentPlayer;

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

      // 向一个方向检查
      for (let i = 1; i < 5; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        if (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === player) {
          count++;
        } else {
          break;
        }
      }

      // 向相反方向检查
      for (let i = 1; i < 5; i++) {
        const r = row - dx * i;
        const c = col - dy * i;
        if (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === player) {
          count++;
        } else {
          break;
        }
      }

      // 如果连成5子则获胜
      if (count >= 5) {
        return true;
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

  // 重新开始游戏
  reset() {
    this.board = Array(15).fill().map(() => Array(15).fill(0));
    this.currentPlayer = 1;
    this.gameOver = false;
    this.winner = null;
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
      winner: this.winner
    };
  }
}

export default GomokuGame;