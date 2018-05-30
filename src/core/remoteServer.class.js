/**
 * @class RemoteServer
 * @desc Canvas GM remote socket server
 *
 * @property {Map} projects
 */
class RemoteServer {

    /**
     * @constructor
     * @param {*} socket
     */
    constructor(socket) {
        this.socket = socket;
        this.projects = new Map();
    }

}

module.exports = RemoteServer;
