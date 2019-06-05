import { Game } from './game.js';
import { $ } from './utils.js';

const brickCanvas = $('brickCanvas') as HTMLCanvasElement;
const ballCanvas = $('ballCanvas') as HTMLCanvasElement;
const game = new Game(brickCanvas, ballCanvas);
setTimeout(() => {
  game.connect();
}, 500);