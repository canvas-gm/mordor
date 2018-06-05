/**
 * @func requestAccessToken
 * @desc Generate an access token for a given server!
 * @param {net.Socket} socket Node.JS Socket
 * @param {Object} options options
 * @returns {void}
 */
function requestAccessToken(socket, { serverId }) {
    const uid = Reflect.get(socket, "serverId");
    if (this.servers.has(uid)) {
        throw new Error("Command not available for Socket authenticated as Server!");
    }

    if (!this.accessToken.has(socket.id)) {
        throw new Error(`No AccessToken available for socket id ${socket.id}`);
    }
    if (!this.accessToken.get(socket.id).has(serverId)) {
        throw new Error(`No AccessToken available for socket ${socket.id} on serverId ${serverId}`);
    }
    const token = this.accessToken.get(socket.id).get(serverId);
    token.requested = true;

    return {
        error: null,
        accessToken: token.value
    };
}

module.exports = requestAccessToken;
