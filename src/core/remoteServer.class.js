// Require Third-party Dependencies
const uuid = require("uuid/v4");

/**
 * @class RemoteServer
 * @desc Canvas GM remote socket server
 *
 * @property {Map} projects
 * @property {*} socket
 * @property {String} name Project name
 * @property {String} uid Project unique id!
 */
class RemoteServer {

    /**
     * @constructor
     * @param {*} socket
     * @param {Object} options
     * @param {!String} options.name
     */
    constructor(socket, { name }) {
        this.uid = uuid();
        this.name = name;
        this.socket = socket;
        this.projects = new Map();
        this.registeredNumbers = 0;
    }

}

module.exports = RemoteServer;
