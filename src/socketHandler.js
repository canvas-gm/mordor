// Require Node.JS dependencies
const { join } = require("path");

// Require Third-party Dependencies
const is = require("@sindresorhus/is");

// Require Internal Dependencies
const SocketHandler = new (require("./class/SocketHandler"))();
const autoLoader = require("./autoloader");

// Setup deviation variable(s)
SocketHandler.servers = new Map();
SocketHandler.clients = new Map();
SocketHandler.accessToken = new Map();

// Load all sockets handlers!
autoLoader(SocketHandler, join(__dirname, "sockets"));

/**
 * @func socketHandler
 * @desc Main socket handler!
 * @param {net.Socket} socket Node.JS Socket
 * @returns {void}
 */
function socketHandler(socket) {
    /**
     * @func isAuthenticated
     * @desc Verify if the socket client is authenticated!
     * @returns {boolean}
     */
    function isAuthenticated() {
        /** @type {RemoteClient} */
        const remoteClient = Reflect.get(socket, "session");
        if (is.nullOrUndefined(remoteClient)) {
            return false;
        }
        if (!remoteClient.isUpToDate()) {
            SocketHandler.removeSocket(socket);
        }

        return true;
    }

    Reflect.set(socket, "isAuthenticated", isAuthenticated);
    SocketHandler.connectSocket(socket);
}

// Export socket function handler
module.exports = {
    handler: socketHandler,
    socket: SocketHandler
};
