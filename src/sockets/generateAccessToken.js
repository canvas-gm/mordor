// Require Node.js Dependencies
const { randomBytes } = require("crypto");

// Require Third-party Dependencies
const argon2 = require("argon2");

/**
 * @func generateAccessToken
 * @desc Generate an access token for a given server!
 * @param {Mordor.Socket} socket Node.JS Socket
 * @param {Object} options options
 * @returns {void}
 */
async function generateAccessToken(socket, { socketId, clientId }) {
    const uid = Reflect.get(socket, "serverId");
    if (!this.servers.has(uid)) {
        throw new Error("Unknow server. Only server can request generation of AccessToken!");
    }
    if (!this.clients.has(clientId)) {
        return {
            error: `Unable to found any client with id ${clientId}`
        };
    }

    // Setup AccessToken timeout!
    const timeOut = setTimeout(() => {
        this.accessToken.get(clientId).delete(socket.id);
        if (this.accessToken.get(clientId).size === 0) {
            this.accessToken.delete(clientId);
        }
    }, 5000);

    // Setup a new AccessToken
    const lock = randomBytes(16).toString("hex")
    const token = {
        lock,
        requested: false,
        timeOut,
        value: await argon2.hash(socket.id + lock + socketId)
    };
    if (!this.accessToken.has(clientId)) {
        this.accessToken.set(clientId, new Map([socket.id, token]));
    }
    else {
        if (this.accessToken.get(clientId).has(socket.id)) {
            throw new Error("AccessToken still alive");
        }
        this.accessToken.get(clientId).set(socket.id, token);
    }

    return {
        serverId: socket.id,
        error: null
    };
}

module.exports = generateAccessToken;
