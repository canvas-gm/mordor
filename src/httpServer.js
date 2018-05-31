// Require Node.JS Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const polka = require("polka");
const serv = require("serve-static");

// Require Internal Dependencies
const viewRenderer = require("./viewRenderer");
const view = viewRenderer(join(__dirname, "../views"), {
    disableCache: true
});

// Create polka server
const httpServer = polka();

// Serve static assets into root /public directory!
httpServer.use(serv(join(__dirname, "../public")));

// Return .html view on root!
httpServer.get("/", async function root(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(await view("index.html"));
});

// Registration route!
httpServer.post("/register", async function register() {
    // TODO: Verify default entries
    // TODO: Verify SQLite DB for match or anything
    // TDOO: Email user
});

module.exports = httpServer;