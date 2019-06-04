export type State = 'home' | 'running' | 'over' | 'error';

export interface SetStateDetail {
  state: State;
  error?: Error;
}