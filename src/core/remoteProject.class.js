// Require Third-party Dependencies
const is = require("@sindresorhus/is");
const uuid = require("uuid/v4");

/**
 * @class RemoteProject
 * @desc A remote project from a remote server!
 */
class RemoteProject {

    /**
     * @constructor
     * @param {!String} name project name
     * @param {String=} description project description
     */
    constructor(name, description = "") {
        this.id = uuid();
        this.name = name;
        this.description = description;
        this.protected = false;
        this.onlineClients = 0;
    }

}
