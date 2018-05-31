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
     * @param {Object} options options
     * @param {!String} options.name project name
     * @param {String=} options.description project description
     */
    constructor({ name, description } = {}) {
        this.id = uuid();
        this.name = name;
        this.description = description;
    }

    /**
     * @method valueOf
     * @returns {Object}
     */
    valueOf() {
        return {
            name: this.name,
            description: this.description
        };
    }

}

module.exports = RemoteProject;
