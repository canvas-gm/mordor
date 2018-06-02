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
const { blue, green, yellow } = require("chalk");
const sqlite = require("sqlite");

// Require internal Modules
const socketHandler = require("./src/socketHandler");
const httpServer = require("./src/httpServer");

// FS Async wrapper
const fsAsync = {
    writeFile: promisify(writeFile),
    readFile: promisify(readFile),
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
        process.exit(0);
    }

    // Create DB (if not exist)
    {
        const dbDir = join(__dirname, "db");
        const db = await sqlite.open(join(dbDir, "storage.sqlite"));
        const query = (
            await fsAsync.readFile(join(dbDir, "createdb.sql"))
        ).toString();

        await db.run(query);
        await db.close();
        console.log(green("SQLite database successfully created!"));
    }

    // Declare socket server!
    const socketServer = createServer(socketHandler);
    socketServer.listen(process.env.port || config.port);
    socketServer.on("error", console.error);
    socketServer.on("listening", () => {
        console.log(blue(`Socket server is listening on port ${yellow(config.port)}`));
    });

    // Let the http server listen the right port
    httpServer.listen(process.env.httpPort || config.httpPort).then(() => {
        console.log(blue(`HTTP server is listening on port ${yellow(config.httpPort)}`));
    });
}
main().catch(console.error);
