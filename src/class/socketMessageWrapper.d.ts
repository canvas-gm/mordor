/// <reference path="remoteServer.d.ts" />
/// <reference path="remoteClient.d.ts" />
import * as net from "net";
import * as events from "events";

/**
 * socketMessageWrapper
 */
declare class SocketMessageWrapper extends events {
    constructor();

    // Properties
    public currConnectedSockets: Set<Mordor.Socket>;
    public servers: Map<string, RemoteServer>;
    public clients: Map<string, RemoteClient>;

    // Methods
    public broadcastAll(title: string, body?: Mordor.SocketMessage): void;
    public removeSocket(socket: net.Socket): boolean;
    public send(socket: net.Socket, title: string, body: Mordor.SocketMessage): void;
    public disconnectAllSockets(): void;
}

export as namespace SocketMessageWrapper;
export = SocketMessageWrapper;
