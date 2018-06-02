// Require Third-party Dependencies
const uuid = require("uuid/v4");
const is = require("@sindresorhus/is");

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
     * @param {*} socket Node.JS Socket
     * @param {Object} options options
     * @param {String=} options.uid server unique id
     * @param {!String} options.name server name!
     */
    constructor(socket, { uid = uuid(), name }) {
        if (!is.string(name)) {
            throw new TypeError("A (valid) server name is required!");
        }

        this.uid = uid;
        this.name = name;
        this.socket = socket;
        this.projects = new Map();
        this.registeredNumbers = 0;
    }

}

module.exports = RemoteServer;
