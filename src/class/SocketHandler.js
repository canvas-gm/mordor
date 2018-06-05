// Require Node.JS dependencies
const events = require("events");

// Require Third-party Dependencies
const is = require("@sindresorhus/is");
const { red, yellow, green } = require("chalk");
const uuid = require("uuid/v4");

// Require Internal Dependencies
const { parseSocketMessages } = require("../utils");

/**
 * @const PONG_TIMEOUT
 * @desc Ping/Pong TIMEOUT
 * @type {Number}
 */
const PONG_TIMEOUT = 5000;

/**
 * @const MAX_REQUESTS_PER_SECOND
 * @desc Maximum number of requests per second that a remote socket can burst
 * @type {Number}
 */
const MAX_REQUESTS_PER_SECOND = 30;

/**
 * @class SocketHandler
 * @extends events
 *
 * @property {Set} currConnectedSockets
 */
class SocketHandler extends events {

    /**
     * @static
     * @method resetRequestCount
     * @desc Reset the request count of all sockets
     * @returns {void}
     * @this SocketHandler
     */
    static resetRequestCount() {
        for (const socket of this.currConnectedSockets) {
            Reflect.set(socket, "requestCount", 0);
        }
    }

    /**
     * @static
     * @method pingRemoteSocket
     * @desc Ping all remote sockets to be sure they are alive.
     * @returns {void}
     * @this SocketHandler
     */
    static pingRemoteSocket() {
        const dt = new Date().getTime();
        for (const socket of this.currConnectedSockets) {
            this.send(socket, "ping", { dt });
        }

        setTimeout(() => {
            for (const socket of this.currConnectedSockets) {
                if (socket.pongDt === dt) {
                    continue;
                }
                console.log(red(`Ping/pong timeout for socket with id => ${yellow(socket.id)}`));
                socket.destroy();
                break;
            }
        }, PONG_TIMEOUT);
    }

    /**
     * @static
     * @method socketDataHandler
     * @desc Socket message handler!
     * @param {!net.Socket} socket Node socket
     * @param {!Buffer} buf buffer!
     * @returns {SocketMessage[]}
     * @this net.Socket
     */
    static socketDataHandler(socket, buf) {
        const messages = parseSocketMessages(buf.toString());
        if (!SocketHandler.verifySocketRequestCount(socket, messages.length)) {
            return [];
        }

        return messages;
    }

    /**
     * @static
     * @method verifySocketRequestCount
     * @desc Disconnect remote socket if max requests (messages) has been reach!
     * @param {!net.Socket} socket Node socket
     * @param {!Number} length length to add to requests count!
     * @returns {void}
     * @this net.Socket
     */
    static verifySocketRequestCount(socket, length) {
        socket.requestCount += length;
        if (socket.requestCount < MAX_REQUESTS_PER_SECOND) {
            return true;
        }
        const reason = `Threshold of the maximum allowed requests has been hit by socket id: ${socket.id}`;
        console.error(red(reason));
        socket.destroy(reason);

        return false;
    }

    /**
     * @constructor
     */
    constructor() {
        super();
        this.on("error", console.error);
        this.currConnectedSockets = new Set();
        this.events = new class EHandler extends events {}();

        // Setup wrapper interval !
        setInterval(SocketHandler.resetRequestCount.bind(this), 1000);
        setInterval(SocketHandler.pingRemoteSocket.bind(this), 60000);

        // Close everything property if Node exit!
        process.once("SIGINT", this.disconnectAllSockets.bind(this));
        process.once("exit", this.disconnectAllSockets.bind(this));
    }

    /**
     * @public
     * @method connectSocket
     * @desc Connect a new socket
     * @param {net.Socket} socket Node.JS Socket
     * @returns {void}
     */
    connectSocket(socket) {
        if (this.currConnectedSockets.has(socket)) {
            return;
        }
        const id = uuid();
        Reflect.set(socket, "id", id);
        Reflect.set(socket, "requestCount", 0);
        Reflect.set(socket, "pongDt", new Date().getTime());
        Reflect.set(socket, "connectedAt", new Date().getTime());

        // Add socket to the Set
        this.currConnectedSockets.add(socket);
        this.send(socket, "connection", { id });
        console.log(green(`New socket client (id: ${yellow(id)}) connected!`));

        // Handle socket data
        socket.on("data", (buf) => {
            const messages = SocketHandler.socketDataHandler(socket, buf);
            for (const { title, body = {} } of messages) {
                this.emit(title, socket, body);
            }
        });

        // Handle close and error event!
        socket.on("close", () => {
            this.removeSocket(socket);
        });
        socket.on("error", (error) => {
            console.error(error);
            this.removeSocket(socket);
        });
    }

