// Require Internal Modules
const { getSocketAddr } = require("../utils");

// Require Third-party Dependencies
const is = require("@sindresorhus/is");

// Require Node.JS dependencies
const events = require("events");

/**
 * @class SocketMessageWrapper
 * @extends events
 *
 * @property {Set<net.Socket>} currConnectedSockets
 * @property {Map<String, Mordor.RemoteClient>} clients
 * @property {Map<String, Mordor.RemoteServer>} servers
 */
class SocketMessageWrapper extends events {

    /**
     * @constructor
     */
    constructor() {
        super();
        this.currConnectedSockets = new Set();
        this.clients = new Map();
        this.servers = new Map();
    }

    /**
     * @public
     * @method broadcastAll
     * @desc Broadcast a message to all connected socket clients!
     * @memberof socketMessageWrapper#
     * @param {net.Socket} socket socket
     * @param {!String} title Message title
     * @param {Mordor.SocketMessage} body Data to send (if any)
     * @returns {void}
     */
    broadcastAll(socket, title, body = {}) {
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
     * @memberof socketMessageWrapper#
     * @param {*} socket Node.JS Net socket
     * @returns {Boolean}
     */
    removeSocket(socket) {
        if (!this.currConnectedSockets.has(socket)) {
            return false;
        }
        this.currConnectedSockets.delete(socket);
        this.clients.delete(socket.id);
        this.servers.delete(getSocketAddr(socket));

        return true;
    }

    /**
     * @public
     * @method send
     * @desc Send a message to a given socket!
     * @memberof socketMessageWrapper#
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
     * @method disconnectAllSockets
     * @desc Disconnect all sockets users properly
     * @memberof socketMessageWrapper#
     * @returns {void}
     */
    disconnectAllSockets() {
        for (const socket of this.currConnectedSockets) {
            socket.destroy("Internal server error (disconnected from network)");
        }

        // Exit node at the next event-loop iteration
        setImmediate(process.exit);
    }

}

module.exports = SocketMessageWrapper;
