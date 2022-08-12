import { BOOST_CHANCE, FREEZE_CHANCE, INVERT_CHANCE, JAWS_CHANCE } from "./constants";
import { getKey, randomSquare } from "./snakeHelper";
import { Coordinate, Item, ItemType, Player, PowerUpType, SnakeCoordinates } from "../src/shared/types";

let items: Item[] = [];

export const generateNewItem = (id: number, snakeCoordinates: SnakeCoordinates, type: ItemType) => {
  let nextCoordinates = randomSquare();
  while (
    snakeCoordinates[getKey(nextCoordinates)] &&
    items.find(({ x, y }) => x === nextCoordinates.x && y === nextCoordinates.y)) {
    nextCoordinates = randomSquare();
  }
  let nextItem: Item = { ...nextCoordinates, type, id };

  items.push(nextItem);
  return nextItem;
}

const getRandomItemType = (): ItemType => {
  const value = Math.floor(Math.random() * 100);
  if (value < BOOST_CHANCE) return ItemType.BOOST;
  if (value < JAWS_CHANCE) return ItemType.JAWS;
  if (value < FREEZE_CHANCE) return ItemType.FREEZE;
  if (value < INVERT_CHANCE) return ItemType.INVERT;
  return ItemType.FOOD;
}

export const detectItemCollision = (id: number, head: Coordinate, snakeCoordinates: SnakeCoordinates) => {
  const itemIndex = items.findIndex(({ x, y }) => head.x === x && head.y === y);
  if (itemIndex !== -1) {
    const item = items[itemIndex];
    items.splice(itemIndex, 1);

    let type = ItemType.FOOD;
    if (item.type === ItemType.FOOD) {
      type = getRandomItemType();
    }
    const nextItem = generateNewItem(id, snakeCoordinates, type);

    if (item.type === ItemType.FOOD) {
      return {
        score: 1,
        nextItem,
        hit: true
      }
    } else if (item.type === ItemType.BOOST) {
      return {
        nextItem,
        score: 0,
        powerUp: PowerUpType.BOOST,
        hit: true
      }
    } else if (item.type === ItemType.JAWS) {
      return {
        nextItem,
        powerUp: PowerUpType.JAWS,
        score: 0,
        hit: true
      }
    } else if (item.type === ItemType.FREEZE) {
      return {
        nextItem,
        powerUp: PowerUpType.FREEZE,
        score: 0,
        hit: true
      }
    } else if (item.type === ItemType.INVERT) {
      return {
        nextItem,
        powerUp: PowerUpType.INVERT,
        score: 0,
        hit: true
      }
    }
    return {
      hit: false
    }
  }
}

export const removePlayerItems = (id: number) => {
  const itemsToRemove = items.filter((item) => item.id === id);
  items = items.filter((item) => item.id !== id);
  return itemsToRemove;
}

export const getItems = () => items;

export const triggerJaws = (player: Player) => {
  player.powerUps[PowerUpType.JAWS].inUse = true;
  setTimeout(() => {
    player.powerUps[PowerUpType.JAWS].inUse = false;
  }, 5000);
}

export const triggerFreeze = (player: Player) => {
  player.powerUps[PowerUpType.FREEZE].inUse = true;
  setTimeout(() => {
    player.powerUps[PowerUpType.FREEZE].inUse = false;
  }, Math.floor(Math.random() * 2000) + 1000);
}

export const triggerInvert = (player: Player) => {
  player.powerUps[PowerUpType.INVERT].inUse = true;
  invert.inPlay = true;
  invert.id = player.id;
  setTimeout(() => {
    invert.inPlay = false;
    invert.id = null;
    player.powerUps[PowerUpType.INVERT].inUse = false;
  }, 1500);
}

const invert = {
  inPlay: false,
  id: null
};

export const getInvertStatus = () => invert;