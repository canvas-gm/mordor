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

    export interface ProjectConstructor {
        uid: string;
        name: string;
        description: string;
    }

    export interface ServerOptions {
        uid: string;
        name: string;
    }

    export interface NativeProjectValue {
        name: string;
        description: string;
    }

    /**
     * RemoteClient
     */
    export class RemoteClient {
        constructor(socket: net.Socket);

        // Properties
        public socket: net.Socket;
    }

    /**
     * RemoteProject
     */
    export class RemoteProject {
        constructor(options: ProjectConstructor);

        // Properties
        public uid: string;
        public name: string;
        public description: string;

        // Methods
        public valueOf(): NativeProjectValue;
    }

    /**
     * RemoteServer
     */
    export class RemoteServer {
        constructor(socket: net.Socket, options: ServerOptions);

        // Properties
        public socket: net.Socket;
        public uid: string;
        public name: string;
        public projects: Map<string, RemoteProject>;
        public registeredNumbers: number;
    }

    /**
     * socketMessageWrapper
     */
    export class socketMessageWrapper {
        constructor();

        // Properties
        public currConnectedSockets: Set<net.Socket>;
        public servers: Map<string, RemoteServer>;
        public clients: Map<string, RemoteClient>;

        // Methods
        public broadcastAll(title: string, body?: SocketMessage): void;
        public removeSocket(socket: net.Socket): boolean;
        public send(socket: net.Socket, title: string, body: SocketMessage): void;
        public disconnectAllSockets(): void;
    }

    /**
     * Project configuration
     */
    export interface Configuration {
        port: number;
        httpPort: number;
    }

}

export as namespace Mordor;
export = Mordor;
