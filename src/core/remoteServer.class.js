// Require Third-party Dependencies
const uuid = require("uuid/v4");

/**
 * @class RemoteServer
 * @desc Canvas GM remote socket server
 *
 * @property {Map} projects
 * @property {*} socket
 * @property {String} name
 * @property {String} id
 */
class RemoteServer {

    /**
     * @constructor
     * @param {*} socket
     * @param {!String} name
     */
    constructor(socket, name) {
        this.id = uuid();
        this.name = name;
        this.socket = socket;
        this.projects = new Map();
    }

}

module.exports = RemoteServer;
