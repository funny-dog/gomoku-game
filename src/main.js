// 五子棋游戏主程序
import GomokuGame from './game.js';

class GomokuUI {
  constructor() {
    // 检查DOM元素是否存在
    this.boardElement = document.getElementById('board');
    this.playerElement = document.getElementById('player');
    this.statusElement = document.getElementById('status');
    this.winnerElement = document.getElementById('winner');
    this.restartBtn = document.getElementById('restart-btn');
    this.undoBtn = document.getElementById('undo-btn');
    this.moveCountElement = document.getElementById('move-count');
    this.blackStonesElement = document.getElementById('black-stones');
    this.whiteStonesElement = document.getElementById('white-stones');

    // 验证必要元素
    if (!this.boardElement || !this.playerElement || !this.statusElement ||
        !this.winnerElement || !this.restartBtn) {
      throw new Error('Required DOM elements not found');
    }

    this.game = new GomokuGame();
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

    if (this.game.gameOver) {
      this.showToast('游戏已结束，请点击重新开始');
      return;
    }

    // 计算点击位置对应的行列
    const rect = this.boardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 动态计算格子大小
    const cellSize = rect.width / 15;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // 检查行列是否在有效范围内
    if (row >= 0 && row < 15 && col >= 0 && col < 15) {
      try {
        // 尝试落子
        if (this.game.makeMove(row, col)) {
          this.updateBoard();
          this.updateGameInfo();
          this.playStoneSound();
        } else {
          // 落子失败的反馈
          this.showToast('该位置已被占用，请选择其他位置');
        }
      } catch (error) {
        console.error('落子错误:', error);
        this.showToast('落子失败，请重试');
      }
    }
  }

  // 绑定事件
  bindEvents() {
    // 棋盘点击事件
    this.boardElement.addEventListener('click', this.handleBoardClick.bind(this));

    // 重新开始按钮事件
    this.restartBtn.addEventListener('click', () => {
      if (this.game.moveCount > 0) {
        if (confirm('确定要重新开始游戏吗？当前进度将丢失。')) {
          this.game.reset();
          this.initBoard();
          this.updateBoard();
          this.updateGameInfo();
          this.showToast('游戏已重新开始');
        }
      } else {
        this.game.reset();
        this.initBoard();
        this.updateBoard();
        this.updateGameInfo();
      }
    });

    // 悔棋按钮事件
    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', () => {
        if (this.game.undo()) {
          this.updateBoard();
          this.updateGameInfo();
          this.showToast('悔棋成功');
        } else {
          this.showToast('无法悔棋');
        }
      });
    }
  }

  // 更新棋盘显示
  updateBoard() {
    const gameState = this.game.getGameState();
    const currentStones = new Map();

    // 记录当前存在的棋子
    document.querySelectorAll('.stone').forEach(stone => {
      const row = parseInt(stone.dataset.row);
      const col = parseInt(stone.dataset.col);
      currentStones.set(`${row}-${col}`, stone);
    });

    // 使用文档片段批量操作
    const fragment = document.createDocumentFragment();
    const stonesToRemove = [];

    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        const value = gameState.board[row][col];
        const key = `${row}-${col}`;

        if (value !== 0) {
          if (!currentStones.has(key)) {
            // 只添加新棋子
            const stone = this.createStoneElement(row, col, value);
            fragment.appendChild(stone);
          } else {
            // 移除已处理的棋子
            currentStones.delete(key);
          }
        }
      }
    }

    // 批量添加新棋子
    if (fragment.hasChildNodes()) {
      this.boardElement.appendChild(fragment);
    }

    // 移除多余的棋子（如果有的话）
    currentStones.forEach(stone => stonesToRemove.push(stone));
    stonesToRemove.forEach(stone => stone.remove());
  }

  // 创建棋子元素
  createStoneElement(row, col, value) {
    const stone = document.createElement('div');
    stone.className = `stone ${value === 1 ? 'black-stone' : 'white-stone'}`;
    stone.dataset.row = row;
    stone.dataset.col = col;

    // 动态计算棋子位置
    const cellSize = rect.width / 15;
    const stoneSize = cellSize - 6; // 棋子比格子小6px
    const top = row * cellSize + 3;
    const left = col * cellSize + 3;

    // 添加落子动画
    stone.style.cssText = `
      top: ${top}px;
      left: ${left}px;
      width: ${stoneSize}px;
      height: ${stoneSize}px;
      animation: stoneDrop 0.3s ease-out;
    `;

    // 添加动画样式（如果不存在）
    if (!document.getElementById('stone-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'stone-animation-styles';
      style.textContent = `
        @keyframes stoneDrop {
          0% {
            transform: translateY(-20px) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateY(5px) scale(1.1);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return stone;
  }

  // 更新游戏信息显示
  updateGameInfo() {
    const gameState = this.game.getGameState();
    const stats = this.game.getGameStats();

    // 更新当前玩家显示
    this.playerElement.textContent = this.game.getCurrentPlayer() === 1 ? '黑子' : '白子';

    // 更新游戏状态显示
    if (this.game.gameOver) {
      if (this.game.winner) {
        this.statusElement.textContent = '游戏结束';
        this.winnerElement.textContent = `恭喜！${this.game.winner === 1 ? '黑子' : '白子'}获胜！`;
        this.playWinSound();
      } else {
        this.statusElement.textContent = '游戏结束';
        this.winnerElement.textContent = '平局！';
      }
    } else {
      this.statusElement.textContent = '进行中';
      this.winnerElement.textContent = '';
    }

    // 更新统计信息
    if (this.moveCountElement) {
      this.moveCountElement.textContent = stats.moveCount;
    }
    if (this.blackStonesElement) {
      this.blackStonesElement.textContent = stats.blackStones;
    }
    if (this.whiteStonesElement) {
      this.whiteStonesElement.textContent = stats.whiteStones;
    }

    // 更新悔棋按钮状态
    if (this.undoBtn) {
      this.undoBtn.disabled = !gameState.canUndo;
      this.undoBtn.textContent = `悔棋${gameState.canUndo ? '' : ' (不可用)'}`;
    }
  }

  // 显示提示信息
  showToast(message) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;

    // 添加动画样式
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // 3秒后自动移除
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // 播放落子音效
  playStoneSound() {
    try {
      // 创建音频上下文
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // 音频播放失败时静默处理
      console.log('音频播放失败:', error);
    }
  }

  // 播放获胜音效
  playWinSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // 播放上升音调
      const frequencies = [523, 659, 784, 1047]; // C, E, G, C
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);

        oscillator.start(audioContext.currentTime + index * 0.15);
        oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
      });
    } catch (error) {
      console.log('音频播放失败:', error);
    }
  }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  new GomokuUI();
});