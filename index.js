// Require Node.JS Dependencies
const { createServer } = require("net");

// Require Third-party Dependencies
const { blue } = require("chalk");
const is = require("@sindresorhus/is");

// Require internal Modules
const socketHandler = require("./src/socketHandler");

// Require Config
const config = require("./config/config.json");
let serverPort = process.env.port || config.port;
if (is.nullOrUndefined(serverPort)) {
    serverPort = 1337;
}

const socketServer = createServer(socketHandler);
socketServer.listen(serverPort);
socketServer.on("error", console.error);
socketServer.on("listening", () => {
    console.log(blue(`Socket server is listening on port ${serverPort}`));
});
