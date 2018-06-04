/// <reference path="remoteProject.d.ts" />
import * as net from "net";

declare namespace RemoteServer {
    /**
     * Server constructor options
     */
    export interface ServerOptions {
        uid: string;
        name: string;
    }
}

/**
 * RemoteServer
 */
declare class RemoteServer {
    constructor(socket: Mordor.Socket, options: RemoteServer.ServerOptions);

    // Properties
    public socket: Mordor.Socket;
    public uid: string;
    public name: string;
    public projects: Map<string, RemoteProject>;
    public registeredNumbers: number;
}

export as namespace RemoteServer;
export = RemoteServer;
