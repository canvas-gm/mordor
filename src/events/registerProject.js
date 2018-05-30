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

    try {
        const remoteServer = this.servers.get(addr);
        if (remoteServer.projects.has(name)) {
            throw new Error(`Project with name ${name} has been already registered!`);
        }

        const project = new RemoteProject(options);
        remoteServer.projects.set(name, project);

        this.broadcastAll("registerProject", {
            from: remoteServer.name,
            project: project.valueOf()
        });
    }
    catch(error) {
        this.send(socket, "registerProject", { error });
    }
}

module.exports = registerProject;
