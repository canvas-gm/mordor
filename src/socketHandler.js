// Require Third-party Dependencies
const { green, yellow } = require("chalk");
const is = require("@sindresorhus/is");
const uuid = require("uuid/v4");

// Require Internal Dependencies
const socketEvents = require("./socketEvents");
const { parseSocketMessages } = require("./utils");

// Globals
const MAX_REQUESTS_PER_SECOND = 30;

// Close every sockets properly on critical error(s)
process.once("SIGINT", socketEvents.disconnectAllSockets.bind(socketEvents));
process.once("exit", socketEvents.disconnectAllSockets.bind(socketEvents));

// Reset all sockets handle every second!
setInterval(() => {
    for (const socket of socketEvents.currConnectedSockets) {
        socket.handle = 0;
    }
}, 1000);

/**
 * @func socketHandler
 * @desc Main socket handler!
 * @param {net.Socket} socket Node.JS Socket
 * @returns {void}
 */
function socketHandler(socket) {
    socketEvents.currConnectedSockets.add(socket);

    Reflect.set(socket, "id", uuid());
    Reflect.set(socket, "handle", 0);
    console.log(green(`New socket client (id: ${socket.id}) connected!`));

    // Data handler!
    socket.on("data", function socketDataHandler(msg) {
        if (socket.handle >= MAX_REQUESTS_PER_SECOND) {
            return socketEvents.removeSocket(socket);
        }
        socket.handle++;
        if (is.nullOrUndefined(msg)) {
            return void 0;
        }
        const messages = parseSocketMessages(msg.toString());

        for (const { title, body = {} } of messages) {
            socketEvents.emit(title, socket, body);
        }

        return void 0;
    });

    // Define handler to apply when socket receive a close or error event
    function socketClose() {
        const ret = socketEvents.removeSocket(socket);
        if (ret === false) {
            return;
        }
        console.log(yellow(`Socket client (id: ${socket.id}) has been disconnected!`));
    }
    socket.on("close", socketClose);
    socket.on("error", socketClose);
}

module.exports = socketHandler;
