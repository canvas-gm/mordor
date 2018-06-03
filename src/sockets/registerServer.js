// Require Internal Modules
const { getSocketAddr } = require("../utils");
/** @type {Mordor.RemoteServer} */
const RemoteServer = require("../class/remoteServer");

/**
 * @func registerServer
 * @desc register a new remote Server
 * @param {net.Socket} socket Node.JS Socket
 * @param {Object} options server options
 * @returns {void}
 */
function registerServer(socket, options) {
    const addr = getSocketAddr(socket);
    if (this.servers.has(addr)) {
        throw new Error("Server already authenticate (in use)!");
    }
    this.servers.set(addr, new RemoteServer(socket, options));

    return { error: null };
}

module.exports = registerServer;
