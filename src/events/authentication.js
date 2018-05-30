const authenticationType = new Set(["server", "client"]);

function authentication(socket, { type }) {
    if (!authenticationType.has(type)) {
        return this.send(socket, "authentication", {
            error: `Unknow type ${type}, valid types are: ${[...authenticationType].join(',')}`
        });
    }

    // TODO: Check if socket is already authenticate as a server or client!
    if (this.servers.has(socket.remoteAddress)) {
        return this.send(socket, "authentication", {
            error: "Server already authenticate (in use)!"
        });
    }

    if (type === "server") {
        this.servers.set(socket.remoteAddress, socket);
        return this.send(socket, "authentication", {
            error: null
        });
    }
    else {
        // Authenticate client!
    }
}

module.exports = authentication;
