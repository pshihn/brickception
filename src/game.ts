import { Model, Ball, Paddle, GameState, Brick, GameConfig } from './model';
import { GameWindow, BaseWindow } from './window';
import { link, expose } from 'windtalk';

export class Game implements GameWindow {
  private gameModel?: Model;
  private config?: GameConfig;
  private gameState: GameState;
  private brickCanvas: HTMLCanvasElement;
  private ballCanvas: HTMLCanvasElement;
  private overlay?: HTMLDivElement;
  private bricksDrawnOnce = false;
  private running = false;
  private bricksLeft = 0;
  private root: BaseWindow;
  private refWinWidth = 0;
  private refWinHeight = 0;
  private pendingWindowResize = false;
  private baseSpeed = 1;

  constructor(brickCanvas: HTMLCanvasElement, ballCanvas: HTMLCanvasElement) {
    this.brickCanvas = brickCanvas;
    this.ballCanvas = ballCanvas;
    this.root = link(window.opener);
    this.gameState = { level: 1, livesLeft: 5, score: 0 };
    expose(this);
  }

  initialize(config: GameConfig, state: GameState): void {
    this.setState(state);
    this.config = config;

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.brickCanvas.width = width;
    this.brickCanvas.height = height;
    this.ballCanvas.width = width;
    this.ballCanvas.height = height;
    this.brickCanvas.style.opacity = '1';
    this.ballCanvas.style.opacity = '1';
    this.refWinWidth = window.outerWidth;
    this.refWinHeight = window.outerHeight;

    // initialize bricks
    const bricksPerRow = Math.floor((width + this.config.brickGap) / (this.config.brickWidth + this.config.brickGap));
    const rowWidth = (bricksPerRow * this.config.brickWidth) + ((bricksPerRow - 1) * this.config.brickGap);
    const offset = Math.floor((width - rowWidth) / 2);
    const bricks: Brick[] = [];
    for (let i = 0; i < this.config.rowCount; i++) {
      const color = `hsl(${(i + (this.config.paddleWindow ? this.config.rowCount : 0)) * Math.round(360 / (this.config.rowCount * 2))}, 80%, 70%)`;
      for (let j = 0; j < bricksPerRow; j++) {
        bricks.push({
          broken: false,
          color,
          x: offset + j * (this.config.brickWidth + this.config.brickGap),
          y: this.config.brickGap + i * (this.config.brickGap + this.config.brickHeight)
        });
      }
    }
    const ball: Ball = {
      radius: this.config.ballRadius,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0
    };
    const paddle: Paddle = {
      height: 6,
      width: 70,
      x: Math.round(width / 2) - 15,
      y: height - 10
    };
    this.bricksLeft = bricks.length;
    this.gameModel = { ball, paddle, bricks, width, height };
    this.bricksDrawnOnce = false;
    this.resetBall();
    this.draw(false);
  }

  private get model(): Model {
    return this.gameModel!;
  }

  private start() {
    if (!this.running) {
      this.running = true;
      this.nextFrame();
    }
  }

  stop() {
    this.running = false;
  }

  private resetBall() {
    const ball = this.model.ball;
    const baseSpeed = this.config!.baseSpeed + (this.gameState.level - 1) * 0.75;
    ball.x = Math.round(this.model.width / 2);
    ball.y = 10 + this.config!.rowCount * (this.config!.brickHeight + this.config!.brickGap);
    ball.dy = baseSpeed;
    ball.dx = Math.round(Math.random() * baseSpeed) - (baseSpeed * 0.5);
    if (Math.abs(ball.dx) < 0.2) {
      ball.dx = 0.2 * (Math.random() > 0.5 ? -1 : 1);
    }
    this.baseSpeed = baseSpeed;
  }

  private get maxSpeed(): number {
    return 1.5 * this.baseSpeed;
  }

  private ensureWindowSize() {
    if (this.refWinHeight && this.refWinWidth && (!this.pendingWindowResize)) {
      if (this.refWinWidth !== window.outerWidth || this.refWinHeight !== window.outerHeight) {
        this.pendingWindowResize = true;
        setTimeout(() => {
          this.pendingWindowResize = false;
          window.resizeTo(this.refWinWidth, this.refWinHeight);
        }, 500);
      }
    }
  }

