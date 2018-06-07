// Require Node.JS Dependencies
const { createServer } = require("net");

// Require Third-party Dependencies
const avaTest = require("ava");

// Require Internal Dependencies
const socketHandler = require("../src/socketHandler");

// Test variable(s)
let socketServer = null;

// Run Socket Server before all tests!
avaTest.before(async(test) => {
    // Initialize self
    await new Promise((resolve, reject) => {
        socketServer = createServer(socketHandler);
        socketServer.listen(1338);
        socketServer.once("error", reject);
        socketServer.on("listening", function socketListen() {
            console.log("Socket server is listening on port 1338");
            resolve();
        });
    });
    socketServer.removeAllListeners("error");
    socketServer.on("error", console.error);

    // Initialize client!
    test.pass();
});
