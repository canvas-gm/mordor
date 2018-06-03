/**
 * @func generateAccessToken
 * @desc Generate an access token for a given server!
 * @param {net.Socket} socket Node.JS Socket
 * @param {Object} options options
 * @returns {void}
 */
function generateAccessToken(socket, options) {
    const ret = {
        error: null
    };


    this.send(socket, "generateAccessToken", ret);
}

module.exports = generateAccessToken;
