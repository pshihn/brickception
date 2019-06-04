import { Game } from './game.js';

const brickCanvas = document.getElementById('brickCanvas') as HTMLCanvasElement;
const ballCanvas = document.getElementById('ballCanvas') as HTMLCanvasElement;
const game = new Game(brickCanvas, ballCanvas);
setTimeout(() => {
  game.connect();
}, 500);