// Require Node.JS Dependencies
const { join } = require("path");

// Require third-party Dependencies
const { blue } = require("chalk");

// Require Internal Dependencies
const viewRenderer = require("../viewRenderer");

// Create view renderer!
const view = viewRenderer(join(__dirname, "../../views"), {
    disableCache: true
});

// Handler
async function root(req, res) {
    console.log(blue("HTTP Root URI has ben hit!"));
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(await view("index.html"));
}

// Export route
module.exports = {
    handler: root,
    method: "GET",
    uri: "/"
};
