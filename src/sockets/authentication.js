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
    if (!authenticationType.has(options.type)) {
        throw new Error(`Unknow type ${type}, valid types are: ${getKnowTypes()}`);
    }

    // If authentication is for a server!
    if (type === "server") {
        const addr = getSocketAddr(socket);
        if (this.servers.has(addr)) {
            throw new Error("Server already authenticate (in use)!");
        }
        this.servers.set(addr, new RemoteServer(socket, options));

        return { error: null };
    }

    // If authentication is for a normal client
    if (socket.isAuthenticated()) {
        throw new Error("You'r already authenticated !");
    }

    // Retrieve login and password from options
    const login = options.login;
    const password = createHmac("sha256", "secret")
        .update(options.password)
        .digest("hex");

    if (!is.string(login) || !is.string(password)) {
        throw new TypeError("login and password should be defined and typeof string");
    }

    // Open local database
    const db = Datastore.create(join(dbDir, "storage.db"));
    await db.load();
    const docs = await db.find({ login, password, active: true });
    if (docs.length === 0) {
        throw new Error(`Unable to found any valid account with login ${login}`);
    }

    // Save
    const client = new RemoteClient(socket, login);
    this.clients.set(socket.id, client);
    Reflect.set(socket, "session", client);

    return {
        socketId: socket.id
    };
}

module.exports = authentication;
