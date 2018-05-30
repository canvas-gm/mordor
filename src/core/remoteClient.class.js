/**
 * @class RemoteClient
 *
 * @property {any} socket
 */
class RemoteClient {

    /**
     * @constructor
     * @param {*} socket
     */
    constructor(socket) {
        this.socket = socket;
    }

}

module.exports = RemoteClient;
