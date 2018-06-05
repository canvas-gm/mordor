import * as net from "net";
import * as events from "events";

declare namespace SocketHandler {

    export interface SocketMessage {
        title: string;
        body?: any
    }

}

declare class SocketHandler extends events {
    constructor();

    public currConnectedSockets: Set<Mordor.Socket>;

    static pingRemoteSocket(): void;
    static resetRequestCount(): void;
    static socketDataHandler(socket: net.Socket, msg: string): SocketHandler.SocketMessage[];
    static verifySocketRequestCount(socket: net.Socket): boolean;
    public connectSocket(socket: net.Socket): void;
    public broadcast(title: string, body?: server.SocketMessage): void;
    public removeSocket(socket: net.Socket): boolean;
    public send(socket: net.Socket, title: string, body: server.SocketMessage): void;
    public disconnectAllSockets(): void;
}

export as namespace SocketHandler;
export = SocketHandler;
