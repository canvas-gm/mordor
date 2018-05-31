/**
 * @func getProjects
 * @desc Return the complete list of registered projects!
 * @param {*} socket Node.JS Socket
 * @returns {any}
 */
function getProjects(socket) {
    const ret = {};

    for (const remoteServer of this.servers.values()) {
        Reflect.set(ret, remoteServer.name, {
            id: remoteServer.uid,
            projects: [...remoteServer.projects.values()].map((val) => val.valueOf())
        });
    }

    this.send(socket, "getProjects", ret);
}

module.exports = getProjects;
