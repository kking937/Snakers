export type Coordinate = [number, number];

export enum GameState {
  IDLE,
  PLAYING,
  DEAD
}

export interface Game {
  score: number;
  speed: number;
  level: number;
  text: Coordinate[];
  food: Coordinate;
  portals: Coordinate[];
  barriers: Coordinate[];
  gameState: GameState;
  width: number;
  height: number;
}

export enum BoxType {
  EMPTY,
  SNAKE,
  FOOD,
  BARRIER,
  PORTAL,
}

export enum Direction {
  LEFT,
  RIGHT,
  UP,
  DOWN
}