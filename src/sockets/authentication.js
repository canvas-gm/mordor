const { getSocketAddr } = require("../utils");
const RemoteServer = require("../core/remoteServer.class");

// All available authentication types
const authenticationType = new Set(["server", "client"]);

/**
 * @func authentication
 * @desc Authentication handler
 * @param {*} socket Node.JS Socket
 * @param {*} options Method options
 * @returns {any}
 */
function authentication(socket, options) {
    const type = options.type;
    delete options.type;
    if (!authenticationType.has(type)) {
        return this.send(socket, "authentication", {
            error: `Unknow type ${type}, valid types are: ${[...authenticationType].join(',')}`
        });
    }

    // Retrieve socket addr
    const addr = getSocketAddr(socket);
    console.log(`Server addr => ${addr}`);

    // Return error if the server is already authenticated (registered).
    if (this.servers.has(addr)) {
        return this.send(socket, "authentication", {
            error: "Server already authenticate (in use)!"
        });
    }

    if (type === "server") {
        try {
            this.servers.set(addr, new RemoteServer(socket, options));

            return this.send(socket, "authentication", {
                error: null
            });
        }
        catch (error) {
            return this.send(socket, "authentication", { error });
        }
    }
    else {
        // Authenticate client! (check in DB for login/password)
    }
}

module.exports = authentication;
