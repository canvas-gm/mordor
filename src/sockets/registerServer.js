// Require Internal Modules
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
    const uid = Reflect.get(options, "uid");
    if (this.servers.has(uid)) {
        throw new Error("Server already authentified (currently in use)");
    }
    Reflect.set(socket, "serverId", uid);
    this.servers.set(uid, new RemoteServer(socket, options));

    return { error: null };
}

module.exports = registerServer;
