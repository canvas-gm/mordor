// Require Internal Modules
const { getSocketAddr } = require("../utils");
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
    const addr = getSocketAddr(socket);
    if (!this.servers.has(addr)) {
        return;
    }

    try {
        const { name } = options;
        const remoteServer = this.servers.get(addr);
        if (remoteServer.projects.has(name)) {
            throw new Error(`Project with name ${name} has been already registered!`);
        }

        const project = new RemoteProject(options);
        remoteServer.projects.set(name, project);

        for (const cSock of this.currConnectedSockets) {
            this.send(cSock, "registerProject", {
                from: remoteServer.uid,
                project: project.valueOf()
            });
        }
    }
    catch (error) {
        this.send(socket, "registerProject", { error });
    }
}

module.exports = registerProject;
