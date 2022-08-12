"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSquare = exports.getKey = exports.getNextHeadPosition = void 0;
const constants_1 = require("./constants");
const types_1 = require("../src/shared/types");
const getNextHeadPosition = (head, direction) => {
    let nextX = head.x;
    let nextY = head.y;
    switch (direction) {
        case types_1.Direction.RIGHT:
            nextX = head.x + 1;
            break;
        case types_1.Direction.LEFT:
            nextX = head.x - 1;
            break;
        case types_1.Direction.UP:
            nextY = head.y - 1;
            break;
        case types_1.Direction.DOWN:
            nextY = head.y + 1;
            break;
    }
    if (nextX > constants_1.width - 1)
        nextX = 0;
    if (nextX < 0)
        nextX = constants_1.width - 1;
    if (nextY > constants_1.height - 1)
        nextY = 0;
    if (nextY < 0)
        nextY = constants_1.height - 1;
    return {
        x: nextX,
        y: nextY
    };
};
exports.getNextHeadPosition = getNextHeadPosition;
const getKey = (head) => `${head.x},${head.y}`;
exports.getKey = getKey;
const randomSquare = () => ({
    x: Math.floor(Math.random() * constants_1.width),
    y: Math.floor(Math.random() * constants_1.height)
});
exports.randomSquare = randomSquare;
//# sourceMappingURL=snakeHelper.js.map