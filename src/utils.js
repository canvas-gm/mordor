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
 * @returns {Object[]}
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
            const data = JSON.parse(line);
            if (!is.string(data.title)) {
                throw new TypeError("title field of socket message should be a string!");
            }
            ret.push({ title: data.title, body: data.body || {} });
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
 * @param {!String} dirname directory where files are
 * @returns {String[]}
 */
function getJavaScriptFiles(dirname) {
    if (!is.string(dirname)) {
        throw new TypeError("dirname argument should be a string");
    }
    const ret = [];

    const files = readdirSync(dirname);
    for (const file of files) {
        if (extname(file) !== ".js") {
            continue;
        }
        ret.push(join(dirname, file));
    }

    return ret;
}

module.exports = {
    parseSocketMessages,
    getSocketAddr,
    getJavaScriptFiles
};
