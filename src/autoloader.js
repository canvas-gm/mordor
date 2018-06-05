// Require Third-party Dependencies
const { yellow, blue } = require("chalk");

// Require Internal Dependencies
const { getJavaScriptFiles } = require("./utils");

/**
 * @function autoSocketLoaded
 * @desc Load all sockets handlers!
 * @param {*} SocketHandler SocketHandler
 * @param {!String} path Path to directory
 * @returns {void}
 */
function autoSocketLoaded(SocketHandler, path) {
    const socketHandlers = getJavaScriptFiles(path).map(require);
    for (const handler of socketHandlers) {
        console.log(blue(`Loading socket event :: ${yellow(handler.name)}`));
        const bindedHandler = handler.bind(SocketHandler);

        SocketHandler.on(handler.name, async function eventHandler(socket, ...args) {
            console.log(blue(`Event ${handler.name} triggered by socket ${socket.id}`));
            try {
                const ret = await bindedHandler(socket, ...args);
                if (ret.exit) {
                    return;
                }
                SocketHandler.send(socket, handler.name, ret || { error: null });
            }
            catch (error) {
                SocketHandler.send(socket, handler.name, { error });
            }
        });
    }
}

module.exports = autoSocketLoaded;
