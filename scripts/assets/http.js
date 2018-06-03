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
const assetsDir = join(__dirname, "../../src/routes");

// WriteFile promisified
const asyncWriteFile = promisify(writeFile);

/**
 * @func httpAsset
 * @desc Asset generation for http
 * @returns {void}
 */
async function httpAsset() {
    const { functionName, functionDescription, httpMethod, httpURI } = await inquirer.prompt([
        {
            type: "input",
            name: "functionName",
            message: "JavaScript Function name ?",
            filter(input) {
                return new Promise((resolve, reject) => {
                    if (/^[a-zA-Z]+$/.test(input)) {
                        return resolve(input);
                    }

                    return reject(new Error("Please enter a valid camelCase function name!"));
                });
            },
            default: "routeHandler"
        },
        {
            type: "input",
            name: "functionDescription",
            message: "Route description ?",
            default: ""
        },
        {
            type: "list",
            name: "httpMethod",
            message: "HTTP Method ?",
            choices: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            default: "GET"
        },
        {
            type: "input",
            name: "httpURI",
            message: "HTTP URI ?",
            default: "/"
        }
    ]);

    const content = `// Require Third-party Dependencies
const { blue } = require("chalk");

/**
 * @func ${functionName}
 * @desc ${functionDescription}
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @returns {void}
 */
function ${functionName}(req, res) {
    console.log(blue("HTTP ${httpURI} URI has ben hit!"));
    res.json({ error: null });
}

// Export route
module.exports = {
    handler: ${functionName},
    method: "${httpMethod}",
    uri: "${httpURI}"
};
`;
    const finalPath = join(assetsDir, `${functionName}.js`);
    await asyncWriteFile(finalPath, content);
    console.log("");
    console.log(`Final file generated at: ${green(finalPath)}`);
}

module.exports = {
    name: "http",
    handler: httpAsset
};
