// Require Node.JS Dependencies
const { join } = require("path");

// Require Third-party dependencies
const Datastore = require("nedb-promises");
const is = require("@sindresorhus/is");
const argon2 = require("argon2");

// Require Internal Modules
const RemoteClient = require("../class/remoteClient");

/**
 * @const dbDir
 * @type {String}
 * @desc Absolute path to the storage (db) directory
 */
const dbDir = join(__dirname, "../../db");

/**
 * @async
 * @func checkUserRegistration
 * @desc Check if the user is registered or not
 * @param {!String} email email
 * @param {!String} password password
 * @returns {Promise<void>}
 *
 * @throws {TypeError}
 */
async function checkUserRegistration(email, password) {
    // Check field integrity
    if (!is.string(email)) {
        throw new TypeError("User email should be a string!");
    }
    if (!is.string(password)) {
        throw new TypeError("User password should be a string!");
    }

    // Load database
    const db = Datastore.create(join(dbDir, "storage.db"));
    await db.load();


    // Hash password
    const hashPassword = await argon2.hash(password);

    // Query to find user by matching login!
    const query = {
        email,
        active: true
    };
    const docs = (await db.find(query)).filter(
        async(user) => await argon2.verify(user.password, hashPassword)
    );
    if (docs.length === 0) {
        throw new Error(`Unable to found any valid account with email ${email}`);
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
    await checkUserRegistration(options.email, options.password);

    // Save session on the client and socketEvents!
    const client = new RemoteClient(socket, options.email);
    this.clients.set(socket.id, client);
    Reflect.set(socket, "session", client);

    return {
        socketId: socket.id
    };
}

module.exports = authentication;
