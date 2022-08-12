"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemType = exports.PowerUpType = exports.Direction = void 0;
var Direction;
(function (Direction) {
    Direction["LEFT"] = "left";
    Direction["RIGHT"] = "right";
    Direction["UP"] = "up";
    Direction["DOWN"] = "down";
})(Direction = exports.Direction || (exports.Direction = {}));
var PowerUpType;
(function (PowerUpType) {
    PowerUpType["BOOST"] = "boost";
    PowerUpType["FREEZE"] = "freeze";
    PowerUpType["JAWS"] = "jaws";
    PowerUpType["INVERT"] = "invert";
})(PowerUpType = exports.PowerUpType || (exports.PowerUpType = {}));
var ItemType;
(function (ItemType) {
    ItemType["FOOD"] = "::food::";
    ItemType["BOOST"] = "::boost::";
    ItemType["JAWS"] = "::jaws::";
    ItemType["FREEZE"] = "::freeze::";
    ItemType["INVERT"] = "::invert::";
})(ItemType = exports.ItemType || (exports.ItemType = {}));
//# sourceMappingURL=types.js.map