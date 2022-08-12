import { Coordinate, Game, GameState } from "./types";

export const getKey = (x: number, y: number) => `${x},${y}`;
export const getNewFood = (width: number, height: number): Coordinate => [Math.floor(Math.random() * width), Math.floor(Math.random() * height)];

export const detectCollisions = (state: Game) => {
  const { text, food, width, height } = state;
  const hitSelf = () => {
    const snakeBody = text.filter((_, i) => i > 0);

    return snakeBody.find(([x1, y1]) => x1 === text[0][0] && y1 === text[0][1]);
  }

  const detectHitFood = () => {
    if (text[0][0] === food[0] && text[0][1] === food[1]) {
      state.score += 1;
      let newFood = getNewFood(state.width, state.height);
      while (text.find(([x1, y1]) => x1 === newFood[0] && y1 === newFood[1])) {
        newFood = getNewFood(state.width, state.height);
      }
      state.food = newFood;
    } else {
      text.pop();
    }
  }

  const level1Detetion = () => {
    const head = state.text[0];
    if (head[0] > width - 1) head[0] = 0;
    if (head[0] < 0) head[0] = width - 1;
    if (head[1] > height - 1) head[1] = 0;
    if (head[1] < 0) head[1] = height - 1;
    if (hitSelf()) {
      state.gameState = GameState.DEAD;
    }
    detectHitFood();
  }

  switch (state.level) {
    default:
    case 1: level1Detetion(); break;
  }
}