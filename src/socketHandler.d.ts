/// <reference path="class/socketMessageWrapper.d.ts" />
/// <reference path="../index.d.ts" />
import net as net from "net";

declare function socketHandler(socket: Mordor.Socket): void;
export = socketHandler;
