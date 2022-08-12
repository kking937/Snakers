import { Server } from "socket.io";
import { speed, PLAYER_START_FOODS, MAX_POWER_UPS } from "./constants";
import { detectItemCollision, generateNewItem, getInvertStatus, getItems, removePlayerItems, triggerFreeze, triggerInvert, triggerJaws } from "./game";
import { getNextHeadPosition, getKey, randomSquare } from "./snakeHelper";
import { ClientToServerEvents, ServerEvents, InterServerEvents, ServerToClientEvents, SocketData, ClientEvents } from "../src/shared/SocketTypes";
import { AddedItem, Coordinate, Direction, Item, ItemType, Player, PowerUpType, SnakeCoordinates, UpdateMessage } from "../src/shared/types";
import { generateRandomeColor, getJawsColor } from "./helper";
import { createServer } from "http";
import { app } from ".";

export const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

let openId = 0;

const players: Player[] = [];
const snakeCoordinates: SnakeCoordinates = {};

const itemToMessage = (food: Item): AddedItem => ({
  id: -1,
  color: food.type,
  x: food.x,
  y: food.y
});

const clientToMessage = (player: Player): AddedItem[] => {
  const addedItems = player.snake.map(snakePiece => ({
    x: snakePiece.x,
    y: snakePiece.y,
    id: player.id,
    color: player.color
  }))
  return addedItems;
}

const sendGameUpdates = ({ added, removed }: Partial<UpdateMessage>, socket?) => {
  const updates: UpdateMessage = {
    added: added || [],
    removed: removed || []
  };
  if (socket) {
    socket.emit(ServerEvents.updateGame, updates)
  } else {
    io.emit(ServerEvents.updateGame, updates);
  }
}

const updateScores = () => {
  io.emit(ServerEvents.updateScores, players.map(({ id, score, status, color, username }) => ({
    id,
    score,
    status,
    color,
    name: username
  })))
}

const detectSnakeCollision = (player: Player, newHead: Coordinate): boolean => {
  const spot = snakeCoordinates[getKey(newHead)];
  if (spot !== undefined) {
    const snakePlayer = getPlayer(spot);
    if (player.powerUps[PowerUpType.JAWS].inUse) {
      const hitPlayer = getPlayer(spot);
      const hitPlayerSnake = hitPlayer.snake;

      const hitIndex = hitPlayerSnake.findIndex(({ x, y }) => x === newHead.x && y === newHead.y);
      const lostCount = hitPlayerSnake.length - hitIndex;
      let lostPieced = [];
      if (lostCount < hitPlayerSnake.length - 1) {
        lostPieced = hitPlayerSnake.splice(hitIndex, lostCount);
      } else {
        lostPieced = hitPlayerSnake.splice(1, hitPlayerSnake.length - 1);
      }
      lostPieced.forEach((piece) => {
        delete snakeCoordinates[getKey(piece)];
      })
      player.snake.push(...Array.from({ length: lostCount }).map(() => ({ x: -1, y: -1 })));
      sendGameUpdates({
        removed: lostPieced
      });
      hitPlayer.score -= lostCount;
      player.score += lostCount

      return false;
    } else if (snakePlayer.status === "dead") {
      player.score += 1;
      const tail = player.snake[player.snake.length - 1];
      player.snake.push(tail);
      updateScores();
      return false;
    } else {
      // You dead
      player.status = "dead";
      player.socket.emit(ServerEvents.dead);
      return true;
    }
  }
  return false;
}

const gameTick = () => {
  const updateMessage: UpdateMessage = {
    added: [],
    removed: []
  }

  players.forEach((player) => {
    if (player.powerUps.freeze.inUse) return;
    const { snake, direction, status } = player;
    if (status !== "playing") return;
    const head = snake[0];

    const newHead = getNextHeadPosition(head, direction);


    const hit = detectSnakeCollision(player, newHead);
    if (hit) return;

    snake.unshift(newHead);

    const itemHit = detectItemCollision(player.id, newHead, snakeCoordinates);

    if (itemHit?.hit !== undefined) {
      const { nextItem, score, powerUp } = itemHit;
      player.score += score;
      updateMessage.added.push(itemToMessage(nextItem));
      switch (powerUp) {
        case undefined: break;
        case PowerUpType.JAWS: triggerJaws(player); break;
        default:
          player.powerUps[powerUp].count = Math.min(player.powerUps[powerUp].count + 1, MAX_POWER_UPS); break;
      }
      player.socket.emit(ServerEvents.updatePlayer, {
        id: player.id,
        color: player.color,
        powerUps: player.powerUps,
        score: player.score,
        status: player.status,
        name: player.username
      });
      updateScores();
    } else {
      const tail = snake.pop();
      delete snakeCoordinates[getKey(tail)]
      updateMessage.removed.push(tail);
    }
    snakeCoordinates[getKey(newHead)] = player.id;
    if (player.powerUps[PowerUpType.JAWS].inUse) {
      for (let i = 0; i < 2; i++) {
        if (i < player.snake.length - 1) {
          updateMessage.added.push({
            id: player.id,
            color: getJawsColor(player.color),
            ...player.snake[i]
          });
        }
      }
      if (player.snake.length > 2) {
        updateMessage.added.push({
          id: player.id,
          color: player.color,
          ...player.snake[2]
        });
      }

    } else {
      updateMessage.added.push({
        id: player.id,
        color: player.color,
        ...newHead
      });
    }
  });

  sendGameUpdates(updateMessage);
}

