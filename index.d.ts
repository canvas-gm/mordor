/// <reference types="node" />
/// <reference types="@types/node" />
/// <reference types="@types/es6-shim" />
import * as net from "net";

declare namespace Mordor {

    /**
     * Socket Message interface
     */
    export interface SocketMessage {
        title: string;
        body: any;
    }

    /**
     * Project configuration
     */
    export interface Configuration {
        port: number;
        httpPort: number;
    }

    // Mordor socket!
    export interface Socket extends net.Socket {
        session?: RemoteClient;
        id: string;
        requestCount: number;
        isAuthenticated: () => boolean;
        pongDt: number;
    }

}

export as namespace Mordor;
export = Mordor;
