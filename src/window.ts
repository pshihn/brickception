import { GameState, GameConfig } from './model';

export interface PaddlePosition {
  x: number;
  y: number;
  width: number;
  xr: number;
}

export interface BaseWindow {
  ready(): void;
  died(): void;
  hit(bricksLeft: boolean): void;
  getPaddlePosition(): Promise<PaddlePosition>;
  setFps(fps: number, paddleView: boolean): void;
}

export interface GameWindow {
  initialize(config: GameConfig, state: GameState): void;
  launchBall(): void;
  setState(state: GameState): void;
  setLabel(value: string): void;
  stop(): void;
}