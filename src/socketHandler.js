// Require Third-party Dependencies
const { green, yellow, red } = require("chalk");
const is = require("@sindresorhus/is");
const uuid = require("uuid/v4");

// Require Internal Dependencies
/** @type {SocketMessageWrapper} */
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
 * @const PONG_TIMEOUT
 * @desc Ping/Pong TIMEOUT
 * @type {Number}
 */
const PONG_TIMEOUT = 5000;

/**
 * Close every sockets properly on critical error(s)
 */
process.once("SIGINT", socketEvents.disconnectAllSockets.bind(socketEvents));
process.once("exit", socketEvents.disconnectAllSockets.bind(socketEvents));

/**
 * @func socketHandler
 * @desc Main socket handler!
 * @param {Mordor.Socket} socket Node.JS Socket
 * @returns {void}
 */
function socketHandler(socket) {
    socketEvents.currConnectedSockets.add(socket);

    /**
     * @func isAuthenticated
     * @desc Verify if the socket client is authenticated!
     * @returns {boolean}
     */
    function isAuthenticated() {
        /** @type {RemoteClient} */
        const remoteClient = Reflect.get(socket, "session");
        if (is.nullOrUndefined(remoteClient)) {
            return false;
        }
        if (!remoteClient.isUpToDate()) {
            socketEvents.removeSocket(socket);
        }

        return true;
    }

    // Set new parameters on curr socket
    Reflect.set(socket, "id", uuid());
    Reflect.set(socket, "requestCount", 0);
    Reflect.set(socket, "isAuthenticated", isAuthenticated);
    Reflect.set(socket, "pongDt", new Date().getTime());
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

        // Parse and send message to the event container (wrapper).
        const messages = parseSocketMessages(msg.toString());

        // Disconnect remote socket if max requests (messages) has been reach!
        socket.requestCount += messages.length;
        if (socket.requestCount >= MAX_REQUESTS_PER_SECOND) {
            console.error(red(`Threshold of the maximum allowed requests has been hit by socket id: ${socket.id}`));
            socket.destroy();

            return;
        }

        // Handle messages
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

/**
 * Ping all remote sockets to be sure they are alive.
 */
setInterval(function pingRemoteSocket() {
    const startDatePing = new Date().getTime();
    for (const socket of socketEvents.currConnectedSockets) {
        socketEvents.send(socket, "ping", {
            dt: startDatePing
        });
    }

    setTimeout(function checkPong() {
        for (const socket of socketEvents.currConnectedSockets) {
            if (socket.pongDt !== startDatePing) {
                console.log(red(`Ping/pong timeout for socket with id ${yellow(socket.id)}`));
                socket.destroy();
            }
        }
    }, PONG_TIMEOUT);
}, 60000);

// Export socket function handler
module.exports = socketHandler;
