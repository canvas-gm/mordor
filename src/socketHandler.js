// Require Third-party Dependencies
const { green, yellow } = require("chalk");
const is = require("@sindresorhus/is");
const uuid = require("uuid/v4");

// Require Internal Dependencies
const socketEvents = require("./socketEvents");
const { parseSocketMessages } = require("./utils");

// Close every sockets properly on critical error(s)
process.once("SIGINT", socketEvents.disconnectAllSockets.bind(socketEvents));
process.once("exit", socketEvents.disconnectAllSockets.bind(socketEvents));

/**
 * @func socketHandler
 * @desc Main socket handler!
 * @param {net.Socket} socket Node.JS Socket
 * @returns {void}
 */
function socketHandler(socket) {
    socketEvents.currConnectedSockets.add(socket);

    Reflect.set(socket, "id", uuid());
    console.log(green(`New socket client (id: ${socket.id}) connected!`));

    // Data handler!
    socket.on("data", function socketDataHandler(msg) {
        if (is.nullOrUndefined(msg)) {
            return;
        }
        const messages = parseSocketMessages(msg.toString());

        for (const { title, body } of messages) {
            socketEvents.emit(title, socket, body);
        }
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
