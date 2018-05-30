// Require Node.JS dependencies
const { readdirSync } = require("fs");
const { join, extname, basename } = require("path");

// Require internal Dependencies
const socketMessageWrapper = require("./socketMessageWrapper");

// Require Third-party Dependencies
const { red, green, blue } = require("chalk");

// Require events name
const socketEventsName = require("./socketTitles.json");

// Create the events container
const socketEvents = new socketMessageWrapper();
socketEvents.on("error", console.error);

// Require all .js file in the /events dir
const eventsDir = join(__dirname, "events");
const files = readdirSync(eventsDir);
for (const file of files) {
    // Skip if extension doesn't match .js
    const fileExt = extname(file);
    if (fileExt !== ".js") {
        continue;
    }

    try {
        const handler = require(join(eventsDir, file));
        const fileBaseName = basename(file, fileExt);
        let eventName = fileBaseName;

        if (Reflect.has(socketEventsName, fileBaseName)) {
            eventName = Reflect.get(socketEventsName, fileBaseName);
        }

        console.log(green(`Loading socket event :: ${eventName}`));
        socketEvents.on(eventName, (socket) => {
            console.log(blue(`Event ${eventName} triggered by socket ${socket.id}`));
        });
        socketEvents.on(eventName, handler.bind(socketEvents));
    }
    catch(error) {
        console.error(red(`Failed to load event file ${file}`));
        console.error(red(error));
    }
}

// Exports socketEvents...
module.exports = socketEvents;
