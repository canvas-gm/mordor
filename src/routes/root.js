// Require third-party Dependencies
const { blue } = require("chalk");

/**
 * @func root
 * @desc Return the website root with the index view
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @returns {void}
 */
function root(req, res) {
    console.log(blue("HTTP Root URI has ben hit!"));
    res.view("index.html");
}

// Export route
module.exports = {
    handler: root,
    method: "GET",
    uri: "/"
};
