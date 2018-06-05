/**
 * @func getProjects
 * @desc Return the complete list of registered projects!
 * @param {net.Socket} socket Node.JS Socket
 * @returns {void}
 */
function getProjects() {
    const ret = {
        error: null
    };

    for (const remoteServer of this.servers.values()) {
        Reflect.set(ret, remoteServer.name, {
            id: remoteServer.uid,
            projects: [
                ...remoteServer.projects.values()
            ].map((val) => val.valueOf())
        });
    }

    return ret;
}

module.exports = getProjects;
