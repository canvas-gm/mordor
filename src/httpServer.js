// Require Node.JS Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const polka = require("polka");
const serv = require("serve-static");
const bodyParser = require("body-parser");
const { blue, yellow } = require("chalk");

// Require Internal Dependencies
const { getJavaScriptFiles } = require("./utils");

// Create polka (HTTP) server
const httpServer = polka();

// Serve static assets into root /public directory!
httpServer.use(serv(join(__dirname, "../public")));

// Parse HTTP form JSON body
httpServer.use(bodyParser.json());

/**
 * Add a custom middleware function to response JSON body
 */
httpServer.use(function json(req, res, next) {
    res.json = function resJson(payload) {
        res.writeHead(200, { "Content-Type": "application/json" });

        return res.end(JSON.stringify(payload));
    };
    next();
});

/**
 * Load all HTTP Modules contained in the /routes directory
 */
const routes = getJavaScriptFiles(join(__dirname, "routes")).map(require);
for (const { method = "get", uri = "/", handler } of routes) {
    console.log(blue(`Loading HTTP Route :: (${yellow(method)}) ${uri}`));
    httpServer[method.toLowerCase()](uri, handler);
}

module.exports = httpServer;
