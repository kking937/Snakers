"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revertJawsColor = exports.getJawsColor = exports.generateRandomeColor = void 0;
const getRandomNumber = (low, high) => Math.floor(Math.random() * (high - low)) + low;
const generateRandomeColor = () => {
    const LOW = 125;
    const HIGH = 255;
    return `rgb(${getRandomNumber(LOW, HIGH)},${getRandomNumber(LOW, HIGH)},${getRandomNumber(LOW, HIGH)})`;
};
exports.generateRandomeColor = generateRandomeColor;
const JAWS_CHANGE = 100;
let getJawsColor = (color) => {
    const colors = color.substring(4, color.length - 1).split(",").map(s => Number(s) - JAWS_CHANGE);
    return `rgb(${colors.join(",")})`;
};
exports.getJawsColor = getJawsColor;
const revertJawsColor = (color) => {
    const colors = color.substring(4, color.length - 1).split(",").map(s => Number(s) + JAWS_CHANGE);
    return `rgb(${colors.join(",")})`;
};
exports.revertJawsColor = revertJawsColor;
//# sourceMappingURL=helper.js.map