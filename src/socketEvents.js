// Require Node.JS dependencies
const { readdirSync } = require("fs");
const { join, extname, basename } = require("path");

// Require Third-party Dependencies
const is = require("@sindresorhus/is");
const { red, green, blue } = require("chalk");

/**
 * @const socketMessageWrapper
 * @type {SocketMessageWrapper}
 */
const socketMessageWrapper = require("./class/socketMessageWrapper");

// Create the events container
const socketEvents = new socketMessageWrapper();
socketEvents.on("error", console.error);

// Require all .js file in the /events dir
const eventsDir = join(__dirname, "sockets");
const files = readdirSync(eventsDir);
for (const file of files) {
    // Skip if extension doesn't match .js
    const fileExt = extname(file);
    if (fileExt !== ".js") {
        continue;
    }

    try {
        const handler = require(join(eventsDir, file));
        if (is.nullOrUndefined(handler)) {
            throw new Error(`Undefined script export for file ${file}`);
        }
        const fileBaseName = basename(file, fileExt);

        console.log(green(`Loading socket event :: ${fileBaseName}`));
        /** @type {(socket, options) => any} */
        const eventBindedHandler = handler.bind(socketEvents);

        socketEvents.on(fileBaseName, async function eventHandler(socket) {
            console.log(blue(`Event ${fileBaseName} triggered by socket ${socket.id}`));
            try {
                let ret = await eventBindedHandler();
                if (is.nullOrUndefined(ret)) {
                    ret = { error: null };
                }
                else {
                    Reflect.set(ret, "error", null);
                }
                socketEvents.send(socket, fileBaseName, ret);
            }
            catch (error) {
                socketEvents.send(socket, fileBaseName, { error });
            }
        });
    }
    catch (error) {
        console.error(red(`Failed to load event file ${file}`));
        console.error(red(error));
    }
}

// Exports socketEvents...
module.exports = socketEvents;
