import * as net from "net";

/**
 * RemoteClient
 */
declare class RemoteClient {
    constructor(socket: Mordor.Socket, email: string);

    // Properties
    public socket: Mordor.Socket;
    public email: string;

    // Methods
    isUpToDate(): boolean;
}

export as namespace RemoteClient;
export = RemoteClient;
