// Require Internal Modules
/** @type {Mordor.RemoteProject} */
const RemoteProject = require("../class/remoteProject");

/**
 * @func registerProject
 * @desc Register a new project for a given authenticated server
 * @param {*} socket Node.JS Net socket
 * @param {*} options Method options
 * @returns {any}
 */
function registerProject(socket, options) {
    // Return if the socket is not authenticated as Server!
    const uid = Reflect.get(socket, "serverId");
    if (!this.servers.has(uid)) {
        throw new Error("Unknow server. Please authenticate before registering any projects!");
    }

    const { name } = options;
    const remoteServer = this.servers.get(uid);
    if (remoteServer.projects.has(name)) {
        throw new Error(`Project with name ${name} has been already registered!`);
    }

    const project = new RemoteProject(options);
    remoteServer.projects.set(name, project);

    const ret = {
        error: null,
        from: remoteServer.uid,
        project: project.valueOf()
    };
    this.broadcastAll(socket, "registerProject", ret);

    return ret;
}

module.exports = registerProject;
