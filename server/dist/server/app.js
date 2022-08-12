"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const constants_1 = require("./constants");
const game_1 = require("./game");
const snakeHelper_1 = require("./snakeHelper");
const SocketTypes_1 = require("../src/shared/SocketTypes");
const types_1 = require("../src/shared/types");
const helper_1 = require("./helper");
const io = new socket_io_1.Server();
let openId = 0;
const players = [];
const snakeCoordinates = {};
const itemToMessage = (food) => ({
    id: -1,
    color: food.type,
    x: food.x,
    y: food.y
});
const clientToMessage = (player) => {
    const addedItems = player.snake.map(snakePiece => ({
        x: snakePiece.x,
        y: snakePiece.y,
        id: player.id,
        color: player.color
    }));
    return addedItems;
};
const sendGameUpdates = ({ added, removed }, socket) => {
    const updates = {
        added: added || [],
        removed: removed || []
    };
    if (socket) {
        socket.emit(SocketTypes_1.ServerEvents.updateGame, updates);
    }
    else {
        io.emit(SocketTypes_1.ServerEvents.updateGame, updates);
    }
};
const updateScores = () => {
    io.emit(SocketTypes_1.ServerEvents.updateScores, players.map(({ id, score, status, color, username }) => ({
        id,
        score,
        status,
        color,
        name: username
    })));
};
const detectSnakeCollision = (player, newHead) => {
    const spot = snakeCoordinates[(0, snakeHelper_1.getKey)(newHead)];
    if (spot !== undefined) {
        const snakePlayer = getPlayer(spot);
        if (player.powerUps[types_1.PowerUpType.JAWS].inUse) {
            const hitPlayer = getPlayer(spot);
            const hitPlayerSnake = hitPlayer.snake;
            const hitIndex = hitPlayerSnake.findIndex(({ x, y }) => x === newHead.x && y === newHead.y);
            const lostCount = hitPlayerSnake.length - hitIndex;
            let lostPieced = [];
            if (lostCount < hitPlayerSnake.length - 1) {
                lostPieced = hitPlayerSnake.splice(hitIndex, lostCount);
            }
            else {
                lostPieced = hitPlayerSnake.splice(1, hitPlayerSnake.length - 1);
            }
            lostPieced.forEach((piece) => {
                delete snakeCoordinates[(0, snakeHelper_1.getKey)(piece)];
            });
            player.snake.push(...Array.from({ length: lostCount }).map(() => ({ x: -1, y: -1 })));
            sendGameUpdates({
                removed: lostPieced
            });
            hitPlayer.score -= lostCount;
            player.score += lostCount;
            return false;
        }
        else if (snakePlayer.status === "dead") {
            player.score += 1;
            const tail = player.snake[player.snake.length - 1];
            player.snake.push(tail);
            updateScores();
            return false;
        }
        else {
            // You dead
            player.status = "dead";
            player.socket.emit(SocketTypes_1.ServerEvents.dead);
            return true;
        }
    }
    return false;
};
const gameTick = () => {
    const updateMessage = {
        added: [],
        removed: []
    };
    players.forEach((player) => {
        if (player.powerUps.freeze.inUse)
            return;
        const { snake, direction, status } = player;
        if (status !== "playing")
            return;
        const head = snake[0];
        const newHead = (0, snakeHelper_1.getNextHeadPosition)(head, direction);
        const hit = detectSnakeCollision(player, newHead);
        if (hit)
            return;
        snake.unshift(newHead);
        const itemHit = (0, game_1.detectItemCollision)(player.id, newHead, snakeCoordinates);
        if ((itemHit === null || itemHit === void 0 ? void 0 : itemHit.hit) !== undefined) {
            const { nextItem, score, powerUp } = itemHit;
            player.score += score;
            updateMessage.added.push(itemToMessage(nextItem));
            switch (powerUp) {
                case undefined: break;
                case types_1.PowerUpType.JAWS:
                    (0, game_1.triggerJaws)(player);
                    break;
                default:
                    player.powerUps[powerUp].count = Math.min(player.powerUps[powerUp].count + 1, constants_1.MAX_POWER_UPS);
                    break;
            }
            player.socket.emit(SocketTypes_1.ServerEvents.updatePlayer, {
                id: player.id,
                color: player.color,
                powerUps: player.powerUps,
                score: player.score,
                status: player.status,
                name: player.username
            });
            updateScores();
        }
        else {
            const tail = snake.pop();
            delete snakeCoordinates[(0, snakeHelper_1.getKey)(tail)];
            updateMessage.removed.push(tail);
        }
        snakeCoordinates[(0, snakeHelper_1.getKey)(newHead)] = player.id;
        if (player.powerUps[types_1.PowerUpType.JAWS].inUse) {
            for (let i = 0; i < 2; i++) {
                if (i < player.snake.length - 1) {
                    updateMessage.added.push(Object.assign({ id: player.id, color: (0, helper_1.getJawsColor)(player.color) }, player.snake[i]));
                }
            }
            if (player.snake.length > 2) {
                updateMessage.added.push(Object.assign({ id: player.id, color: player.color }, player.snake[2]));
            }
        }
        else {
            updateMessage.added.push(Object.assign({ id: player.id, color: player.color }, newHead));
        }
    });
    sendGameUpdates(updateMessage);
};
let timer = null;
let time = 0;
const startGame = () => {
    timer = setInterval(() => {
        const now = Date.now();
        if (now - time >= constants_1.speed) {
            time = now;
            gameTick();
        }
    }, 1);
};
const getPlayer = (id) => {
    const index = players.findIndex(player => player.id === id);
    const player = players[index];
    return player;
};
io.on("connection", (socket) => {
    let id;
    const playerStart = () => {
        const index = players.findIndex(player => player.id === id);
        const head = (0, snakeHelper_1.randomSquare)();
        snakeCoordinates[(0, snakeHelper_1.getKey)(head)] = id;
        const player = {
            id,
            username: `Player ${id}`,
            color: (0, helper_1.generateRandomeColor)(),
            snake: [head],
            direction: types_1.Direction.RIGHT,
            score: 0,
            status: "playing",
            powerUps: {
                boost: { count: 0, inUse: false },
                freeze: { count: 0, inUse: false },
                jaws: { count: 0, inUse: false },
                invert: { count: 0, inUse: false }
            },
            socket,
        };
        if (index !== -1) {
            players[index] = player;
        }
        else {
            players.push(player);
        }
        socket.emit(SocketTypes_1.ServerEvents.updatePlayer, {
            id,
            score: player.score,
            status: player.status,
            color: player.color,
            powerUps: player.powerUps,
            name: player.username
        });
    };
    const initialize = (_id) => {
        id = _id;
        playerStart();
        const newFoods = [];
        for (let i = 0; i < constants_1.PLAYER_START_FOODS; i++) {
            const newItem = (0, game_1.generateNewItem)(id, snakeCoordinates, types_1.ItemType.FOOD);
            newFoods.push(newItem);
        }
        sendGameUpdates({
            added: newFoods.map(itemToMessage)
        });
        updateScores();
        socket.emit(SocketTypes_1.ServerEvents.initializeGame, {
            added: [...players.map(clientToMessage).flat(), ...(0, game_1.getItems)().map(itemToMessage)]
        });
    };
    initialize(openId++);
    console.log(`User connected ${id} - timer is ${timer ? "Running" : "null"}`);
    if (!timer) {
        startGame();
    }
    socket.on(SocketTypes_1.ClientEvents.powerUp, (powerUp) => {
        const player = getPlayer(id);
        if (player.status !== "playing")
            return;
        if (player.powerUps[powerUp].inUse)
            return;
        if (player.powerUps[powerUp].count <= 0)
            return;
        player.powerUps[powerUp].count -= 1;
        player.powerUps[powerUp].inUse = true;
        socket.emit(SocketTypes_1.ServerEvents.updatePlayer, {
            id,
            score: player.score,
            status: player.status,
            color: player.color,
            powerUps: player.powerUps,
            name: player.username
        });
        if (powerUp === types_1.PowerUpType.INVERT) {
            (0, game_1.triggerInvert)(player);
        }
        else if (powerUp === types_1.PowerUpType.FREEZE) {
            (0, game_1.triggerFreeze)(player);
        }
        else if (powerUp === types_1.PowerUpType.BOOST) {
            for (let i = 0; i < 5; i++) {
                const head = player.snake[0];
                const nextHead = (0, snakeHelper_1.getNextHeadPosition)(head, player.direction);
                snakeCoordinates[(0, snakeHelper_1.getKey)(nextHead)] = id;
                player.snake.unshift(nextHead);
            }
            sendGameUpdates({
                added: clientToMessage(player)
            });
            setTimeout(() => {
                const removed = [];
                player.powerUps[types_1.PowerUpType.BOOST].inUse = false;
                for (let i = 0; i < 5; i++) {
                    if (player.snake.length > 1) {
                        const tail = player.snake.pop();
                        delete snakeCoordinates[(0, snakeHelper_1.getKey)(tail)];
                        removed.push(tail);
                    }
                }
                sendGameUpdates({
                    removed
                });
            }, 5000);
        }
    });
    socket.on(SocketTypes_1.ClientEvents.updateDirection, (direction) => {
        const invert = (0, game_1.getInvertStatus)();
        const player = getPlayer(id);
        let currentDirection = player.direction;
        if (invert.inPlay && invert.id !== player.id) {
            if (direction === types_1.Direction.UP)
                direction = types_1.Direction.DOWN;
            if (direction === types_1.Direction.DOWN)
                direction = types_1.Direction.UP;
            if (direction === types_1.Direction.LEFT)
                direction = types_1.Direction.RIGHT;
            if (direction === types_1.Direction.RIGHT)
                direction = types_1.Direction.LEFT;
        }
        if (currentDirection === types_1.Direction.UP && direction === types_1.Direction.DOWN)
            return;
        if (currentDirection === types_1.Direction.DOWN && direction === types_1.Direction.UP)
            return;
        if (currentDirection === types_1.Direction.LEFT && direction === types_1.Direction.RIGHT)
            return;
        if (currentDirection === types_1.Direction.RIGHT && direction === types_1.Direction.LEFT)
            return;
        player.direction = direction;
    });
    const deleteUserSnake = () => {
        const player = getPlayer(id);
        player.snake.forEach((piece) => {
            delete snakeCoordinates[(0, snakeHelper_1.getKey)(piece)];
        });
        const index = players.findIndex(player => player.id === id);
        players.splice(index, 1);
        sendGameUpdates({
            removed: player.snake
        });
    };
    socket.on(SocketTypes_1.ClientEvents.restart, () => {
        const player = getPlayer(id);
        if (player.status !== "dead")
            return;
        deleteUserSnake();
        playerStart();
    });
    socket.on(SocketTypes_1.ClientEvents.updateUsername, (username) => {
        const player = getPlayer(id);
        player.username = username;
        updateScores();
    });
    socket.on("disconnect", () => {
        console.log(`User ${id} disconnected`);
        deleteUserSnake();
        const itemToRemove = (0, game_1.removePlayerItems)(id);
        sendGameUpdates({
            removed: itemToRemove
        });
    });
});
try {
    io.listen(4000);
    console.log(`Listening on port 4000`);
}
catch (_a) { }
//# sourceMappingURL=app.js.map