import { Direction, InitializeGame, PlayerInfo, PowerUpType, Score, UpdateMessage } from "./types";

export enum ServerEvents {
  updateGame = "updateGame",
  updateScores = "updateScores",
  dead = "dead",
  updatePlayer = "updatePlayer",
  initializeGame = "initializeGame"
}

export enum ClientEvents {
  updateDirection = "direction",
  powerUp = "powerUp",
  restart = "restart",
  updateUsername = "setName",
}

export interface ServerToClientEvents {
  [ServerEvents.updateGame]: (updates: UpdateMessage) => void;
  [ServerEvents.updateScores]: (scores: Score[]) => void;
  [ServerEvents.dead]: () => void;
  [ServerEvents.updatePlayer]: (playerInfo: PlayerInfo) => void;
  [ServerEvents.initializeGame]: (message: InitializeGame) => void;
}

export interface ClientToServerEvents {
  [ClientEvents.updateDirection]: (direction: Direction) => void;
  [ClientEvents.powerUp]: (powerUp: PowerUpType) => void;
  [ClientEvents.restart]: () => void;
  [ClientEvents.updateUsername]: (username: string) => void;
}

export interface InterServerEvents {
  updateGame: (updates: UpdateMessage) => void;
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}