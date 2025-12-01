import WebSocket from 'ws';
import { Config, WebSocketModel } from './websocket_functions';
export declare class FirstockWebSocket {
    tokens?: string[];
    option_greeks_tokens?: string[];
    order_data?: (data: any) => void;
    position_data?: (data: any) => void;
    subscribe_feed_data?: (data: any) => void;
    subscribe_option_greeks_data?: (data: any) => void;
    on_reconnect?: (ws: WebSocket) => void;
    constructor(options?: {
        tokens?: string[];
        option_greeks_tokens?: string[];
        order_data?: (data: any) => void;
        position_data?: (data: any) => void;
        subscribe_feed_data?: (data: any) => void;
        subscribe_option_greeks_data?: (data: any) => void;
        on_reconnect?: (ws: WebSocket) => void;
    });
    toDict(): WebSocketModel;
}
export declare class Firstock {
    static initializeWebsockets(userId: string, model: FirstockWebSocket, config?: Config): Promise<[WebSocket | null, {
        error: {
            message: string;
        };
    } | null]>;
    static closeWebsocket(ws: WebSocket | null): Promise<{
        error: {
            message: string;
        };
    } | null>;
    static subscribe(ws: WebSocket | null, tokens: string[]): Promise<{
        error: {
            message: string;
        };
    } | null>;
    static unsubscribe(ws: WebSocket | null, tokens: string[]): Promise<{
        error: {
            message: string;
        };
    } | null>;
    static subscribeOptionGreeks(ws: WebSocket | null, tokens: string[]): Promise<{
        error: {
            message: string;
        };
    } | null>;
    static unsubscribeOptionGreeks(ws: WebSocket | null, tokens: string[]): Promise<{
        error: {
            message: string;
        };
    } | null>;
}
