/**
 * @namespace utils
 * @desc Utils functions
 */

// Require Node.JS Dependencies
const { readdirSync } = require("fs");
const { extname, join } = require("path");

// Require Third-party Dependencies
const { red } = require("chalk");
const is = require("@sindresorhus/is");

/**
 * @exports utils/parseSocketMessages
 * @func parseSocketMessages
 * @desc Parse socket messages
 * @param {!String} msg complete message string or buffer
 * @returns {Mordor.SocketMessage[]}
 */
function parseSocketMessages(msg) {
    const ret = [];

    // Split the string by Return to line "\n"
    const lines = msg.split("\n");
    for (const line of lines) {
        // Continue if the line is empty!
        if (line.trim() === "") {
            continue;
        }

        try {
            /** @type {Mordor.SocketMessage} */
            const sockMessage = JSON.parse(line);
            if (!is.string(sockMessage.title)) {
                throw new TypeError("title field of socket message should be a string!");
            }
            ret.push({ title: sockMessage.title, body: sockMessage.body || {} });
        }
        catch (error) {
            console.error(red("Failed to parse the following socket message:"));
            console.error(red(error));
            continue;
        }
    }

    return ret;
}

/**
 * @exports utils/getSocketAddr
 * @func getSocketAddr
 * @desc Get the socket addr with ip:port
 * @param {*} socket Node.JS Socket
 * @returns {String}
 *
 * @throws {TypeError}
 */
function getSocketAddr(socket) {
    if (is.nullOrUndefined(socket)) {
        throw new TypeError("socket argument cannot be undefined or null!");
    }

    return `${socket.remoteAddress}:${socket.remotePort}`;
}

/**
 * @exports utils/getJavaScriptFiles
 * @func getJavaScriptFiles
 * @desc Get all javascript files name from a given directory path
 * @param {!String} directoryPath directory where files are
 * @returns {String[]}
 *
 * @throws {TypeError}
 */
function getJavaScriptFiles(directoryPath) {
    if (!is.string(directoryPath)) {
        throw new TypeError("dirname argument should be a string");
    }
    const ret = [];

    const files = readdirSync(directoryPath);
    for (const file of files) {
        if (extname(file) !== ".js") {
            continue;
        }
        ret.push(join(directoryPath, file));
    }

    return ret;
}

module.exports = {
    parseSocketMessages,
    getSocketAddr,
    getJavaScriptFiles
};
