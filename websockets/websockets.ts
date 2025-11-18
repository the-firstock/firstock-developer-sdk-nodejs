import WebSocket from 'ws';
import {
    connections,
    getUrlAndHeaderData,
    readMessage,
    subscribe as subscribeHelper,
    unsubscribe as unsubscribeHelper,
    subscribeOptionGreeks as subscribeOptionGreeksHelper,
    unsubscribeOptionGreeks as unsubscribeOptionGreeksHelper,
    Config,
    WebSocketModel
} from './websocket_functions';

const logger = {
    info: (msg: string) => console.info(`[INFO] ${new Date().toISOString()} - ${msg}`),
    error: (msg: string, err?: Error) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
        if (err) console.error(err);
    }
};

export class FirstockWebSocket {
    tokens?: string[];
    option_greeks_tokens?: string[];
    order_data?: (data: any) => void;
    position_data?: (data: any) => void;
    subscribe_feed_data?: (data: any) => void;
    subscribe_option_greeks_data?: (data: any) => void;
    on_reconnect?: (ws: WebSocket) => void;

    constructor(options: {
        tokens?: string[];
        option_greeks_tokens?: string[];
        order_data?: (data: any) => void;
        position_data?: (data: any) => void;
        subscribe_feed_data?: (data: any) => void;
        subscribe_option_greeks_data?: (data: any) => void;
        on_reconnect?: (ws: WebSocket) => void;
    } = {}) {
        this.tokens = options.tokens || [];
        this.option_greeks_tokens = options.option_greeks_tokens || [];
        this.order_data = options.order_data;
        this.position_data = options.position_data;
        this.subscribe_feed_data = options.subscribe_feed_data;
        this.subscribe_option_greeks_data = options.subscribe_option_greeks_data;
        this.on_reconnect = options.on_reconnect;
    }

    toDict(): WebSocketModel {
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

export class Firstock {

    static async initializeWebsockets(
        userId: string,
        model: FirstockWebSocket,
        config?: Config
    ): Promise<[WebSocket | null, { error: { message: string } } | null]> {
        const finalConfig: Config = {
            scheme: 'wss',
            host: 'socket.firstock.in',
            path: '/ws',
            source: 'developer-api',
            accept_encoding: 'gzip, deflate, br',
            accept_language: 'en-US,en;q=0.9',
            origin: 'https://firstock.in',
            max_websocket_connection_retries: 3,
            time_interval: 5,
            ...config
        };

        const [baseUrl, headers, err] = getUrlAndHeaderData(userId, finalConfig);
        if (err) {
            return [null, { error: { message: err.message } }];
        }

        try {
            const ws = new WebSocket(baseUrl, { headers });

            await new Promise<void>((resolve, reject) => {
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
            await connections.addConnection(ws);

            const msg = await new Promise<string>((resolve, reject) => {
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

                await new Promise(resolve => setTimeout(resolve, 500));

                const modelDict = model.toDict();
                
                readMessage(userId, ws, modelDict, finalConfig);

                await new Promise(resolve => setTimeout(resolve, 500));

                if (model.tokens && model.tokens.length > 0) {
                    logger.info(`Subscribing to initial tokens: ${model.tokens.join(', ')}`);
                    const subscribeErr = await subscribeHelper(ws, model.tokens);
                    if (subscribeErr) {
                        logger.error(`Initial subscription error: ${JSON.stringify(subscribeErr)}`);
                    }
                }

                if (model.option_greeks_tokens && model.option_greeks_tokens.length > 0) {
                    logger.info(`Subscribing to option Greeks tokens: ${model.option_greeks_tokens.join(', ')}`);
                    const subscribeErr = await subscribeOptionGreeksHelper(ws, model.option_greeks_tokens);
                    if (subscribeErr) {
                        logger.error(`Initial option Greeks subscription error: ${JSON.stringify(subscribeErr)}`);
                    }
                }

                return [ws, null];

            } else if (msg.includes("Maximum sessions limit")) {
                await connections.deleteConnection(ws);
                return [null, { error: { message: msg } }];

            } else {
                await connections.deleteConnection(ws);
                return [null, { error: { message: `Unexpected authentication response: ${msg}` } }];
            }

        } catch (e) {
            logger.error(`WebSocket initialization error: ${(e as Error).message}`, e as Error);
            return [null, { error: { message: (e as Error).message } }];
        }
    }

    static async closeWebsocket(ws: WebSocket | null): Promise<{ error: { message: string } } | null> {
        if (ws === null) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }

        if (await connections.checkIfConnectionExists(ws)) {
            try {
                ws.close();
                await connections.deleteConnection(ws);
                return null;
            } catch (e) {
                const errorMsg = (e as Error).message.toLowerCase();
                if (!errorMsg.includes("closed")) {
                    return {
                        error: {
                            message: (e as Error).message
                        }
                    };
                } else {
                    await connections.deleteConnection(ws);
                    return null;
                }
            }
        } else {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }
    }

    static async subscribe(
        ws: WebSocket | null,
        tokens: string[]
    ): Promise<{ error: { message: string } } | null> {
        if (ws === null) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }

        return subscribeHelper(ws, tokens);
    }


    static async unsubscribe(
        ws: WebSocket | null,
        tokens: string[]
    ): Promise<{ error: { message: string } } | null> {
        if (ws === null) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }

        return unsubscribeHelper(ws, tokens);
    }


    static async subscribeOptionGreeks(
        ws: WebSocket | null,
        tokens: string[]
    ): Promise<{ error: { message: string } } | null> {
        if (ws === null) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }

        return subscribeOptionGreeksHelper(ws, tokens);
    }


    static async unsubscribeOptionGreeks(
        ws: WebSocket | null,
        tokens: string[]
    ): Promise<{ error: { message: string } } | null> {
        if (ws === null) {
            return {
                error: {
                    message: "Connection does not exist"
                }
            };
        }

        return unsubscribeOptionGreeksHelper(ws, tokens);
    }
}
