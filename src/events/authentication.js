const { getSocketAddr } = require("../utils");
const RemoteServer = require("../core/remoteServer.class");

// All available authentication types
const authenticationType = new Set(["server", "client"]);

/**
 * @func authentication
 * @desc Authentication handler
 * @param {*} socket
 * @param {*} options
 */
function authentication(socket, { type }) {
    if (!authenticationType.has(type)) {
        return this.send(socket, "authentication", {
            error: `Unknow type ${type}, valid types are: ${[...authenticationType].join(',')}`
        });
    }

    // Retrieve socket addr
    const addr = getSocketAddr(socket);

    // Return error if the server is already authenticated (registered).
    if (this.servers.has(addr)) {
        return this.send(socket, "authentication", {
            error: "Server already authenticate (in use)!"
        });
    }

    if (type === "server") {
        this.servers.set(addr, new RemoteServer(socket));
        return this.send(socket, "authentication", {
            error: null
        });
    }
    else {
        // Authenticate client!
    }
}

module.exports = authentication;
