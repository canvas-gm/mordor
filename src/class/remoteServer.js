// Require Third-party Dependencies
const uuid = require("@lukeed/uuid");
const is = require("@sindresorhus/is");

/**
 * @class RemoteServer
 * @desc Canvas GM remote socket server
 *
 * @property {Map<String, Mordor.RemoteProject>} projects
 * @property {net.Socket} socket
 * @property {String} name Project name
 * @property {String} uid Project unique id!
 */
class RemoteServer {

    /**
     * @constructor
     * @param {net.Socket} socket Node.JS Socket
     * @param {Object=} [options={}] options
     * @param {String=} options.uid server unique id
     * @param {!String} options.name server name!
     */
    constructor(socket, { uid = uuid(), name } = {}) {
        if (!is.string(name)) {
            throw new TypeError("A (valid) server name is required!");
        }

        this.uid = uid;
        /** @type {String} */
        this.name = name;
        /** @type {net.Socket} */
        this.socket = socket;
        /** @type {Map<String, Mordor.RemoteProject>} */
        this.projects = new Map();
        /** @type {Number} */
        this.registeredNumbers = 0;
    }

}

module.exports = RemoteServer;
