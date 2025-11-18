import WebSocket from 'ws';
import { readFileSync } from 'fs';

// Configure logging
const logger = {
    debug: (msg: string) => console.debug(`${new Date().toISOString()} - ${msg}`),
    info: (msg: string) => console.info(`${new Date().toISOString()} - ${msg}`),
    warning: (msg: string) => console.warn(`${new Date().toISOString()} - ${msg}`),
    error: (msg: string, err?: Error) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
        if (err) console.error(err);
    }
};

export enum UpdateType {
    ORDER = "order",
    POSITION = "position",
    MARKET_FEED = "market_feed",
    OPTION_GREEKS = "option_greeks"
}

export interface Config {
    scheme?: string;
    host?: string;
    path?: string;
    source?: string;
    accept_encoding?: string;
    accept_language?: string;
    origin?: string;
    max_websocket_connection_retries?: number;
    time_interval?: number;
}

export interface WebSocketModel {
    tokens?: string[];
    option_greeks_tokens?: string[];
    order_data?: (data: any) => void;
    position_data?: (data: any) => void;
    subscribe_feed_data?: (data: any) => void;
    subscribe_option_greeks_data?: (data: any) => void;
    on_reconnect?: (ws: WebSocket) => void;
}

class SafeConn {
    ws: WebSocket;
    lock: boolean = false;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    async acquireLock(): Promise<void> {
        while (this.lock) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.lock = true;
    }

    releaseLock(): void {
        this.lock = false;
    }
}

class ConnectionManager {
    private connMap: Map<SafeConn, boolean> = new Map();
    private indexMap: Map<WebSocket, SafeConn> = new Map();
    private lock: boolean = false;

    private async acquireLock(): Promise<void> {
        while (this.lock) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.lock = true;
    }

    private releaseLock(): void {
        this.lock = false;
    }

    async countConnections(): Promise<number> {
        await this.acquireLock();
        const count = this.connMap.size;
        this.releaseLock();
        return count;
    }

    async addConnection(ws: WebSocket): Promise<SafeConn> {
        await this.acquireLock();
        
        if (this.indexMap.has(ws)) {
            logger.info("Connection already exists");
            this.releaseLock();
            return this.indexMap.get(ws)!;
        }

        const safe = new SafeConn(ws);
        this.connMap.set(safe, true);
        this.indexMap.set(ws, safe);
        logger.info("Connection added");
        
        this.releaseLock();
        return safe;
    }

    async checkIfConnectionExists(ws: WebSocket): Promise<boolean> {
        await this.acquireLock();
        const exists = this.indexMap.has(ws);
        this.releaseLock();
        return exists;
    }

    async writeMessage(ws: WebSocket, data: string): Promise<string | null> {
        await this.acquireLock();
        const safe = this.indexMap.get(ws);
        this.releaseLock();

        if (!safe) {
            return "connection not found";
        }

        await safe.acquireLock();
        try {
            if (safe.ws.readyState === WebSocket.OPEN) {
                safe.ws.send(data);
                safe.releaseLock();
                return null;
            } else {
                safe.releaseLock();
                return "WebSocket is not open";
            }
        } catch (e) {
            safe.releaseLock();
            return (e as Error).message;
        }
    }

