// Require internal Dependencies
const socketMessageWrapper = require("./socketMessageWrapper");

// Require events name
const socketEventsName = require("./socketTitles.json");

// Create the events container
const socketEvents = new socketMessageWrapper();
socketEvents.on("error", console.error);

// Handle message(s) here!
function authentication(socket, { foo }) {
    console.log(`foo value => ${foo}`);
    socketEvents.send(socket, "yop", {foo: "xd"});
}

// Handle all events by name!
socketEvents.on(socketEventsName.authentication, authentication);

// Exports socketEvents...
module.exports = socketEvents;
