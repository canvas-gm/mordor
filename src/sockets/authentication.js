// Require Third-party dependencies
const rethinkdb = require("rethinkdb");
const is = require("@sindresorhus/is");
const argon2 = require("argon2");

// Require Internal Modules
const RemoteClient = require("../class/remoteClient");

// Require config
const config = require("../../config/editableSettings.json");

/**
 * @async
 * @func checkUserRegistration
 * @desc Check if the user is registered or not
 * @param {!String} email email
 * @param {!String} password password
 * @returns {Promise<Object>}
 *
 * @throws {TypeError}
 */
async function checkUserRegistration(email, password) {
    if (!is.string(email)) {
        throw new TypeError("User email should be a string!");
    }
    if (!is.string(password)) {
        throw new TypeError("User password should be a string!");
    }

    const conn = await rethinkdb.connect(config.database);
    const hashPassword = await argon2.hash(password);

    // Query to find user by matching login!
    try {
        const cursor = await rethinkdb.db("mordor").table("users").filter({
            email, active: true
        }).run(conn);
        const docs = (await cursor.toArray()).filter(
            async(user) => await argon2.verify(user.password, hashPassword)
        );
        if (docs.length === 0) {
            throw new Error(`Unable to found any valid account with email ${email}`);
        }

        return docs[0];
    }
    finally {
        await conn.close();
    }
}

/**
 * @func authentication
 * @desc Authentication handler
 * @param {Mordor.Socket} socket Node.JS Socket
 * @param {*} options Method options
 * @returns {any}
 *
 * @this {SocketMessageWrapper}
 */
async function authentication(socket, options) {
    if (socket.isAuthenticated()) {
        throw new Error("Socket session already authenticated!");
    }

    // Verify if the user is registered!
    const user = await checkUserRegistration(options.email, options.password);

    // Save session on the client and socketEvents!
    const client = new RemoteClient(socket, user);
    this.clients.set(socket.id, client);
    Reflect.set(socket, "session", client);

    return {
        error: null,
        socketId: socket.id
    };
}

module.exports = authentication;
