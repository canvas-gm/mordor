// Require Internal Modules
const { getSocketAddr } = require("../utils");
const RemoteProject = require("../core/remoteProject.class");

/**
 * @func registerProject
 * @desc Register a new project for a given authenticated server
 * @param {*} socket
 * @param {*} options
 */
function registerProject(socket, options) {
    // Return if the socket is not authenticated as Server!
    const addr = getSocketAddr(socket);
    if (!this.servers.has(addr)) {
        return;
    }

    const remoteServer = this.servers.get(addr);
    remoteServer.projects.set(
        options.name,
        new RemoteProject(options.name, options.description)
    );

}

module.exports = registerProject;
