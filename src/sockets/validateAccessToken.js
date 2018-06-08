// Require Third-party Dependencies
const argon2 = require("argon2");

/**
 * @func validateAccessToken
 * @desc Generate an access token for a given server!
 * @param {net.Socket} socket Node.JS Socket
 * @param {Object} options options
 * @returns {void}
 */
async function validateAccessToken(socket, { accessToken, socketId, clientId }) {
    if (!this.accessToken.has(clientId)) {
        throw new Error(`No AccessToken available for socket id ${clientId}`);
    }
    if (!this.accessToken.get(clientId).has(socket.id)) {
        throw new Error(`No AccessToken available for socket ${clientId} on serverId ${socket.id}`);
    }

    // Verify token!
    const token = this.accessToken.get(clientId).get(socket.id);
    if (token.requested === false) {
        throw new Error("AccessToken not requested by the client !");
    }
    const tokenIsValid = await argon2.verify(accessToken, socket.id + token.lock + socketId);
    if (!tokenIsValid) {
        throw new Error("The given AccessToken is invalid!");
    }

    // Clear timeout and clean-up token entry!
    clearTimeout(token.timeOut);
    this.accessToken.get(clientId).delete(socket.id);
    if (this.accessToken.get(clientId).size === 0) {
        this.accessToken.delete(clientId);
    }

    // Retrieve client
    const client = this.clients.get(clientId).valueOf();

    return {
        error: null,
        client
    };
}

module.exports = validateAccessToken;
