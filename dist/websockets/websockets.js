"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Firstock = exports.FirstockWebSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const websocket_functions_1 = require("./websocket_functions");
const logger = {
    info: (msg) => console.info(`[INFO] ${new Date().toISOString()} - ${msg}`),
    error: (msg, err) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
        if (err)
            console.error(err);
    }
};
class FirstockWebSocket {
    constructor(options = {}) {
        this.tokens = options.tokens || [];
        this.option_greeks_tokens = options.option_greeks_tokens || [];
        this.order_data = options.order_data;
        this.position_data = options.position_data;
        this.subscribe_feed_data = options.subscribe_feed_data;
        this.subscribe_option_greeks_data = options.subscribe_option_greeks_data;
        this.on_reconnect = options.on_reconnect;
    }
    toDict() {
        return {
            tokens: this.tokens,
            option_greeks_tokens: this.option_greeks_tokens,
            order_data: this.order_data,
            position_data: this.position_data,
            subscribe_feed_data: this.subscribe_feed_data,
            subscribe_option_greeks_data: this.subscribe_option_greeks_data,
            on_reconnect: this.on_reconnect
        };
    }
}
exports.FirstockWebSocket = FirstockWebSocket;
class Firstock {
    static initializeWebsockets(userId, model, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const finalConfig = Object.assign({ scheme: 'wss', host: 'socket.firstock.in', path: '/ws', source: 'developer-api', accept_encoding: 'gzip, deflate, br', accept_language: 'en-US,en;q=0.9', origin: 'https://firstock.in', max_websocket_connection_retries: 3, time_interval: 5 }, config);
            const [baseUrl, headers, err] = (0, websocket_functions_1.getUrlAndHeaderData)(userId, finalConfig);
            if (err) {
                return [null, { error: { message: err.message } }];
            }
            try {
                const ws = new ws_1.default(baseUrl, { headers });
                yield new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Connection timeout'));
                    }, 10000);
                    ws.once('open', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                    ws.once('error', (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });
                logger.info("WebSocket connection created");
                yield websocket_functions_1.connections.addConnection(ws);
                const msg = yield new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Authentication timeout'));
                    }, 5000);
                    ws.once('message', (data) => {
                        clearTimeout(timeout);
                        resolve(data.toString());
                    });
                    ws.once('error', (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });
                logger.info(`Initial message received: ${msg}`);
                if (msg.includes("Authentication successful")) {
                    logger.info("Authentication successful, starting message reader");
                    yield new Promise(resolve => setTimeout(resolve, 500));
                    const modelDict = model.toDict();
                    (0, websocket_functions_1.readMessage)(userId, ws, modelDict, finalConfig);
                    yield new Promise(resolve => setTimeout(resolve, 500));
                    if (model.tokens && model.tokens.length > 0) {
                        logger.info(`Subscribing to initial tokens: ${model.tokens.join(', ')}`);
                        const subscribeErr = yield (0, websocket_functions_1.subscribe)(ws, model.tokens);
                        if (subscribeErr) {
                            logger.error(`Initial subscription error: ${JSON.stringify(subscribeErr)}`);
                        }
                    }
                    if (model.option_greeks_tokens && model.option_greeks_tokens.length > 0) {
                        logger.info(`Subscribing to option Greeks tokens: ${model.option_greeks_tokens.join(', ')}`);
                        const subscribeErr = yield (0, websocket_functions_1.subscribeOptionGreeks)(ws, model.option_greeks_tokens);
                        if (subscribeErr) {
                            logger.error(`Initial option Greeks subscription error: ${JSON.stringify(subscribeErr)}`);
                        }
                    }
                    return [ws, null];
                }
                else if (msg.includes("Maximum sessions limit")) {
                    yield websocket_functions_1.connections.deleteConnection(ws);
                    return [null, { error: { message: msg } }];
                }
                else {
                    yield websocket_functions_1.connections.deleteConnection(ws);
                    return [null, { error: { message: `Unexpected authentication response: ${msg}` } }];
                }
            }
            catch (e) {
                logger.error(`WebSocket initialization error: ${e.message}`, e);
                return [null, { error: { message: e.message } }];
            }
        });
    }
    static closeWebsocket(ws) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ws === null) {
                return {
                    error: {
                        message: "Connection does not exist"
                    }
                };
            }
            if (yield websocket_functions_1.connections.checkIfConnectionExists(ws)) {
                try {
                    ws.close();
                    yield websocket_functions_1.connections.deleteConnection(ws);
                    return null;
                }
                catch (e) {
                    const errorMsg = e.message.toLowerCase();
                    if (!errorMsg.includes("closed")) {
                        return {
                            error: {
                                message: e.message
                            }
                        };
                    }
                    else {
                        yield websocket_functions_1.connections.deleteConnection(ws);
                        return null;
                    }
                }
            }
            else {
                return {
                    error: {
                        message: "Connection does not exist"
                    }
                };
            }
        });
    }
    static subscribe(ws, tokens) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ws === null) {
                return {
                    error: {
                        message: "Connection does not exist"
                    }
                };
            }
            return (0, websocket_functions_1.subscribe)(ws, tokens);
        });
    }
    static unsubscribe(ws, tokens) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ws === null) {
                return {
                    error: {
                        message: "Connection does not exist"
                    }
                };
            }
            return (0, websocket_functions_1.unsubscribe)(ws, tokens);
        });
    }
    static subscribeOptionGreeks(ws, tokens) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ws === null) {
                return {
                    error: {
                        message: "Connection does not exist"
                    }
                };
            }
            return (0, websocket_functions_1.subscribeOptionGreeks)(ws, tokens);
        });
    }
    static unsubscribeOptionGreeks(ws, tokens) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ws === null) {
                return {
                    error: {
                        message: "Connection does not exist"
                    }
                };
            }
            return (0, websocket_functions_1.unsubscribeOptionGreeks)(ws, tokens);
        });
    }
}
exports.Firstock = Firstock;
