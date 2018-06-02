// Require Node.JS dependencies
const { readdirSync } = require("fs");
const { join, extname, basename } = require("path");

// Require Third-party Dependencies
const is = require("@sindresorhus/is");
const { red, green, blue } = require("chalk");

/**
 * @const socketMessageWrapper
 * @type {Mordor.socketMessageWrapper}
 */
const socketMessageWrapper = require("./class/socketMessageWrapper.js");

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
        socketEvents.on(fileBaseName, (socket) => {
            console.log(blue(`Event ${fileBaseName} triggered by socket ${socket.id}`));
        });
        socketEvents.on(fileBaseName, handler.bind(socketEvents));
    }
    catch (error) {
        console.error(red(`Failed to load event file ${file}`));
        console.error(red(error));
    }
}

// Exports socketEvents...
module.exports = socketEvents;