    /**
     * @public
     * @method broadcast
     * @desc Broadcast a message to all connected socket clients!
     * @memberof SocketHandler#
     * @param {net.Socket} socket socket
     * @param {!String} title Message title
     * @param {Mordor.SocketMessage} body Data to send (if any)
     * @returns {void}
     *
     * @throws {TypeError}
     */
    broadcast(socket, title, body = {}) {
        if (!is.string(title)) {
            throw new TypeError("title argument should be typeof string");
        }

        for (const currSocket of this.currConnectedSockets) {
            if (socket && currSocket === socket) {
                continue;
            }
            this.send(currSocket, title, body);
        }
    }

    /**
     * @public
     * @method removeSocket
     * @desc Remove a socket (if exist!)
     * @memberof SocketHandler#
     * @param {net.Socket} socket Node.JS Net socket
     * @param {String=} reason destroy reason
     * @returns {Boolean}
     */
    removeSocket(socket, reason) {
        if (!this.currConnectedSockets.has(socket)) {
            return false;
        }

        // Check if the socket is already destroyed
        if (!socket.destroyed) {
            socket.destroy(reason);
        }
        this.currConnectedSockets.delete(socket);
        console.log(yellow(`Socket client (id: ${socket.id}) has been disconnected! (removed)`));

        return true;
    }

    /**
     * @public
     * @method send
     * @desc Send a message to a given socket!
     * @memberof SocketHandler#
     * @param {*} socket Node.JS Net socket
     * @param {!String} title message title
     * @param {Mordor.SocketMessage} [body={}] message body
     * @returns {void}
     */
    send(socket, title, body = {}) {
        if (!this.currConnectedSockets.has(socket)) {
            throw new Error("Unable to find socket on the client list!");
        }
        if (!is.string(title)) {
            throw new TypeError("title argument should be a string!");
        }

        const data = JSON.stringify({ title, body });
        socket.write(Buffer.from(`${data}\n`));
    }

    /**
     * @public
     * @method sendAndWait
     * @template T
     * @desc Send a new message to the MordorClient!
     * @memberof SocketHandler#
     * @param {net.Socket} socket Node.JS Net socket
     * @param {Object=} options options
     * @param {!String} options.title message title
     * @param {Object=} [options.body={}] message body
     * @param {Number=} [options.timeOut=5000] Send timeout!
     * @returns {Promise<T | void>}
     *
     * @throws {TypeError}
     */
    sendAndWait(socket, { title, body = {}, timeOut = 5000 }) {
        return new Promise((resolve, reject) => {
            if (!this.currConnectedSockets.has(socket)) {
                throw new Error("Unable to find socket on the client list!");
            }
            if (!is.string(title)) {
                throw new TypeError("title argument should be typeof string");
            }
            const data = JSON.stringify({ title, body });
            this.client.write(Buffer.from(data.concat("\n")));

            // Return if we dont expect a return from MordorClient
            if (timeOut === 0) {
                return resolve();
            }

            /** @type {NodeJS.Timer} */
            let timeOutRef = null;
            function handler(data) {
                clearTimeout(timeOutRef);
                resolve(data);
            }
            timeOutRef = setTimeout(() => {
                this.events.removeListener(title, handler);
                reject(new Error(`Timeout message ${title}`));
            }, timeOut);
            this.events.addListener(title, handler);

            return void 0;
        });
    }

    /**
     * @public
     * @method disconnectAllSockets
     * @desc Disconnect all socket clients properly
     * @memberof SocketHandler#
     * @param {String=} reason disconnection reason
     * @returns {void}
     */
    disconnectAllSockets(reason = "Internal server error (disconnected from network)") {
        for (const socket of this.currConnectedSockets) {
            socket.destroy(reason);
        }
        setImmediate(process.exit);
    }

}

module.exports = SocketHandler;
