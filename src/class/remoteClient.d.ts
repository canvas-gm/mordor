import * as net from "net";

/**
 * RemoteClient
 */
declare class RemoteClient {
    constructor(socket: Mordor.Socket, user: object);

    // Properties
    public socket: Mordor.Socket;
    public email: string;
    public login: string;

    // Methods
    isUpToDate(): boolean;
    valueOf(): object;
}

export as namespace RemoteClient;
export = RemoteClient;
