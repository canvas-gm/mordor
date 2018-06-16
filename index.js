// Require Node.JS Dependencies
const { createServer } = require("net");

// Require Third-party Dependencies
require("make-promises-safe");
const { blue, yellow } = require("chalk");
const program = require("commander");

// Require Internal Modules
const { handler: socketHandler } = require("./src/socketHandler");
const httpServer = require("./src/httpServer");

// Require config
const config = require("./config/editableSettings.json");

// Initialize commands
program.version("1.0.0")
    .option("--http", "Enable HTTP Server!")
    .option("--socket", "Enable Socket Server")
    .parse(process.argv);

// Retrieve command line args
const {
    http: enableHTTPServer = false,
    socket: enableSocketServer = false
} = program;

// Initialize Socket Server
if (enableSocketServer === true) {
    const socketPort = process.env.socketPort || config.socketPort;
    const socketServer = createServer(socketHandler);
    socketServer.listen(socketPort);
    socketServer.on("error", console.error);
    socketServer.on("listening", function socketListen() {
        console.log(blue(`Socket server is listening on port ${yellow(socketPort)}`));
    });
}

// Initialize HTTP Server
if (enableHTTPServer === true) {
    const httpPort = process.env.httpPort || config.httpPort;
    httpServer.listen(httpPort).then(function httpListen() {
        console.log(blue(`HTTP server is listening on port ${yellow(httpPort)}`));
    });
}
