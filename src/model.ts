export interface Brick {
  broken: boolean;
  x: number;
  y: number;
  color: string;
}

export interface Ball {
  radius: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaddlePosition {
  x: number;
  y: number;
  width: number;
  xr: number;
}

export interface Model {
  bricks: Brick[];
  ball: Ball;
  paddle: Paddle;
  width: number;
  height: number;
}

export interface GameState {
  livesLeft: number;
  level: number;
  score: number;
}

export interface GameConfig {
  brickWidth: number;
  brickHeight: number;
  brickGap: number;
  rowCount: number;
  ballRadius: number;
  baseSpeed: number;
  paddleWindow: boolean;
}