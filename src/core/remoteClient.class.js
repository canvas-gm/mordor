/**
 * @class RemoteClient
 *
 * @property {any} socket
 */
class RemoteClient {

    /**
     * @constructor
     * @param {*} socket Node.JS Socket
     */
    constructor(socket) {
        this.socket = socket;
    }

}

module.exports = RemoteClient;