  private update(): boolean {
    const ball = this.model.ball;
    const paddle = this.model.paddle;
    const newX = ball.x + ball.dx;
    let newY = ball.y + ball.dy;

    // collision detection
    let collisionDirection = 0;
    // no need to check for brick collision if ball is below the lowest row
    if (ball.y <= (10 + this.config!.rowCount * (this.config!.brickHeight + this.config!.brickGap))) {
      for (let i = 0; i < this.model.bricks.length; i++) {
        const brick = this.model.bricks[i];
        if (!brick.broken) {
          const dx = ball.x - Math.max(brick.x, Math.min(ball.x, brick.x + this.config!.brickWidth));
          const dy = ball.y - Math.max(brick.y, Math.min(ball.y, brick.y + this.config!.brickHeight));
          const collides = (dx * dx + dy * dy) < (ball.radius * ball.radius);
          if (collides) {
            brick.broken = true;
            collisionDirection = ((ball.y >= brick.y) && (ball.y <= (brick.y + this.config!.brickHeight))) ? -1 : 1;
            this.bricksLeft--;
            this.root.hit(this.bricksLeft > 0 ? true : false);
            break;
          }
        }
      }
    }
    const dxDirection = ball.dx > 0 ? 1 : -1;
    if (collisionDirection) {
      if (collisionDirection < 0) {
        ball.dx = -ball.dx;
      } else {
        ball.dy = -ball.dy;
      }
    } else {
      // side wall collision
      if (newX > this.model.width - ball.radius || newX < ball.radius) {
        ball.dx = -ball.dx;
      }
      if (newY < ball.radius) {
        // ceiling collision
        ball.dy = -ball.dy;
      } else if (newY >= (paddle.y - ball.radius) && newY < paddle.y + paddle.height && newX >= paddle.x && newX < paddle.x + paddle.width) {
        // paddle collision
        ball.dy = -ball.dy;
        const absDx = Math.abs(ball.dx);
        const newDx = Math.min(this.maxSpeed, (1.1 + (newX - (paddle.x + paddle.width / 2)) / paddle.width) * (absDx < 0.15 ? (absDx + Math.random() * 0.5 * this.baseSpeed) : absDx));
        ball.dx = dxDirection * newDx;
        newY = paddle.y - ball.radius;
      } else if (newY > this.model.height - ball.radius) {
        return false;
      }
    }

    ball.x = Math.min(this.model.width - ball.radius, Math.max(ball.radius, newX));
    ball.y = Math.max(ball.radius, newY);

    return true;
  }

  private prevDrawTime = 0;
  private frameCount = 0;
  private async draw(renderNext: boolean): Promise<void> {
    this.frameCount++;
    const now = performance.now();
    if (this.prevDrawTime) {
      if ((now - this.prevDrawTime) >= 1000) {
        this.root.setFps(this.frameCount, this.config!.paddleWindow);
        // if (this.frameCount < 60) {
        //   console.log('frame rate', this.frameCount);
        // }
        this.frameCount = 0;
        this.prevDrawTime = now;
      }
    } else {
      this.frameCount = 0;
      this.prevDrawTime = now;
    }

    this.ensureWindowSize();

    // update paddle
    const paddle = this.model.paddle;
    const pp = await this.root.getPaddlePosition();
    if (this.config!.paddleWindow) {
      paddle.x = pp.xr * this.model.width;
    } else {
      paddle.x = pp.x;
      paddle.y = pp.y;
      paddle.width = pp.width;
    }


    const bl = this.bricksLeft;
    const alive = this.update();
    this.drawBallCanvas();
    if (!this.bricksDrawnOnce) {
      this.drawBricks();
      this.bricksDrawnOnce = true;
    } else if (bl !== this.bricksLeft) {
      this.drawBricks();
    }

    if (!alive) {
      this.root.died();
      this.stop();
    } else if (this.bricksLeft <= 0) {
      // no more bricks
      return;
    }

    if (renderNext) {
      this.nextFrame();
    }
  }

  private nextFrame() {
    if (this.running) {
      requestAnimationFrame(() => this.draw(true));
    }
  }

  private drawBallCanvas() {
    const ctx = this.ballCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.model.width, this.model.height);

    // draw ball
    const ball = this.model.ball;
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y, ball.radius, ball.radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    // draw paddle
    if (this.config!.paddleWindow) {
      const paddle = this.model.paddle;
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.restore();
    }
  }

  private drawBricks() {
    const ctx = this.brickCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.model.width, this.model.height);
    ctx.save();
    this.model.bricks.forEach((b) => {
      if (!b.broken) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, this.config!.brickWidth, this.config!.brickHeight);
      }
    });
    ctx.restore();
  }

  launchBall(): void {
    this.stop();
    this.resetBall();
    setTimeout(() => {
      this.start();
    });
  }

  setState(state: GameState): void {
    this.gameState = state;
    document.title = `Balls left: ${state.livesLeft}`;
  }

  async connect() {
    await this.root.ready();
  }

  setLabel(value: string): void {
    if (!this.overlay) {
      this.overlay = document.getElementById('overlay') as HTMLDivElement;
    }
    if (value) {
      this.overlay.textContent = value;
      this.overlay.style.opacity = '1';
    } else {
      this.overlay.textContent = '';
      this.overlay.style.opacity = null;
    }
  }
}