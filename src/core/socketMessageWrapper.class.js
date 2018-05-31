// Require Internal Modules
const { getSocketAddr } = require("../utils");

// Require Third-party Dependencies
const is = require("@sindresorhus/is");

// Require Node.JS dependencies
const events = require("events");

/**
 * @class socketMessageWrapper
 * @extends events
 *
 * @property {Set} currConnectedSockets
 * @property {Map<String, RemoteClient>} clients
 * @property {Map<String, RemoteServer>} servers
 */
class socketMessageWrapper extends events {
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
     * @param {!String} title Message title
     * @param {*} body Data to send (if any)
     * @returns {void}
     */
    broadcastAll(title, body = {}) {
        if (!is.string(title)) {
            throw new TypeError("title argument should be typeof string");
        }
        for (const socket of this.currConnectedSockets) {
            this.send(socket, title, body);
        }
    }

    /**
     * @public
     * @method removeSocket
     * @desc Remove a socket (if exist!)
     * @memberof socketMessageWrapper#
     * @param {*} socket
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
     * @param {*} socket
     * @param {!String} title
     * @param {Object=} body
     * @returns {void}
     */
    send(socket, title, body) {
        if (!this.currConnectedSockets.has(socket)) {
            throw new Error("Unable to find socket on the client list!");
        }
        if (!is.string(title)) {
            throw new TypeError("title argument should be a string!");
        }
        const data = JSON.stringify({ title, body });
        socket.write(Buffer.from(data + "\n"));
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
        setImmediate(() => {
            process.exit(0);
        });
    }

}

module.exports = socketMessageWrapper;
