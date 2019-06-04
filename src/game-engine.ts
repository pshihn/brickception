import { BaseWindow, GameWindow, PaddlePosition } from './window';
import { GameState } from './model';
import { link, expose } from 'windtalk';
import { SetStateDetail } from './core';

const BALL_RADIUS = 8;
const BASE_BALL_SPEED = 4;
const BRICK_W = 60;
const BRICK_H = 20;
const BRICK_GAP = 4;
const ROWS = 4;
const INITIAL_LIVES = 5;

interface GameWrapper {
  win: Window;
  game: GameWindow;
}

const winArgs = 'menubar=no,toolbar=no,location=no,personalbar=no,status=no,dependent=yes,minimizable=no,resizable=no,scrollbars=no';

export interface GameListener {
  appStateChanged(state: SetStateDetail): void;
  gameStateChanged(stats: GameState): void;
}

export class GameEngine implements BaseWindow {
  gameState: GameState;
  private base?: GameWrapper;
  private paddle?: GameWrapper;
  private windowsWon = 0;
  private windowsReady = 0;
  private ballLaunching = false;
  private listener: GameListener;

  constructor(listener: GameListener) {
    this.listener = listener;
    this.gameState = { level: 1, livesLeft: INITIAL_LIVES, score: 0 };
    expose(this);
  }

  start() {
    this.closeWindows();
    this.gameState = { level: 1, livesLeft: INITIAL_LIVES, score: 0 };
    this.listener.gameStateChanged(this.gameState);
    this.windowsWon = 0;
    this.windowsReady = 0;
    this.ballLaunching = false;

    const screenH = window.screen.availHeight || window.screen.height;
    const screenW = window.screen.availWidth || window.screen.width;

    const baseHeight = Math.min(screenH - 80, 800);
    const w1 = this.openWindow('base', Math.min(1000, screenW - 20), baseHeight, 0);
    const w2 = this.openWindow('paddle', 400, 300, baseHeight - 300);
    if (w1 && w2) {
      this.base = {
        win: w1,
        game: link(w1)
      };
      this.paddle = {
        win: w2,
        game: link(w2)
      };
      w1.addEventListener('beforeunload', () => this.gameOver());
      w2.addEventListener('beforeunload', () => this.gameOver());
    } else {
      this.closeWindows();
      throw new Error('Failed to launch game windows. Ensure that popups are enabled for this site.');
    }
  }

  private openWindow(name: string, width: number, height: number, top: number): Window | null {
    const winx = (window.screenLeft || window.screenX);
    let left = 0;
    if (winx < 0 && Math.abs(winx) > width) {
      left = winx + Math.round((Math.abs(winx) - width) / 2);
    } else {
      left = (window.screen.availWidth || window.screen.width) - width;
      left = left > 0 ? (left / 2) : 0;
    }
    const w = window.open('./game.html', name, `${winArgs},top=${top},left=${left},width=${width},height=${height}`);
    if (w) {
      w.moveTo(left, top);
      w.focus();
    }
    return w;
  }

  closeWindows() {
    if (this.base && !this.base.win.closed) {
      this.base.win.close();
      this.base = undefined;
    }
    if (this.paddle && !this.paddle.win.closed) {
      this.paddle.win.close();
      this.paddle = undefined;
    }
  }

  private updateState() {
    if (this.base && this.paddle) {
      this.base.game.setState(this.gameState);
      this.paddle.game.setState(this.gameState);
    }
    this.listener.gameStateChanged(this.gameState);
  }

  private setGameLabel(value: string) {
    if (this.base && this.paddle) {
      this.base.game.setLabel(value);
      this.paddle.game.setLabel(value);
    }
  }

  private launchBalls() {
    if (this.base && this.paddle && (!this.ballLaunching)) {
      this.ballLaunching = true;
      this.base.game.stop();
      this.paddle.game.stop();
      this.launchTick(3);
    }
  }

  private launchTick(n: number) {
    if (n === 0) {
      if (this.base && this.paddle) {
        this.ballLaunching = false;
        this.setGameLabel('');
        this.base.game.launchBall();
        this.paddle.game.launchBall();
      }
    } else {
      this.setGameLabel(`${n}`);
      setTimeout(() => {
        if (this.base && this.paddle) {
          this.launchTick(n - 1);
        }
      }, 1000);
    }
  }

  ready(): void {
    this.windowsReady++;
    if (this.windowsReady === 2) {
      this.initializeWindows();
      this.launchBalls();
    }
  }

  private initializeWindows() {
    this.base!.game.initialize({
      ballRadius: BALL_RADIUS,
      baseSpeed: BASE_BALL_SPEED,
      brickGap: BRICK_GAP,
      brickHeight: BRICK_H,
      brickWidth: BRICK_W,
      rowCount: ROWS,
      paddleWindow: false
    }, this.gameState);
    this.paddle!.game.initialize({
      ballRadius: BALL_RADIUS / 2,
      baseSpeed: BASE_BALL_SPEED / 2,
      brickGap: BRICK_GAP / 2,
      brickHeight: BRICK_H / 2,
      brickWidth: BRICK_W / 2,
      rowCount: ROWS,
      paddleWindow: true
    }, this.gameState);
  }

  died(): void {
    this.gameState.livesLeft--;
    if (this.gameState.livesLeft === 0) {
      this.gameOver();
    } else {
      this.updateState();
      this.launchBalls();
    }
  }

  hit(bricksLeft: boolean): void {
    this.gameState.score++;
    if (!bricksLeft) {
      this.windowsWon++;
      if (this.windowsWon === 2) {
        this.gameState.level++;
        this.windowsWon = 0;
        this.initializeWindows();
        this.setGameLabel(`Level ${this.gameState.level}!`);
        setTimeout(() => {
          this.launchBalls();
        }, 3000);
        return;
      }
    }
    this.updateState();
  }

  async getPaddlePosition(): Promise<PaddlePosition> {
    if (this.paddle && this.base) {
      const dh = this.base.win.outerHeight - this.base.win.innerHeight;
      const x = this.paddle.win.screenX - this.base.win.screenX;
      return {
        x: x,
        y: this.paddle.win.screenY - this.base.win.screenY - dh,
        width: this.paddle.win.outerWidth,
        xr: x / this.base.win.innerWidth
      };
    }
    return { x: 0, y: 0, xr: 0, width: 1 };
  }

  setFps(fps: number, paddleView: boolean): void {
    if (paddleView) {
      document.getElementById('fps2')!.textContent = `${fps} fps`;
    } else {
      document.getElementById('fps')!.textContent = `${fps} fps`;
    }
  }

  gameOver() {
    this.gameState.livesLeft = 0;
    this.closeWindows();
    this.listener.gameStateChanged(this.gameState);
    this.listener.appStateChanged({ state: 'over' });
  }
}