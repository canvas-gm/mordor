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
     * @param {!String} login client login
     */
    constructor(socket, login) {
        this.socket = socket;
        this.login = login;
        this.updatedAt = new Date();
    }

    /**
     * @method isUpToDate
     * @returns {Boolean}
     */
    isUpToDate() {
        const delta = this.updatedAt.getTime() - new Date().getTime();
        console.log(delta);

        this.updatedAt = new Date();

        return true;
    }

}

module.exports = RemoteClient;
