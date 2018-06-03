// Require Node.JS Dependencies
const { join } = require("path");
const { writeFile } = require("fs");
const { promisify } = require("util");

// Require Third-party Dependencies
const inquirer = require("inquirer");
const { green } = require("chalk");

/**
 * @const assetsDir
 * @desc Assets directory
 * @type {String}
 */
const assetsDir = join(__dirname, "../../src/sockets");

// WriteFile promisified
const asyncWriteFile = promisify(writeFile);

/**
 * @func socketAsset
 * @desc Asset generation for http
 * @returns {void}
 */
async function socketAsset() {
    const { functionName, commandDescription } = await inquirer.prompt([
        {
            type: "input",
            name: "functionName",
            message: "Socket command Function name ?",
            filter(input) {
                return new Promise((resolve, reject) => {
                    if (/^[a-zA-Z]+$/.test(input)) {
                        return resolve(input);
                    }

                    return reject(new Error("Please enter a valid camelCase function name!"));
                });
            }
        },
        {
            type: "input",
            name: "commandDescription",
            message: "Socket command description ?",
            default: ""
        }
    ]);

    const content = `/**
* @func ${functionName}
* @desc ${commandDescription}
* @param {net.Socket} socket Node.JS Socket
* @returns {void}
*/
function ${functionName}(socket) {
    return { error: null };
}

module.exports = ${functionName};`;
    const finalPath = join(assetsDir, `${functionName}.js`);
    await asyncWriteFile(finalPath, content);
    console.log("");
    console.log(`Final file generated at: ${green(finalPath)}`);
}

module.exports = {
    name: "socket",
    handler: socketAsset
};
