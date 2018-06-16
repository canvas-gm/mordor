// Require Node.JS Dependencies
const {
    writeFile,
    access
} = require("fs").promises;
const { constants: { R_OK } } = require("fs");
const { createServer } = require("net");
const { join } = require("path");

// Require Third-party Dependencies
require("make-promises-safe");
const { blue, yellow } = require("chalk");
const program = require("commander");

// Require Internal Modules
const { handler: socketHandler } = require("./src/socketHandler");
const httpServer = require("./src/httpServer");

// Initialize commands
program.version("1.0.0")
    .option("--http", "Enable HTTP Server!")
    .option("--socket", "Enable Socket Server")
    .parse(process.argv);

// CONSTANTS
const DEFAULTCONFIG = join(__dirname, "config/defaultSettings.json");
const CUSTOMCONFIG = join(__dirname, "config/editableSettings.json");

/**
 * @async
 * @func initializeConfiguration
 * @desc initialize (or load) server configuration
 * @returns {Promise<Mordor.Configuration>}
 */
async function initializeConfiguration() {
    try {
        await access(DEFAULTCONFIG, R_OK);

        return require(CUSTOMCONFIG);
    }
    catch (error) {
        const config = require(DEFAULTCONFIG);
        await writeFile(CUSTOMCONFIG, JSON.stringify(config, null, 2));
        console.log("New custom-config properly created in /config directory!");

        return process.exit(0);
    }
}

/**
 * @async
 * @func main
 * @desc Main handler
 * @returns {Promise<void>}
 */
async function main() {
    // Load server configuration
    const config = await initializeConfiguration();

    // Retrieve command line args
    const { http = false, socket = false } = program;

    // Initialize Socket Server
    if (socket === true) {
        const socketServer = createServer(socketHandler);
        socketServer.listen(process.env.port || config.port);
        socketServer.on("error", console.error);
        socketServer.on("listening", function socketListen() {
            console.log(blue(`Socket server is listening on port ${yellow(config.port)}`));
        });
    }

    // Initialize HTTP Server
    if (http === true) {
        httpServer.listen(process.env.httpPort || config.httpPort).then(function httpListen() {
            console.log(blue(`HTTP server is listening on port ${yellow(config.httpPort)}`));
        });
    }
}
main().catch(console.error);
