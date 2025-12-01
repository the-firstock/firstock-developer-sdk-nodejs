import WebSocket from 'ws';
export declare enum UpdateType {
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
declare class SafeConn {
    ws: WebSocket;
    lock: boolean;
    constructor(ws: WebSocket);
    acquireLock(): Promise<void>;
    releaseLock(): void;
}
declare class ConnectionManager {
    private connMap;
    private indexMap;
    private lock;
    private acquireLock;
    private releaseLock;
    countConnections(): Promise<number>;
    addConnection(ws: WebSocket): Promise<SafeConn>;
    checkIfConnectionExists(ws: WebSocket): Promise<boolean>;
    writeMessage(ws: WebSocket, data: string): Promise<string | null>;
    deleteConnection(ws: WebSocket): Promise<void>;
}
export declare const connections: ConnectionManager;
export declare function getUrlAndHeaderData(userId: string, config: Config): [string, any, Error | null];
export declare function readMessage(userId: string, ws: WebSocket, model: WebSocketModel, config: Config): Promise<void>;
export declare function subscribe(ws: WebSocket, tokens: string[]): Promise<{
    error: {
        message: string;
    };
} | null>;
export declare function unsubscribe(ws: WebSocket, tokens: string[]): Promise<{
    error: {
        message: string;
    };
} | null>;
export declare function subscribeOptionGreeks(ws: WebSocket, tokens: string[]): Promise<{
    error: {
        message: string;
    };
} | null>;
export declare function unsubscribeOptionGreeks(ws: WebSocket, tokens: string[]): Promise<{
    error: {
        message: string;
    };
} | null>;
export {};
