// Require Node.JS Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const polka = require("polka");
const serv = require("serve-static");
const bodyParser = require("body-parser");
const { blue, yellow, red, green } = require("chalk");
const is = require("@sindresorhus/is");

// Require Internal Dependencies
const { getJavaScriptFiles } = require("./utils");
const viewRenderer = require("./viewRenderer");

// Create view renderer!
const render = viewRenderer(join(__dirname, "../views"), {
    disableCache: true
});

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
 * Add a custom middleware function to respond HTML view
 */
httpServer.use(function view(req, res, next) {
    res.view = async function resView(viewName) {
        res.writeHead(200, { "Content-Type": "text/html" });

        return res.end(await render(viewName));
    };
    next();
});

/**
 * Load all HTTP Modules contained in the /routes directory
 */
const routes = getJavaScriptFiles(join(__dirname, "routes")).map(require);
for (const { method = "get", uri = "/", handler } of routes) {
    console.log(blue(`Loading HTTP Route :: (${green(method)}) ${yellow(uri)}`));
    httpServer[method.toLowerCase()](uri, async function httpHandler(req, res, next) {
        console.log(blue(
            `HTTP URI ${yellow(method)} - ${yellow(uri)} (Method: ${green(handler.name)}) has been requeted!`
        ));
        try {
            const ret = await handler(req, res, next);
            if (!is.nullOrUndefined(ret)) {
                res.json(ret);
            }
        }
        catch (error) {
            console.error(red(error.message));
            res.json({ error });
        }
    });
}

module.exports = httpServer;
