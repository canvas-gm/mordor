/**
 * @class RemoteClient
 * @desc A remote (authenticated) socket client!
 *
 * @property {net.Socket} socket
 */
class RemoteClient {

    /**
     * @constructor
     * @param {net.Socket} socket Node.JS Socket
     */
    constructor(socket) {
        this.socket = socket;
    }

}

module.exports = RemoteClient;
