import { GameEngine, GameListener } from './game-engine.js';
import { State, SetStateDetail } from './core.js';
import { GameState } from './model.js';
import { $, setv, store } from './utils.js';

interface StoredData {
  hiscore: number;
}

const mainView = document.querySelector('main')!;
const gameView = $('gameView')!;
const stateTitle = $('stateTitle');
const level = $('level');
const balls = $('balls');
const score = $('score');
const hiscore = $('hiscore');
const stopButton = $('stopButton');
const homeButton = $('homeButton');
const replayButton = $('replayButton');
const launchButton = $('launchButton');

const KEY_STORAGE = 'game-data';

class HomeApp implements GameListener {
  private appState: State = 'home';
  private error?: Error;
  private engine = new GameEngine(this);
  private storedData: StoredData;

  constructor() {
    this.storedData = store.get<StoredData>(KEY_STORAGE) || { hiscore: 0 };
    this.updateHiScore();
    stopButton.addEventListener('click', () => this.engine.gameOver());
  }

  appStateChanged(detail: SetStateDetail): void {
    this.error = detail.error;
    this.setState(detail.state);
  }

  gameStateChanged(stats: GameState): void {
    setv(level, stats.level);
    setv(balls, stats.livesLeft);
    setv(score, stats.score);
  }

  private updateHiScore() {
    setv(hiscore, this.storedData.hiscore);
  }

  setState(state: State) {
    if (this.appState !== state) {
      const prevState = this.appState;
      this.appState = state;
      switch (state) {
        case 'home':
          this.engine.closeWindows();
          mainView.classList.remove('hidden');
          gameView.classList.add('hidden');
          break;
        case 'running':
          if (prevState === 'home') {
            mainView.classList.add('hidden');
            gameView.classList.remove('hidden');
          }
          try {
            this.engine.start();
          } catch (err) {
            this.error = err;
            this.setState('error');
          }
          setv(stateTitle, 'Game in progress');
          stopButton.classList.remove('hidden');
          homeButton.classList.add('hidden');
          replayButton.classList.add('hidden');
          break;
        case 'error':
          if (this.error) {
            if (!this.error.message) {
              this.error.message = 'Ooops! Something went wrong. Try again.';
            }
            window.alert(this.error.message);
          } else {
            this.setState('home');
          }
          stopButton.classList.add('hidden');
          homeButton.classList.remove('hidden');
          replayButton.classList.remove('hidden');
          break;
        case 'over':
          const score = this.engine.gameState.score;
          if (score > this.storedData.hiscore) {
            this.storedData.hiscore = score;
            store.set(KEY_STORAGE, this.storedData);
            setv(stateTitle, 'Game over. high score!');
          } else {
            setv(stateTitle, 'Game over!');
          }
          this.updateHiScore();
          stopButton.classList.add('hidden');
          homeButton.classList.remove('hidden');
          replayButton.classList.remove('hidden');
          break;
      }
    }
  }
}

const homeApp = new HomeApp();
launchButton.addEventListener('click', () => homeApp.setState('running'));
replayButton.addEventListener('click', () => homeApp.setState('running'));
homeButton.addEventListener('click', () => homeApp.setState('home'));