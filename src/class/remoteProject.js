// Require Third-party Dependencies
const uuid = require("@lukeed/uuid");
const is = require("@sindresorhus/is");

/**
 * @class RemoteProject
 * @desc A remote project (part of a remote server).
 */
class RemoteProject {

    /**
     * @constructor
     * @param {Object} options options
     * @param {!String} options.uid Unique project id
     * @param {!String} options.name Project name
     * @param {String=} options.description Project description
     *
     * @throws {TypeError}
     */
    constructor({ uid = uuid(), name, description = "" } = {}) {
        if (!is.string(name)) {
            throw new TypeError("A project should be defined and typeof string!");
        }

        this.uid = uid;
        /** @type {String} */
        this.name = name;
        /** @type {String} */
        this.description = description;
    }

    /**
     * @public
     * @method valueOf
     * @desc Return the project as a native JS Object!
     * @returns {Mordor.NativeProjectValue}
     */
    valueOf() {
        return {
            name: this.name,
            description: this.description
        };
    }

}

module.exports = RemoteProject;
