"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstockWebSocket = exports.Firstock = void 0;
const Firstock_1 = require("./Classes/Firstock");
Object.defineProperty(exports, "Firstock", { enumerable: true, get: function () { return Firstock_1.Firstock; } });
const websockets_1 = require("./websockets/websockets");
Object.defineProperty(exports, "FirstockWebSocket", { enumerable: true, get: function () { return websockets_1.FirstockWebSocket; } });
exports.default = Firstock_1.Firstock;
