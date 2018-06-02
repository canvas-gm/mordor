require("make-promises-safe");

// Require Node.JS Dependencies
const {
    writeFile,
    readFile,
    access,
    constants: { R_OK }
} = require("fs");
const { createServer } = require("net");
const { join } = require("path");
const { promisify } = require("util");

// Require Third-party Dependencies
const { blue, yellow } = require("chalk");

// Require Internal Modules
const socketHandler = require("./src/socketHandler");
const httpServer = require("./src/httpServer");

// FS Async wrapper
const fsAsync = {
    writeFile: promisify(writeFile),
    readFile: promisify(readFile),
    access: promisify(access)
};

// CONSTANTS
const DEFAULTCONFIG = join(__dirname, "config/defaultconfig.json");
const CUSTOMCONFIG = join(__dirname, "config/customconfig.json");

/**
 * @async
 * @func initializeConfiguration
 * @desc initialize (or load) server configuration
 * @returns {Promise<Mordor.Configuration>}
 */
async function initializeConfiguration() {
    try {
        await fsAsync.access(DEFAULTCONFIG, R_OK);

        return require(CUSTOMCONFIG);
    }
    catch (error) {
        const config = require(DEFAULTCONFIG);
        await fsAsync.writeFile(CUSTOMCONFIG, JSON.stringify(config, null, 2));
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

    // Initialize Socket Server
    const socketServer = createServer(socketHandler);
    socketServer.listen(process.env.port || config.port);
    socketServer.on("error", console.error);
    socketServer.on("listening", () => {
        console.log(blue(`Socket server is listening on port ${yellow(config.port)}`));
    });

    // Initialize HTTP Server
    httpServer.listen(process.env.httpPort || config.httpPort).then(() => {
        console.log(blue(`HTTP server is listening on port ${yellow(config.httpPort)}`));
    });
}
main().catch(console.error);
