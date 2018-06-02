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
 * @func initializeSQLiteDB
 * @desc initialize SQLite DB with default tables
 * @returns {Promise<void>}
 */
async function initializeSQLiteDB() {
    const dbDir = join(__dirname, "db");

    // Open DB
    const db = await sqlite.open(join(dbDir, "storage.sqlite"));

    // Load initialize Query and execute it
    const query = (
        await fsAsync.readFile(join(dbDir, "createdb.sql"))
    ).toString();
    await db.run(query);

    // Close DB and log successfull state!
    await db.close();
    console.log(green("SQLite database successfully created!"));
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

    // Initialize SQLiteDB
    await initializeSQLiteDB();

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
