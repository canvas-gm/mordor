// Require Node.JS Dependencies
const {
    writeFile,
    access,
    constants: { R_OK }
} = require("fs");
const { createServer } = require("net");
const { promisify } = require("util");

// Require Third-party Dependencies
const { blue } = require("chalk");

// Require internal Modules
const socketHandler = require("./src/socketHandler");
const httpServer = require("./src/httpServer");

// FS Async wrapper
const fsAsync = {
    writeFile: promisify(writeFile),
    access: promisify(access)
};

/**
 * @func main
 * @desc Main handler
 * @returns {Promise<void>}
 */
async function main() {
    // Require userconfig (or default config).
    let config;
    try {
        await fsAsync.access("./config/defaultconfig.json", R_OK);
        config = require("./config/customconfig.json");
    }
    catch (error) {
        config = require("./config/defaultconfig.json");
        await fsAsync.writeFile(
            "./config/customconfig.json",
            JSON.stringify(config, null, 2)
        );
        console.log("New custom-config properly created in /config directory!");
    }

    // Declare socket server!
    const socketServer = createServer(socketHandler);
    socketServer.listen(process.env.port || config.port);
    socketServer.on("error", console.error);
    socketServer.on("listening", () => {
        console.log(blue(`Socket server is listening on port ${config.port}`));
    });

    // Let the http server listen the right port
    httpServer.listen(process.env.httpPort || config.httpPort).then(() => {
        console.log(blue(`HTTP server is listening on port ${config.httpPort}`));
    });
}
main().catch(console.error);
