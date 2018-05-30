/**
 * @func getProjects
 * @desc Return the complete list of registered projects!
 * @param {*} socket
 */
function getProjects(socket) {
    if (!this.clients.has(socket.id)) {
        return this.send(socket, "getProjects", {
            error: "You have to be authenticated to retrieve the projects list!"
        });
    }
    const ret = {};

    for (const remoteServer of this.servers.values()) {
        Reflect.set(ret, remoteServer.name, {
            id: remoteServer.id,
            projects: [...remoteServer.projects.values()].map(v => v.valueOf())
        });
    }

    this.send(socket, "getProjects", ret);
}

module.exports = getProjects;