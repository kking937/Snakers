"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvertStatus = exports.triggerInvert = exports.triggerFreeze = exports.triggerJaws = exports.getItems = exports.removePlayerItems = exports.detectItemCollision = exports.generateNewItem = void 0;
const constants_1 = require("./constants");
const snakeHelper_1 = require("./snakeHelper");
const types_1 = require("../src/shared/types");
let items = [];
const generateNewItem = (id, snakeCoordinates, type) => {
    let nextCoordinates = (0, snakeHelper_1.randomSquare)();
    while (snakeCoordinates[(0, snakeHelper_1.getKey)(nextCoordinates)] &&
        items.find(({ x, y }) => x === nextCoordinates.x && y === nextCoordinates.y)) {
        nextCoordinates = (0, snakeHelper_1.randomSquare)();
    }
    let nextItem = Object.assign(Object.assign({}, nextCoordinates), { type, id });
    items.push(nextItem);
    return nextItem;
};
exports.generateNewItem = generateNewItem;
const getRandomItemType = () => {
    const value = Math.floor(Math.random() * 100);
    if (value < constants_1.BOOST_CHANCE)
        return types_1.ItemType.BOOST;
    if (value < constants_1.JAWS_CHANCE)
        return types_1.ItemType.JAWS;
    if (value < constants_1.FREEZE_CHANCE)
        return types_1.ItemType.FREEZE;
    if (value < constants_1.INVERT_CHANCE)
        return types_1.ItemType.INVERT;
    return types_1.ItemType.FOOD;
};
const detectItemCollision = (id, head, snakeCoordinates) => {
    const itemIndex = items.findIndex(({ x, y }) => head.x === x && head.y === y);
    if (itemIndex !== -1) {
        const item = items[itemIndex];
        items.splice(itemIndex, 1);
        let type = types_1.ItemType.FOOD;
        if (item.type === types_1.ItemType.FOOD) {
            type = getRandomItemType();
        }
        const nextItem = (0, exports.generateNewItem)(id, snakeCoordinates, type);
        if (item.type === types_1.ItemType.FOOD) {
            return {
                score: 1,
                nextItem,
                hit: true
            };
        }
        else if (item.type === types_1.ItemType.BOOST) {
            return {
                nextItem,
                score: 0,
                powerUp: types_1.PowerUpType.BOOST,
                hit: true
            };
        }
        else if (item.type === types_1.ItemType.JAWS) {
            return {
                nextItem,
                powerUp: types_1.PowerUpType.JAWS,
                score: 0,
                hit: true
            };
        }
        else if (item.type === types_1.ItemType.FREEZE) {
            return {
                nextItem,
                powerUp: types_1.PowerUpType.FREEZE,
                score: 0,
                hit: true
            };
        }
        else if (item.type === types_1.ItemType.INVERT) {
            return {
                nextItem,
                powerUp: types_1.PowerUpType.INVERT,
                score: 0,
                hit: true
            };
        }
        return {
            hit: false
        };
    }
};
exports.detectItemCollision = detectItemCollision;
const removePlayerItems = (id) => {
    const itemsToRemove = items.filter((item) => item.id === id);
    items = items.filter((item) => item.id !== id);
    return itemsToRemove;
};
exports.removePlayerItems = removePlayerItems;
const getItems = () => items;
exports.getItems = getItems;
const triggerJaws = (player) => {
    player.powerUps[types_1.PowerUpType.JAWS].inUse = true;
    setTimeout(() => {
        player.powerUps[types_1.PowerUpType.JAWS].inUse = false;
    }, 5000);
};
exports.triggerJaws = triggerJaws;
const triggerFreeze = (player) => {
    player.powerUps[types_1.PowerUpType.FREEZE].inUse = true;
    setTimeout(() => {
        player.powerUps[types_1.PowerUpType.FREEZE].inUse = false;
    }, Math.floor(Math.random() * 2000) + 1000);
};
exports.triggerFreeze = triggerFreeze;
const triggerInvert = (player) => {
    player.powerUps[types_1.PowerUpType.INVERT].inUse = true;
    invert.inPlay = true;
    invert.id = player.id;
    setTimeout(() => {
        invert.inPlay = false;
        invert.id = null;
        player.powerUps[types_1.PowerUpType.INVERT].inUse = false;
    }, 1500);
};
exports.triggerInvert = triggerInvert;
const invert = {
    inPlay: false,
    id: null
};
const getInvertStatus = () => invert;
exports.getInvertStatus = getInvertStatus;
//# sourceMappingURL=game.js.map