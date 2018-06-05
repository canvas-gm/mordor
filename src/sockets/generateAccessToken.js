// Require Third-party Dependencies
const randtoken = require("rand-token");
const argon2 = require("argon2");

/**
 * @func generateAccessToken
 * @desc Generate an access token for a given server!
 * @param {net.Socket} socket Node.JS Socket
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

    // Setup a new AccessToken
    const serverId = await argon2.hash(uid);
    this.accessToken.set(clientId, {
        serverId,
        token: randtoken.generate(16)
    });

    return {
        error: null,
        serverId
    };
}

module.exports = generateAccessToken;
