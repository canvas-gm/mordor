// Require Node.JS Dependencies
const { createHmac } = require("crypto");
const { join } = require("path");

// Require Third-party dependencies
const Datastore = require("nedb-promises");
const is = require("@sindresorhus/is");

// Require Internal Modules
const { getSocketAddr } = require("../utils");
/** @type {Mordor.RemoteServer} */
const RemoteServer = require("../class/remoteServer");
/** @type {Mordor.RemoteClient} */
const RemoteClient = require("../class/remoteClient");

// Globals
const dbDir = join(__dirname, "../../db");

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
async function authentication(socket, options) {
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
        const isAuthenticated = socket.isAuthenticated();
        if (isAuthenticated) {
            return this.send(socket, "authentication", {
                error: "Already authenticated!"
            });
        }
        try {

            const login = options.login;
            const password = createHmac("sha256", "secret")
                .update(options.password)
                .digest("hex");

            if (!is.string(login) || !is.string(password)) {
                throw new TypeError("login and password should be defined and typeof string");
            }

            const db = Datastore.create(join(dbDir, "storage.db"));
            await db.load();
            const docs = await db.find({ login, password, active: true });
            if (docs.length === 0) {
                throw new Error(`Unable to found any valid account with login ${login}`);
            }

            // Create (redis?) session
            const client = new RemoteClient(socket, login);
            this.clients.set(socket.id, client);
            Reflect.set(socket, "session", client);

            return this.send(socket, "authentication", {
                error: null,
                socketId: socket.id
            });
        }
        catch (error) {
            return this.send(socket, "authentication", { error });
        }
    }
}

module.exports = authentication;
