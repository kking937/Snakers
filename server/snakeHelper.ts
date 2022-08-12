import { width, height } from "./constants";
import { Coordinate, CoordinateKey, Direction } from "../src/shared/types";

export const getNextHeadPosition = (head: Coordinate, direction: Direction): Coordinate => {
  let nextX = head.x;
  let nextY = head.y

  switch (direction) {
    case Direction.RIGHT: nextX = head.x + 1; break;
    case Direction.LEFT: nextX = head.x - 1; break;
    case Direction.UP: nextY = head.y - 1; break;
    case Direction.DOWN: nextY = head.y + 1; break;
  }

  if (nextX > width - 1) nextX = 0;
  if (nextX < 0) nextX = width - 1;
  if (nextY > height - 1) nextY = 0;
  if (nextY < 0) nextY = height - 1;
  return {
    x: nextX,
    y: nextY
  };
}

export const getKey = (head: Coordinate): CoordinateKey => `${head.x},${head.y}`;

export const randomSquare = (): Coordinate => ({
  x: Math.floor(Math.random() * width),
  y: Math.floor(Math.random() * height)
});
