// Require Internal Modules
const { getSocketAddr } = require("../utils");
/** @type {Mordor.RemoteServer} */
const RemoteServer = require("../class/remoteServer");

/**
 * @const authenticationType
 * @desc All available authentication types
 * @type {Set<String>}
 */
const authenticationType = new Set(["server", "client"]);

/**
 * @func getKnowTypes
 * @desc Return the list (as string) of know authentication types
 * @param {!String} [separator=","] types separator
 * @returns {String}
 */
function getKnowTypes(separator = ",") {
    return [...authenticationType].join(separator);
}

/**
 * @func authentication
 * @desc Authentication handler
 * @param {net.Socket} socket Node.JS Socket
 * @param {*} options Method options
 * @returns {any}
 *
 * @this {Mordor.socketMessageWrapper}
 */
function authentication(socket, options) {
    const type = options.type;
    delete options.type;
    if (!authenticationType.has(type)) {
        return this.send(socket, "authentication", {
            error: `Unknow type ${type}, valid types are: ${getKnowTypes()}`
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
        return void 0;
    }
}

module.exports = authentication;
