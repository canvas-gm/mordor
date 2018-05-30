// Register a new project!
function registerProject(socket) {
    // Return if the socket is not authenticated as Server!
    if (!this.servers.has(socket.remoteAddress)) {
        return;
    }


}

module.exports = registerProject;