    async deleteConnection(ws: WebSocket): Promise<void> {
        await this.acquireLock();
        
        if (this.indexMap.has(ws)) {
            // Set shutdown flag BEFORE closing
            _setShutdownFlag(ws);
            
            const safe = this.indexMap.get(ws)!;
            this.connMap.delete(safe);
            this.indexMap.delete(ws);
            
            try {
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                    ws.close();
                }
            } catch (e) {
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
    }
}

export const connections = new ConnectionManager();

// Subscription tracking
interface SubscriptionTracker {
    tokens: string[];
    option_greeks_tokens: string[];
}

const subscriptionTracker: Map<number, SubscriptionTracker> = new Map();

function _getWsId(ws: WebSocket): number {
    return (ws as any).__wsId || ((ws as any).__wsId = Math.random());
}

function _trackSubscription(ws: WebSocket, tokens: string[], subscriptionType: 'tokens' | 'option_greeks_tokens'): void {
    const wsId = _getWsId(ws);
    
    if (!subscriptionTracker.has(wsId)) {
        subscriptionTracker.set(wsId, {
            tokens: [],
            option_greeks_tokens: []
        });
    }

    const tracker = subscriptionTracker.get(wsId)!;
    
    for (const token of tokens) {
        if (!tracker[subscriptionType].includes(token)) {
            tracker[subscriptionType].push(token);
        }
    }

    logger.debug(`Tracked subscription: ${subscriptionType} - ${tokens.join(', ')}`);
}

function _untrackSubscription(ws: WebSocket, tokens: string[], subscriptionType: 'tokens' | 'option_greeks_tokens'): void {
    const wsId = _getWsId(ws);
    
    if (subscriptionTracker.has(wsId)) {
        const tracker = subscriptionTracker.get(wsId)!;
        
        for (const token of tokens) {
            const index = tracker[subscriptionType].indexOf(token);
            if (index > -1) {
                tracker[subscriptionType].splice(index, 1);
            }
        }
    }

    logger.debug(`Untracked subscription: ${subscriptionType} - ${tokens.join(', ')}`);
}

function _getTrackedSubscriptions(ws: WebSocket): SubscriptionTracker {
    const wsId = _getWsId(ws);
    return subscriptionTracker.get(wsId) || { tokens: [], option_greeks_tokens: [] };
}

function _clearTrackedSubscriptions(ws: WebSocket): void {
    const wsId = _getWsId(ws);
    if (subscriptionTracker.has(wsId)) {
        subscriptionTracker.delete(wsId);
        logger.debug(`Cleared subscription tracking for connection ${wsId}`);
    }
}

// Shutdown flags
const shutdownFlags: Map<number, boolean> = new Map();

function _setShutdownFlag(ws: WebSocket): void {
    const wsId = _getWsId(ws);
    shutdownFlags.set(wsId, true);
    logger.debug(`Shutdown flag set for connection ${wsId}`);
}

function _isShutdownRequested(ws: WebSocket): boolean {
    const wsId = _getWsId(ws);
    return shutdownFlags.get(wsId) || false;
}

function _clearShutdownFlag(ws: WebSocket): void {
    const wsId = _getWsId(ws);
    if (shutdownFlags.has(wsId)) {
        shutdownFlags.delete(wsId);
        logger.debug(`Shutdown flag cleared for connection ${wsId}`);
    }
}

export function getUrlAndHeaderData(userId: string, config: Config): [string, any, Error | null] {
    const scheme = config.scheme || 'wss';
    const host = config.host || 'socket.firstock.in';
    const path = config.path || '/ws';
    const srcVal = config.source || 'API';
    const acceptEncoding = config.accept_encoding || 'gzip, deflate, br';
    const acceptLanguage = config.accept_language || 'en-US,en;q=0.9';
    const origin = config.origin || '';

    const baseUrl = `${scheme}://${host}${path}`;
    logger.info(`Connecting to ${baseUrl}`);

    let configJson: any;
    try {
        const configFile = readFileSync('config.json', 'utf-8');
        configJson = JSON.parse(configFile);
    } catch (e) {
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

function _identifyUpdateType(data: any): UpdateType {
    if (data.norenordno) {
        return UpdateType.ORDER;
    } else if (data.brkname) {
        return UpdateType.POSITION;
    } else if (data.gamma) {
        return UpdateType.OPTION_GREEKS;
    } else {
        return UpdateType.MARKET_FEED;
    }
}

function _handleAuthenticationResponse(message: string): boolean {
    if (message.includes("Authentication successful")) {
        logger.info("Authentication successful");
        return true;
    } else if (message.includes('"status":"failed"')) {
        logger.warning(`Authentication failed: ${message}`);
        return false;
    }
    return true;
}

export async function readMessage(
    userId: string,
    ws: WebSocket,
    model: WebSocketModel,
    config: Config
): Promise<void> {
    const maxRetries = config.max_websocket_connection_retries || 3;
    const timeInterval = config.time_interval || 5;

    let messageCount = 0;
    let isAuthenticated = true;

    logger.info(`Starting message reader for user ${userId}`);
    logger.info(`Callbacks configured - Feed: ${model.subscribe_feed_data !== undefined}, ` +
                `Order: ${model.order_data !== undefined}, ` +
                `Position: ${model.position_data !== undefined}, ` +
                `Option Greeks: ${model.subscribe_option_greeks_data !== undefined}`);

    const messageHandler = async (data: WebSocket.Data) => {
        if (!(await connections.checkIfConnectionExists(ws))) {
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

            let parsedData: any;
            try {
                parsedData = JSON.parse(message);
            } catch (e) {
                logger.error(`JSON parse error: ${(e as Error).message}. Message: ${message.substring(0, 200)}`);
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
                    } catch (e) {
                        logger.error(`Error in order callback: ${(e as Error).message}`, e as Error);
                    }
                }
            } else if (updateType === UpdateType.POSITION) {
                if (model.position_data) {
                    try {
                        model.position_data(parsedData);
                        logger.debug("Position callback invoked");
                    } catch (e) {
                        logger.error(`Error in position callback: ${(e as Error).message}`, e as Error);
                    }
                }
            } else if (updateType === UpdateType.OPTION_GREEKS) {
                if (model.subscribe_option_greeks_data) {
                    try {
                        if (typeof parsedData === 'object') {
                            for (const [key, value] of Object.entries(parsedData)) {
                                if (typeof value === 'object' && (value as any).gamma) {
                                    model.subscribe_option_greeks_data(value);
                                }
                            }
                        }
                        logger.debug("Option Greeks callback invoked");
                    } catch (e) {
                        logger.error(`Error in option Greeks callback: ${(e as Error).message}`, e as Error);
                    }
                }
            } else {
                if (model.subscribe_feed_data) {
                    try {
                        model.subscribe_feed_data(parsedData);
                        logger.debug("Feed callback invoked");
                    } catch (e) {
                        logger.error(`Error in feed callback: ${(e as Error).message}`, e as Error);
                    }
                }
            }
        } catch (e) {
            logger.error(`Error processing message: ${(e as Error).message}`, e as Error);
        }
    };

    const closeHandler = async () => {
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

        if (!(await connections.checkIfConnectionExists(ws))) {
            logger.info("Connection no longer in manager, stopping reader");
            return;
        }

        // Attempt reconnection
        const newWs = await _attemptReconnection(
            userId, ws, config, maxRetries, timeInterval, model
        );

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
            } catch (callbackError) {
                logger.error(`Error in on_reconnect callback: ${(callbackError as Error).message}`, callbackError as Error);
            }
        }
    };

    const errorHandler = async (error: Error) => {
        logger.error(`WebSocket error: ${error.message}`, error);
        // Trigger close handler for reconnection logic
        await closeHandler();
    };

    ws.on('message', messageHandler);
    ws.on('close', closeHandler);
    ws.on('error', errorHandler);
}