let timer = null;
let time = 0;


const startGame = () => {
  timer = setInterval(() => {
    const now = Date.now();
    if (now - time >= speed) {
      time = now;
      gameTick();
    }
  }, 1);
};

const getPlayer = (id: number) => {
  const index = players.findIndex(player => player.id === id);
  const player = players[index];
  return player;
}

io.on("connection", (socket) => {
  let id;
  const playerStart = () => {
    const index = players.findIndex(player => player.id === id);
    const head = randomSquare();
    snakeCoordinates[getKey(head)] = id;

    const player: Player = {
      id,
      username: `Player ${id}`,
      color: generateRandomeColor(),
      snake: [head],
      direction: Direction.RIGHT,
      score: 0,
      status: "playing",
      powerUps: {
        boost: { count: 0, inUse: false },
        freeze: { count: 0, inUse: false },
        jaws: { count: 0, inUse: false },
        invert: { count: 0, inUse: false }
      },
      socket,
    }
    if (index !== -1) {
      players[index] = player;
    } else {
      players.push(player);
    }
    socket.emit(ServerEvents.updatePlayer, {
      id,
      score: player.score,
      status: player.status,
      color: player.color,
      powerUps: player.powerUps,
      name: player.username
    })
  }
  const initialize = (_id) => {
    id = _id;
    playerStart();
    const newFoods: Item[] = [];
    for (let i = 0; i < PLAYER_START_FOODS; i++) {
      const newItem = generateNewItem(id, snakeCoordinates, ItemType.FOOD);
      newFoods.push(newItem);
    }
    sendGameUpdates({
      added: newFoods.map(itemToMessage)
    })
    updateScores();
    socket.emit(ServerEvents.initializeGame, {
      added: [...players.map(clientToMessage).flat(), ...getItems().map(itemToMessage)]
    });
  }
  initialize(openId++);


  console.log(`User connected ${id} - timer is ${timer ? "Running" : "null"}`);
  if (!timer) {
    startGame();
  }

  socket.on(ClientEvents.powerUp, (powerUp: PowerUpType) => {
    const player = getPlayer(id);
    if (player.status !== "playing") return;
    if (player.powerUps[powerUp].inUse) return;
    if (player.powerUps[powerUp].count <= 0) return;
    player.powerUps[powerUp].count -= 1;
    player.powerUps[powerUp].inUse = true;
    socket.emit(ServerEvents.updatePlayer, {
      id,
      score: player.score,
      status: player.status,
      color: player.color,
      powerUps: player.powerUps,
      name: player.username
    });
    if (powerUp === PowerUpType.INVERT) {
      triggerInvert(player);
    }
    else if (powerUp === PowerUpType.FREEZE) {
      triggerFreeze(player);
    }
    else if (powerUp === PowerUpType.BOOST) {
      for (let i = 0; i < 5; i++) {
        const head = player.snake[0];
        const nextHead = getNextHeadPosition(head, player.direction);
        snakeCoordinates[getKey(nextHead)] = id;
        player.snake.unshift(nextHead);
      }
      sendGameUpdates({
        added: clientToMessage(player)
      })
      setTimeout(() => {
        const removed = [];
        player.powerUps[PowerUpType.BOOST].inUse = false;
        for (let i = 0; i < 5; i++) {
          if (player.snake.length > 1) {
            const tail = player.snake.pop();
            delete snakeCoordinates[getKey(tail)];
            removed.push(tail);
          }
        }
        sendGameUpdates({
          removed
        })
      }, 5000)
    }
  });

  socket.on(ClientEvents.updateDirection, (direction: Direction) => {
    const invert = getInvertStatus();
    const player = getPlayer(id);
    let currentDirection = player.direction;
    if (invert.inPlay && invert.id !== player.id) {
      if (direction === Direction.UP) direction = Direction.DOWN;
      if (direction === Direction.DOWN) direction = Direction.UP;
      if (direction === Direction.LEFT) direction = Direction.RIGHT;
      if (direction === Direction.RIGHT) direction = Direction.LEFT;
    }
    if (currentDirection === Direction.UP && direction === Direction.DOWN) return;
    if (currentDirection === Direction.DOWN && direction === Direction.UP) return;
    if (currentDirection === Direction.LEFT && direction === Direction.RIGHT) return;
    if (currentDirection === Direction.RIGHT && direction === Direction.LEFT) return;
    player.direction = direction;
  });

  const deleteUserSnake = () => {
    const player = getPlayer(id);
    player.snake.forEach((piece) => {
      delete snakeCoordinates[getKey(piece)];
    })
    const index = players.findIndex(player => player.id === id);
    players.splice(index, 1);
    sendGameUpdates({
      removed: player.snake
    })
  }

  socket.on(ClientEvents.restart, () => {
    const player = getPlayer(id);
    if (player.status !== "dead") return;
    deleteUserSnake();
    playerStart();
  });

  socket.on(ClientEvents.updateUsername, (username: string) => {
    const player = getPlayer(id);
    player.username = username;
    updateScores();
  });

  socket.on("disconnect", () => {
    console.log(`User ${id} disconnected`)
    deleteUserSnake();
    const itemToRemove = removePlayerItems(id);
    sendGameUpdates({
      removed: itemToRemove
    });
  });
});

try {
  server.listen(4000);
  console.log(`Listening on port 4000`)
} catch { }