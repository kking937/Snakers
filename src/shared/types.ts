import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "./SocketTypes";

export interface Score {
  id: number;
  score: number;
  color: string;
  status: PlayerStatus;
  name: string;
}

export interface PlayerInfo extends Score {
  powerUps: PowerUps;
}

export interface InitializeGame {
  added: AddedItem[];
}

export type CoordinateKey = string;

export interface SnakeCoordinates {
  [key: CoordinateKey]: number;
}

export type PlayerStatus = "playing" | "dead";

export enum Direction {
  LEFT = "left",
  RIGHT = "right",
  UP = "up",
  DOWN = "down"
}

export enum PowerUpType {
  BOOST = "boost",
  FREEZE = "freeze",
  JAWS = "jaws",
  INVERT = "invert"
}

interface PowerUp {
  count: number;
  inUse: boolean;
}
export interface PowerUps {
  [PowerUpType.BOOST]: PowerUp;
  [PowerUpType.FREEZE]: PowerUp;
  [PowerUpType.JAWS]: PowerUp;
  [PowerUpType.INVERT]: PowerUp;
}

export interface Player {
  id: number;
  username: string;
  color: string;
  snake: Coordinate[];
  direction: Direction;
  score: number;
  status: PlayerStatus;
  powerUps: PowerUps;
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
}

export interface AddedItem {
  x: number;
  y: number;
  id: number;
  color: string | ItemType;
}

export interface UpdateMessage {
  added: AddedItem[];
  removed: Coordinate[];
}

export enum ItemType {
  FOOD = "::food::",
  BOOST = "::boost::",
  JAWS = "::jaws::",
  FREEZE = "::freeze::",
  INVERT = "::invert::",
}

export interface Item {
  x: number;
  y: number;
  type: ItemType;
  id: number;
}

export interface Coordinate {
  x: number;
  y: number;
}