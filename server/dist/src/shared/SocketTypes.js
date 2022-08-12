"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientEvents = exports.ServerEvents = void 0;
var ServerEvents;
(function (ServerEvents) {
    ServerEvents["updateGame"] = "updateGame";
    ServerEvents["updateScores"] = "updateScores";
    ServerEvents["dead"] = "dead";
    ServerEvents["updatePlayer"] = "updatePlayer";
    ServerEvents["initializeGame"] = "initializeGame";
})(ServerEvents = exports.ServerEvents || (exports.ServerEvents = {}));
var ClientEvents;
(function (ClientEvents) {
    ClientEvents["updateDirection"] = "direction";
    ClientEvents["powerUp"] = "powerUp";
    ClientEvents["restart"] = "restart";
    ClientEvents["updateUsername"] = "setName";
})(ClientEvents = exports.ClientEvents || (exports.ClientEvents = {}));
//# sourceMappingURL=SocketTypes.js.map