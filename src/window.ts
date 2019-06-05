import { GameState, GameConfig, PaddlePosition } from './model';

export interface BaseWindow {
  ready(): void;
  died(): void;
  hit(bricksLeft: boolean): void;
  getPaddlePosition(): Promise<PaddlePosition>;
}

export interface GameWindow {
  initialize(config: GameConfig, state: GameState): void;
  launchBall(): void;
  setState(state: GameState): void;
  setLabel(value: string): void;
  stop(): void;
}