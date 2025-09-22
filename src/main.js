// 五子棋游戏主程序
import GomokuGame from './game.js';

class GomokuUI {
  constructor() {
    this.game = new GomokuGame();
    this.boardElement = document.getElementById('board');
    this.playerElement = document.getElementById('player');
    this.statusElement = document.getElementById('status');
    this.winnerElement = document.getElementById('winner');
    this.restartBtn = document.getElementById('restart-btn');

    this.initBoard();
    this.bindEvents();
  }

  // 初始化棋盘
  initBoard() {
    // 清空棋盘
    this.boardElement.innerHTML = '';

    // 设置棋盘大小
    this.boardElement.style.width = '450px';
    this.boardElement.style.height = '450px';

    // 更新游戏状态显示
    this.updateGameInfo();
  }

  // 处理棋盘点击事件
  handleBoardClick(e) {
    // 阻止事件冒泡
    e.stopPropagation();

    if (this.game.gameOver) return;

    // 计算点击位置对应的行列
    const rect = this.boardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 计算行列索引（每个格子30px）
    const col = Math.floor(x / 30);
    const row = Math.floor(y / 30);

    // 检查行列是否在有效范围内
    if (row >= 0 && row < 15 && col >= 0 && col < 15) {
      // 尝试落子
      if (this.game.makeMove(row, col)) {
        this.updateBoard();
        this.updateGameInfo();
      }
    }
  }

  // 绑定事件
  bindEvents() {
    // 棋盘点击事件
    this.boardElement.addEventListener('click', this.handleBoardClick.bind(this));

    // 重新开始按钮事件
    this.restartBtn.addEventListener('click', () => {
      this.game.reset();
      this.initBoard();
      this.updateBoard();
      this.updateGameInfo();
    });
  }

  // 更新棋盘显示
  updateBoard() {
    // 获取当前游戏状态
    const gameState = this.game.getGameState();

    // 清空所有棋子
    document.querySelectorAll('.stone').forEach(stone => stone.remove());

    // 根据游戏状态绘制棋子
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        const value = gameState.board[row][col];
        if (value !== 0) {
          const stone = document.createElement('div');
          stone.className = `stone ${value === 1 ? 'black-stone' : 'white-stone'}`;
          stone.style.top = `${row * 30 + 3}px`;
          stone.style.left = `${col * 30 + 3}px`;
          this.boardElement.appendChild(stone);
        }
      }
    }
  }

  // 更新游戏信息显示
  updateGameInfo() {
    // 更新当前玩家显示
    this.playerElement.textContent = this.game.getCurrentPlayer() === 1 ? '黑子' : '白子';

    // 更新游戏状态显示
    if (this.game.gameOver) {
      if (this.game.winner) {
        this.statusElement.textContent = '游戏结束';
        this.winnerElement.textContent = `恭喜！${this.game.winner === 1 ? '黑子' : '白子'}获胜！`;
      } else {
        this.statusElement.textContent = '游戏结束';
        this.winnerElement.textContent = '平局！';
      }
    } else {
      this.statusElement.textContent = '进行中';
      this.winnerElement.textContent = '';
    }
  }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  new GomokuUI();
});