/**
 * @func getProjects
 * @desc Return the complete list of registered projects!
 * @param {net.Socket} socket Node.JS Socket
 * @returns {void}
 */
function getProjects() {
    const result = { error: null };

    for (const { name, uid, projects } of this.servers.values()) {
        result[name] = {
            id: uid, projects: [...projects.values()].map((val) => val.valueOf())
        }
    }

    return result;
}

module.exports = getProjects;
