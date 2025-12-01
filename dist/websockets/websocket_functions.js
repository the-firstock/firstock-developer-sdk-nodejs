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
exports.connections = exports.UpdateType = void 0;
exports.getUrlAndHeaderData = getUrlAndHeaderData;
exports.readMessage = readMessage;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.subscribeOptionGreeks = subscribeOptionGreeks;
exports.unsubscribeOptionGreeks = unsubscribeOptionGreeks;
const ws_1 = __importDefault(require("ws"));
const fs_1 = require("fs");
// Configure logging
const logger = {
    debug: (msg) => console.debug(`${new Date().toISOString()} - ${msg}`),
    info: (msg) => console.info(`${new Date().toISOString()} - ${msg}`),
    warning: (msg) => console.warn(`${new Date().toISOString()} - ${msg}`),
    error: (msg, err) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
        if (err)
            console.error(err);
    }
};
var UpdateType;
(function (UpdateType) {
    UpdateType["ORDER"] = "order";
    UpdateType["POSITION"] = "position";
    UpdateType["MARKET_FEED"] = "market_feed";
    UpdateType["OPTION_GREEKS"] = "option_greeks";
})(UpdateType || (exports.UpdateType = UpdateType = {}));
class SafeConn {
    constructor(ws) {
        this.lock = false;
        this.ws = ws;
    }
    acquireLock() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.lock) {
                yield new Promise(resolve => setTimeout(resolve, 10));
            }
            this.lock = true;
        });
    }
    releaseLock() {
        this.lock = false;
    }
}
class ConnectionManager {
    constructor() {
        this.connMap = new Map();
        this.indexMap = new Map();
        this.lock = false;
    }
    acquireLock() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.lock) {
                yield new Promise(resolve => setTimeout(resolve, 10));
            }
            this.lock = true;
        });
    }
    releaseLock() {
        this.lock = false;
    }
    countConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.acquireLock();
            const count = this.connMap.size;
            this.releaseLock();
            return count;
        });
    }
    addConnection(ws) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.acquireLock();
            if (this.indexMap.has(ws)) {
                logger.info("Connection already exists");
                this.releaseLock();
                return this.indexMap.get(ws);
            }
            const safe = new SafeConn(ws);
            this.connMap.set(safe, true);
            this.indexMap.set(ws, safe);
            logger.info("Connection added");
            this.releaseLock();
            return safe;
        });
    }
    checkIfConnectionExists(ws) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.acquireLock();
            const exists = this.indexMap.has(ws);
            this.releaseLock();
            return exists;
        });
    }
    writeMessage(ws, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.acquireLock();
            const safe = this.indexMap.get(ws);
            this.releaseLock();
            if (!safe) {
                return "connection not found";
            }
            yield safe.acquireLock();
            try {
                if (safe.ws.readyState === ws_1.default.OPEN) {
                    safe.ws.send(data);
                    safe.releaseLock();
                    return null;
                }
                else {
                    safe.releaseLock();
                    return "WebSocket is not open";
                }
            }
            catch (e) {
                safe.releaseLock();
                return e.message;
            }
        });
    }
    deleteConnection(ws) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.acquireLock();
            if (this.indexMap.has(ws)) {
                // Set shutdown flag BEFORE closing
                _setShutdownFlag(ws);
                const safe = this.indexMap.get(ws);
                this.connMap.delete(safe);
                this.indexMap.delete(ws);
                try {
                    if (ws.readyState === ws_1.default.OPEN || ws.readyState === ws_1.default.CONNECTING) {
                        ws.close();
                    }
                }
                catch (e) {
                    // Ignore errors during close
                }
                logger.info("Connection deleted");
                // Clear subscription tracking
                _clearTrackedSubscriptions(ws);
                this.releaseLock();
                return;
            }
            logger.info("Connection not found");
            this.releaseLock();
        });
    }
}
exports.connections = new ConnectionManager();
const subscriptionTracker = new Map();
function _getWsId(ws) {
    return ws.__wsId || (ws.__wsId = Math.random());
}
function _trackSubscription(ws, tokens, subscriptionType) {
    const wsId = _getWsId(ws);
    if (!subscriptionTracker.has(wsId)) {
        subscriptionTracker.set(wsId, {
            tokens: [],
            option_greeks_tokens: []
        });
    }
    const tracker = subscriptionTracker.get(wsId);
    for (const token of tokens) {
        if (!tracker[subscriptionType].includes(token)) {
            tracker[subscriptionType].push(token);
        }
    }
    logger.debug(`Tracked subscription: ${subscriptionType} - ${tokens.join(', ')}`);
}
function _untrackSubscription(ws, tokens, subscriptionType) {
    const wsId = _getWsId(ws);
    if (subscriptionTracker.has(wsId)) {
        const tracker = subscriptionTracker.get(wsId);
        for (const token of tokens) {
            const index = tracker[subscriptionType].indexOf(token);
            if (index > -1) {
                tracker[subscriptionType].splice(index, 1);
            }
        }
    }
    logger.debug(`Untracked subscription: ${subscriptionType} - ${tokens.join(', ')}`);
}
function _getTrackedSubscriptions(ws) {
    const wsId = _getWsId(ws);
    return subscriptionTracker.get(wsId) || { tokens: [], option_greeks_tokens: [] };
}
function _clearTrackedSubscriptions(ws) {
    const wsId = _getWsId(ws);
    if (subscriptionTracker.has(wsId)) {
        subscriptionTracker.delete(wsId);
        logger.debug(`Cleared subscription tracking for connection ${wsId}`);
    }
}
// Shutdown flags
const shutdownFlags = new Map();
function _setShutdownFlag(ws) {
    const wsId = _getWsId(ws);
    shutdownFlags.set(wsId, true);
    logger.debug(`Shutdown flag set for connection ${wsId}`);
}
function _isShutdownRequested(ws) {
    const wsId = _getWsId(ws);
    return shutdownFlags.get(wsId) || false;
}
function _clearShutdownFlag(ws) {
    const wsId = _getWsId(ws);
    if (shutdownFlags.has(wsId)) {
        shutdownFlags.delete(wsId);
        logger.debug(`Shutdown flag cleared for connection ${wsId}`);
    }
}
function getUrlAndHeaderData(userId, config) {
    const scheme = config.scheme || 'wss';
    const host = config.host || 'socket.firstock.in';
    const path = config.path || '/ws';
    const srcVal = config.source || 'API';
    const acceptEncoding = config.accept_encoding || 'gzip, deflate, br';
    const acceptLanguage = config.accept_language || 'en-US,en;q=0.9';
    const origin = config.origin || '';
    const baseUrl = `${scheme}://${host}${path}`;
    logger.info(`Connecting to ${baseUrl}`);
    let configJson;
    try {
        const configFile = (0, fs_1.readFileSync)('config.json', 'utf-8');
        configJson = JSON.parse(configFile);
    }
    catch (e) {
        return ['', null, new Error('Failed to read config.json')];
    }
    // Use the userId parameter to get the jKey
    if (!configJson[userId]) {
        return ['', null, new Error(`User ID '${userId}' not found in config.json`)];
    }
    const jkey = configJson[userId].jKey;
    if (!jkey) {
        return ['', null, new Error(`jKey not found for user '${userId}' in config.json`)];
    }
    const queryParams = new URLSearchParams({
        userId: userId,
        jKey: jkey,
        source: 'developer-api'
    });
    const urlWithParams = `${baseUrl}?${queryParams.toString()}`;
    const headers = {
        'accept-encoding': acceptEncoding,
        'accept-language': acceptLanguage,
        'cache-control': 'no-cache',
        'origin': origin,
        'pragma': 'no-cache'
    };
    return [urlWithParams, headers, null];
}
function _identifyUpdateType(data) {
    if (data.norenordno) {
        return UpdateType.ORDER;
    }
    else if (data.brkname) {
        return UpdateType.POSITION;
    }
    else if (data.gamma) {
        return UpdateType.OPTION_GREEKS;
    }
    else {
        return UpdateType.MARKET_FEED;
    }
}
function _handleAuthenticationResponse(message) {
    if (message.includes("Authentication successful")) {
        logger.info("Authentication successful");
        return true;
    }
    else if (message.includes('"status":"failed"')) {
        logger.warning(`Authentication failed: ${message}`);
        return false;
    }
    return true;
}
function readMessage(userId, ws, model, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const maxRetries = config.max_websocket_connection_retries || 3;
        const timeInterval = config.time_interval || 5;
        let messageCount = 0;
        let isAuthenticated = true;
        logger.info(`Starting message reader for user ${userId}`);
        logger.info(`Callbacks configured - Feed: ${model.subscribe_feed_data !== undefined}, ` +
            `Order: ${model.order_data !== undefined}, ` +
            `Position: ${model.position_data !== undefined}, ` +
            `Option Greeks: ${model.subscribe_option_greeks_data !== undefined}`);
        const messageHandler = (data) => __awaiter(this, void 0, void 0, function* () {
            if (!(yield exports.connections.checkIfConnectionExists(ws))) {
                logger.info("Connection no longer exists, stopping reader");
                _clearShutdownFlag(ws);
                return;
            }
            try {
                const message = data.toString();
                messageCount++;
                logger.debug(`Message #${messageCount}: ${message.substring(0, 200)}...`);
                if (!message) {
                    logger.debug("Empty message received, skipping");
                    return;
                }
                let parsedData;
                try {
                    parsedData = JSON.parse(message);
                }
                catch (e) {
                    logger.error(`JSON parse error: ${e.message}. Message: ${message.substring(0, 200)}`);
                    return;
                }
                // Handle authentication responses
                if (parsedData.status && parsedData.message) {
                    if (_handleAuthenticationResponse(message)) {
                        isAuthenticated = true;
                        logger.info("Re-authentication successful");
                    }
                    return;
                }
                // Route messages to appropriate callbacks
                const updateType = _identifyUpdateType(parsedData);
                if (updateType === UpdateType.ORDER) {
                    if (model.order_data) {
                        try {
                            model.order_data(parsedData);
                            logger.debug("Order callback invoked");
                        }
                        catch (e) {
                            logger.error(`Error in order callback: ${e.message}`, e);
                        }
                    }
                }
                else if (updateType === UpdateType.POSITION) {
                    if (model.position_data) {
                        try {
                            model.position_data(parsedData);
                            logger.debug("Position callback invoked");
                        }
                        catch (e) {
                            logger.error(`Error in position callback: ${e.message}`, e);
                        }
                    }
                }
                else if (updateType === UpdateType.OPTION_GREEKS) {
                    if (model.subscribe_option_greeks_data) {
                        try {
                            if (typeof parsedData === 'object') {
                                for (const [key, value] of Object.entries(parsedData)) {
                                    if (typeof value === 'object' && value.gamma) {
                                        model.subscribe_option_greeks_data(value);
                                    }
                                }
                            }
                            logger.debug("Option Greeks callback invoked");
                        }
                        catch (e) {
                            logger.error(`Error in option Greeks callback: ${e.message}`, e);
                        }
                    }
                }
                else {
                    if (model.subscribe_feed_data) {
                        try {
                            model.subscribe_feed_data(parsedData);
                            logger.debug("Feed callback invoked");
                        }
                        catch (e) {
                            logger.error(`Error in feed callback: ${e.message}`, e);
                        }
                    }
                }
            }
            catch (e) {
                logger.error(`Error processing message: ${e.message}`, e);
            }
        });
        const closeHandler = () => __awaiter(this, void 0, void 0, function* () {
            // Check if shutdown was requested
            if (_isShutdownRequested(ws)) {
                logger.info("Connection closed intentionally");
                _clearShutdownFlag(ws);
                return;
            }
            // Unexpected disconnection - attempt reconnection
            logger.warning("Unexpected disconnection");
            console.log("\n Connection lost");
            console.log("Attempting to reconnect...");
            if (!(yield exports.connections.checkIfConnectionExists(ws))) {
                logger.info("Connection no longer in manager, stopping reader");
                return;
            }
            // Attempt reconnection
            const newWs = yield _attemptReconnection(userId, ws, config, maxRetries, timeInterval, model);
            if (newWs === null) {
                logger.error("Failed to reconnect after all attempts");
                console.log("✗ Failed to reconnect. Please restart the application.");
                return;
            }
            logger.info("Reconnection successful, resuming message reading");
            // Call user's reconnection callback if provided
            if (model.on_reconnect) {
                try {
                    model.on_reconnect(newWs);
                    logger.info("User's on_reconnect callback executed");
                }
                catch (callbackError) {
                    logger.error(`Error in on_reconnect callback: ${callbackError.message}`, callbackError);
                }
            }
        });
        const errorHandler = (error) => __awaiter(this, void 0, void 0, function* () {
            logger.error(`WebSocket error: ${error.message}`, error);
            // Trigger close handler for reconnection logic
            yield closeHandler();
        });
        ws.on('message', messageHandler);
        ws.on('close', closeHandler);
        ws.on('error', errorHandler);
    });
}
function _attemptReconnection(userId, oldWs, config, maxRetries, timeInterval, model) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the actual tracked subscriptions
        const tracked = _getTrackedSubscriptions(oldWs);
        const allTokens = tracked.tokens;
        const allOptionGreeksTokens = tracked.option_greeks_tokens;
        logger.info(`Attempting reconnection. Will restore: ${allTokens.length} market tokens, ${allOptionGreeksTokens.length} option greeks tokens`);
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            if (!(yield exports.connections.checkIfConnectionExists(oldWs))) {
                logger.info("Connection no longer exists in manager, stopping reconnection");
                return null;
            }
            logger.info(`Reconnection attempt ${attempt}/${maxRetries}...`);
            console.log(`Reconnection attempt ${attempt}/${maxRetries}...`);
            yield new Promise(resolve => setTimeout(resolve, timeInterval * 1000));
            try {
                // Create new connection
                const [baseUrl, headers, err] = getUrlAndHeaderData(userId, config);
                if (err) {
                    logger.error(`Failed to get URL/headers: ${err.message}`);
                    continue;
                }
                const newWs = new ws_1.default(baseUrl, { headers });
                // Wait for connection to open
                yield new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Connection timeout'));
                    }, 10000);
                    newWs.once('open', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                    newWs.once('error', (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });
                logger.info(`New WebSocket connection created (attempt ${attempt})`);
                // Wait for authentication message
                const authMessage = yield new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Authentication timeout'));
                    }, 5000);
                    newWs.once('message', (data) => {
                        clearTimeout(timeout);
                        resolve(data.toString());
                    });
                    newWs.once('error', (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });
                logger.info(`Reconnection auth message: ${authMessage}`);
                if (!authMessage.includes("Authentication successful")) {
                    logger.warning(`Authentication failed on reconnect: ${authMessage}`);
                    newWs.close();
                    continue;
                }
                // Transfer subscription tracking from old connection to new connection
                const oldWsId = _getWsId(oldWs);
                const newWsId = _getWsId(newWs);
                if (subscriptionTracker.has(oldWsId)) {
                    const oldTracker = subscriptionTracker.get(oldWsId);
                    subscriptionTracker.set(newWsId, {
                        tokens: [...oldTracker.tokens],
                        option_greeks_tokens: [...oldTracker.option_greeks_tokens]
                    });
                    logger.debug(`Transferred subscription tracking from ${oldWsId} to ${newWsId}`);
                }
                // Update connection manager
                yield exports.connections.deleteConnection(oldWs);
                yield exports.connections.addConnection(newWs);
                logger.info("Connection manager updated with new connection");
                // Resubscribe to all tracked tokens
                logger.info("Resubscribing to previous subscriptions...");
                console.log("Resubscribing to previous feeds...");
                // Resubscribe to market feed tokens
                if (allTokens.length > 0) {
                    yield new Promise(resolve => setTimeout(resolve, 500));
                    const tokensStr = allTokens.join("|");
                    const msg = JSON.stringify({ action: "subscribe", tokens: tokensStr });
                    const error = yield exports.connections.writeMessage(newWs, msg);
                    if (error) {
                        logger.error(`Failed to resubscribe to market tokens: ${error}`);
                    }
                    else {
                        logger.info(`Resubscribed to ${allTokens.length} market feed token(s): ${allTokens.join(', ')}`);
                        console.log(`✓ Resubscribed to ${allTokens.length} market feed token(s)`);
                    }
                }
                if (allOptionGreeksTokens.length > 0) {
                    yield new Promise(resolve => setTimeout(resolve, 500));
                    const tokensStr = allOptionGreeksTokens.join("|");
                    const msg = JSON.stringify({ action: "subscribe-option-greeks", tokens: tokensStr });
                    const error = yield exports.connections.writeMessage(newWs, msg);
                    if (error) {
                        logger.error(`Failed to resubscribe to option Greeks: ${error}`);
                    }
                    else {
                        logger.info(`Resubscribed to ${allOptionGreeksTokens.length} option Greeks token(s): ${allOptionGreeksTokens.join(', ')}`);
                        console.log(`✓ Resubscribed to ${allOptionGreeksTokens.length} option Greeks token(s)`);
                    }
                }
                yield new Promise(resolve => setTimeout(resolve, 1000));
                logger.info("Reconnection and resubscription successful!");
                console.log("✓ Reconnection complete - all subscriptions restored");
                // IMPORTANT: Restart the message reader for the new WebSocket
                readMessage(userId, newWs, model, config);
                return newWs;
            }
            catch (e) {
                logger.error(`Reconnection attempt ${attempt} failed: ${e.message}`, e);
                console.log(`✗ Attempt ${attempt} failed: ${e.message.substring(0, 100)}...`);
                if (attempt === maxRetries) {
                    logger.error("Max reconnection attempts reached");
                    console.log(`✗ All ${maxRetries} reconnection attempts failed`);
                    return null;
                }
            }
        }
        return null;
    });
}
function subscribe(ws, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield exports.connections.checkIfConnectionExists(ws))) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }
        _trackSubscription(ws, tokens, 'tokens');
        let tokensStr;
        if (tokens.length === 1 && tokens[0].includes("|")) {
            tokensStr = tokens[0];
        }
        else {
            tokensStr = tokens.join("|");
        }
        const msg = JSON.stringify({
            action: "subscribe",
            tokens: tokensStr
        });
        logger.info(`Sending subscribe message: ${msg}`);
        const error = yield exports.connections.writeMessage(ws, msg);
        if (error) {
            return { error: { message: error } };
        }
        logger.info("Subscribe message sent successfully");
        return null;
    });
}
function unsubscribe(ws, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield exports.connections.checkIfConnectionExists(ws))) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }
        _untrackSubscription(ws, tokens, 'tokens');
        const tokensStr = tokens.join("|");
        const msg = JSON.stringify({
            action: "unsubscribe",
            tokens: tokensStr
        });
        logger.info(`Sending unsubscribe message: ${msg}`);
        const error = yield exports.connections.writeMessage(ws, msg);
        if (error) {
            return { error: { message: error } };
        }
        return null;
    });
}
function subscribeOptionGreeks(ws, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield exports.connections.checkIfConnectionExists(ws))) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }
        _trackSubscription(ws, tokens, 'option_greeks_tokens');
        let tokensStr;
        if (tokens.length === 1 && tokens[0].includes("|")) {
            tokensStr = tokens[0];
        }
        else {
            tokensStr = tokens.join("|");
        }
        const msg = JSON.stringify({
            action: "subscribe-option-greeks",
            tokens: tokensStr
        });
        logger.info(`Sending subscribe option greeks message: ${msg}`);
        const error = yield exports.connections.writeMessage(ws, msg);
        if (error) {
            return { error: { message: error } };
        }
        logger.info("Subscribe option greeks message sent successfully");
        return null;
    });
}
function unsubscribeOptionGreeks(ws, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield exports.connections.checkIfConnectionExists(ws))) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }
        _untrackSubscription(ws, tokens, 'option_greeks_tokens');
        let tokensStr;
        if (tokens.length === 1 && tokens[0].includes("|")) {
            tokensStr = tokens[0];
        }
        else {
            tokensStr = tokens.join("|");
        }
        const msg = JSON.stringify({
            action: "unsubscribe-option-greeks",
            tokens: tokensStr
        });
        logger.info(`Sending unsubscribe option greeks message: ${msg}`);
        const error = yield exports.connections.writeMessage(ws, msg);
        if (error) {
            return { error: { message: error } };
        }
        logger.info("Unsubscribe option greeks message sent successfully");
        return null;
    });
}
