// Require Node.JS Dependencies
const {
    writeFile,
    access
} = require("fs").promises;
const { constants: { R_OK } } = require("fs");
const { join } = require("path");

// Require Third-party Dependencies!
const rethinkdb = require("rethinkdb");

// CONSTANTS
const DEFAULTCONFIG = join(__dirname, "../config/defaultSettings.json");
const CUSTOMCONFIG = join(__dirname, "../config/editableSettings.json");

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

        return config;
    }
}

/** @type {rethinkdb.Connection} */
let conn;

/**
 * @async
 * @function build
 * @desc Build main entry
 * @returns {Promise<void>}
 */
async function build() {
    // Initialize configuration
    const config = await initializeConfiguration();

    // Connect to RethinkDB
    conn = await rethinkdb.connect(config.database);

    // Create mordor database if not exist!
    const currDBList = new Set(await rethinkdb.dbList().run(conn));
    if (!currDBList.has("mordor")) {
        const { dbs_created: dbCreated } = await rethinkdb.dbCreate("mordor").run(conn);
        if (dbCreated !== 1) {
            throw new Error("Failed to create Mordor database!");
        }
    }

    // Create require table(s) on mordor DB
    const currTablesList = new Set(await rethinkdb.db("mordor").tableList().run(conn));
    await Promise.all(
        ["users"]
            .filter((tableName) => !currTablesList.has(tableName))
            .map((tableName) => rethinkdb.db("mordor").tableCreate(tableName).run(conn))
    );

    // Close DB connection
    await conn.close();
}
build().catch((err) => {
    console.error(err);
    if (conn) {
        conn.close();
    }
});
