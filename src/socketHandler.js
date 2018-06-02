// Require Third-party Dependencies
const { green, yellow } = require("chalk");
const is = require("@sindresorhus/is");
const uuid = require("uuid/v4");

// Require Internal Dependencies
const socketEvents = require("./socketEvents");
const { parseSocketMessages } = require("./utils");

// MODULE CONSTANTS
/**
 * @const MAX_REQUESTS_PER_SECOND
 * @desc Maximum number of requests per second that a remote socket can burst
 * @type {Number}
 */
const MAX_REQUESTS_PER_SECOND = 30;

/**
 * Close every sockets properly on critical error(s)
 */
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

    // Set new parameters on curr socket
    Reflect.set(socket, "id", uuid());
    Reflect.set(socket, "requestCount", 0);
    console.log(green(`New socket client (id: ${yellow(socket.id)}) connected!`));

    /**
     * @func socketDataHandler
     * @param {!Buffer} msg Socket (buffer) message
     * @returns {void}
     */
    function socketDataHandler(msg) {
        if (is.nullOrUndefined(msg)) {
            return;
        }

        // Disconnect remote socket if max requests has been reach!
        const requestCount = Reflect.get(socket, "requestCount");
        if (requestCount >= MAX_REQUESTS_PER_SECOND) {
            socketEvents.removeSocket(socket);

            return;
        }
        Reflect.set(socket, "requestCount", requestCount + 1);

        // Parse and send message to the event container (wrapper).
        const messages = parseSocketMessages(msg.toString());
        for (const msg of messages) {
            socketEvents.emit(msg.title, socket, msg.body);
        }

        return;
    }
    socket.on("data", socketDataHandler);

    /**
     * @func socketClose
     * @desc Define handler to apply when socket receive a close or error event
     * @returns {void}
     */
    function socketClose() {
        if (!socketEvents.removeSocket(socket)) {
            return;
        }
        console.log(yellow(`Socket client (id: ${socket.id}) has been disconnected!`));
    }
    socket.on("close", socketClose);
    socket.on("error", socketClose);
}

/**
 * Reset all sockets requestCount to 0 every seconds!
 */
setInterval(function resetSocketRequestCount() {
    for (const socket of socketEvents.currConnectedSockets) {
        Reflect.set(socket, "requestCount", 0);
    }
}, 1000);

// Export socket function handler
module.exports = socketHandler;
