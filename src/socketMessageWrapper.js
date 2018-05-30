// Require Third-party Dependencies
const is = require("@sindresorhus/is");

// Require Node.JS dependencies
const events = require("events");

/**
 * @class socketMessageWrapper
 * @extends events
 *
 * @property {Set} clients
 */
class socketMessageWrapper extends events {
    constructor() {
        super();
        this.setMaxListeners(100);
        this.clients = new Set();
    }

    /**
     * @public
     * @method broadcast
     * @desc Broadcast a message to all connected socket clients!
     * @memberof socketMessageWrapper#
     * @param {!String} title Message title
     * @param {*} body Data to send (if any)
     * @returns {void}
     */
    broadcast(title, body = {}) {
        if (!is.string(title)) {
            throw new TypeError("title argument should be typeof string");
        }
        for (const socket of this.clients) {
            this.send(socket, title, body);
        }
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
        if (!this.clients.has(socket)) {
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
        for (const socket of this.clients) {
            socket.destroy("Internal server error (disconnected from network)");
        }

        // Exit node at the next event-loop iteration
        setImmediate(() => {
            process.exit(0);
        });
    }

}

module.exports = socketMessageWrapper;