async function _attemptReconnection(
    userId: string,
    oldWs: WebSocket,
    config: Config,
    maxRetries: number,
    timeInterval: number,
    model: WebSocketModel
): Promise<WebSocket | null> {
    // Get the actual tracked subscriptions
    const tracked = _getTrackedSubscriptions(oldWs);
    const allTokens = tracked.tokens;
    const allOptionGreeksTokens = tracked.option_greeks_tokens;

    logger.info(`Attempting reconnection. Will restore: ${allTokens.length} market tokens, ${allOptionGreeksTokens.length} option greeks tokens`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        if (!(await connections.checkIfConnectionExists(oldWs))) {
            logger.info("Connection no longer exists in manager, stopping reconnection");
            return null;
        }

        logger.info(`Reconnection attempt ${attempt}/${maxRetries}...`);
        console.log(`Reconnection attempt ${attempt}/${maxRetries}...`);

        await new Promise(resolve => setTimeout(resolve, timeInterval * 1000));

        try {
            // Create new connection
            const [baseUrl, headers, err] = getUrlAndHeaderData(userId, config);
            if (err) {
                logger.error(`Failed to get URL/headers: ${err.message}`);
                continue;
            }

            const newWs = new WebSocket(baseUrl, { headers });

            // Wait for connection to open
            await new Promise<void>((resolve, reject) => {
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
            const authMessage = await new Promise<string>((resolve, reject) => {
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
                const oldTracker = subscriptionTracker.get(oldWsId)!;
                subscriptionTracker.set(newWsId, {
                    tokens: [...oldTracker.tokens],
                    option_greeks_tokens: [...oldTracker.option_greeks_tokens]
                });
                logger.debug(`Transferred subscription tracking from ${oldWsId} to ${newWsId}`);
            }

            // Update connection manager
            await connections.deleteConnection(oldWs);
            await connections.addConnection(newWs);

            logger.info("Connection manager updated with new connection");

            // Resubscribe to all tracked tokens
            logger.info("Resubscribing to previous subscriptions...");
            console.log("Resubscribing to previous feeds...");

            // Resubscribe to market feed tokens
            if (allTokens.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const tokensStr = allTokens.join("|");
                const msg = JSON.stringify({ action: "subscribe", tokens: tokensStr });

                const error = await connections.writeMessage(newWs, msg);
                if (error) {
                    logger.error(`Failed to resubscribe to market tokens: ${error}`);
                } else {
                    logger.info(`Resubscribed to ${allTokens.length} market feed token(s): ${allTokens.join(', ')}`);
                    console.log(`✓ Resubscribed to ${allTokens.length} market feed token(s)`);
                }
            }

            if (allOptionGreeksTokens.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const tokensStr = allOptionGreeksTokens.join("|");
                const msg = JSON.stringify({ action: "subscribe-option-greeks", tokens: tokensStr });

                const error = await connections.writeMessage(newWs, msg);
                if (error) {
                    logger.error(`Failed to resubscribe to option Greeks: ${error}`);
                } else {
                    logger.info(`Resubscribed to ${allOptionGreeksTokens.length} option Greeks token(s): ${allOptionGreeksTokens.join(', ')}`);
                    console.log(`✓ Resubscribed to ${allOptionGreeksTokens.length} option Greeks token(s)`);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            logger.info("Reconnection and resubscription successful!");
            console.log("✓ Reconnection complete - all subscriptions restored");

            // IMPORTANT: Restart the message reader for the new WebSocket
            readMessage(userId, newWs, model, config);

            return newWs;

        } catch (e) {
            logger.error(`Reconnection attempt ${attempt} failed: ${(e as Error).message}`, e as Error);
            console.log(`✗ Attempt ${attempt} failed: ${(e as Error).message.substring(0, 100)}...`);

            if (attempt === maxRetries) {
                logger.error("Max reconnection attempts reached");
                console.log(`✗ All ${maxRetries} reconnection attempts failed`);
                return null;
            }
        }
    }

    return null;
}

export async function subscribe(ws: WebSocket, tokens: string[]): Promise<{ error: { message: string } } | null> {
    if (!(await connections.checkIfConnectionExists(ws))) {
        return {
            error: {
                message: "Connection does not exist"
            }
        };
    }

    _trackSubscription(ws, tokens, 'tokens');

    let tokensStr: string;
    if (tokens.length === 1 && tokens[0].includes("|")) {
        tokensStr = tokens[0];
    } else {
        tokensStr = tokens.join("|");
    }

    const msg = JSON.stringify({
        action: "subscribe",
        tokens: tokensStr
    });

    logger.info(`Sending subscribe message: ${msg}`);
    const error = await connections.writeMessage(ws, msg);

    if (error) {
        return { error: { message: error } };
    }

    logger.info("Subscribe message sent successfully");
    return null;
}

export async function unsubscribe(ws: WebSocket, tokens: string[]): Promise<{ error: { message: string } } | null> {
    if (!(await connections.checkIfConnectionExists(ws))) {
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
    const error = await connections.writeMessage(ws, msg);

    if (error) {
        return { error: { message: error } };
    }

    return null;
}

export async function subscribeOptionGreeks(ws: WebSocket, tokens: string[]): Promise<{ error: { message: string } } | null> {
    if (!(await connections.checkIfConnectionExists(ws))) {
        return {
            error: {
                message: "Connection does not exist"
            }
        };
    }

    _trackSubscription(ws, tokens, 'option_greeks_tokens');

    let tokensStr: string;
    if (tokens.length === 1 && tokens[0].includes("|")) {
        tokensStr = tokens[0];
    } else {
        tokensStr = tokens.join("|");
    }

    const msg = JSON.stringify({
        action: "subscribe-option-greeks",
        tokens: tokensStr
    });

    logger.info(`Sending subscribe option greeks message: ${msg}`);
    const error = await connections.writeMessage(ws, msg);

    if (error) {
        return { error: { message: error } };
    }

    logger.info("Subscribe option greeks message sent successfully");
    return null;
}

export async function unsubscribeOptionGreeks(ws: WebSocket, tokens: string[]): Promise<{ error: { message: string } } | null> {
    if (!(await connections.checkIfConnectionExists(ws))) {
        return {
            error: {
                message: "Connection does not exist"
            }
        };
    }

    _untrackSubscription(ws, tokens, 'option_greeks_tokens');

    let tokensStr: string;
    if (tokens.length === 1 && tokens[0].includes("|")) {
        tokensStr = tokens[0];
    } else {
        tokensStr = tokens.join("|");
    }

    const msg = JSON.stringify({
        action: "unsubscribe-option-greeks",
        tokens: tokensStr
    });

    logger.info(`Sending unsubscribe option greeks message: ${msg}`);
    const error = await connections.writeMessage(ws, msg);

    if (error) {
        return { error: { message: error } };
    }

    logger.info("Unsubscribe option greeks message sent successfully");
    return null;
}