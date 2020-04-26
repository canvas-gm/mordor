// Require Node.js Dependencies
const { constants: { R_OK }, promises: { writeFile, access } } = require("fs");
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

async function main() {
    try {
        const config = await initializeConfiguration();

        conn = await rethinkdb.connect(config.database);

        // Create the mordor database if she doesn't exist!
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
    }
    finally {
        if (conn) {
            await conn.close();
        }
    }
}
main().catch(console.error);
