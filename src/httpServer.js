// Require Node.JS Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const polka = require("polka");
const serv = require("serve-static");
const bodyParser = require("body-parser");
const { blue } = require("chalk");
const is = require("@sindresorhus/is");
const argon = require("argon2");
const {
    isAlphanumeric,
    isEmail,
    isLength
} = require("validator");

const RePassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,50}$/;

// Require Internal Dependencies
const viewRenderer = require("./viewRenderer");

// Create view renderer!
const view = viewRenderer(join(__dirname, "../views"), {
    disableCache: true
});

// Create polka server
const httpServer = polka();

// Serve static assets into root /public directory!
httpServer.use(serv(join(__dirname, "../public")));
httpServer.use(bodyParser.json());

// Add json method to response!
httpServer.use(function json(req, res, next) {
    res.json = function resJson(payload) {
        res.writeHead(200, { "Content-Type": "application/json" });

        return res.end(JSON.stringify(payload));
    };
    next();
});

// Return .html view on root!
httpServer.get("/", async function root(req, res) {
    console.log(blue("HTTP Root URI has ben hit!"));
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(await view("index.html"));
});

// Validate email token!
httpServer.get("/token/:token/:login", function login(req, res) {
    res.end("ok");
});

// Registration route!
httpServer.post("/register", async function register(req, res) {
    console.log(blue("HTTP Register URI has been hit!"));
    console.log(req.body);

    // Assign top variables
    if (is.nullOrUndefined(req.body)) {
        return res.json({ error: "Form body not defined in the request!" });
    }
    const { nom = "", email = "", password, password2 } = req.body;
    let error;

    // Check and sanatize form data!
    formCheck: {
        // Check for undefined or null fields
        if ([nom, email, password].every((field) => is.nullOrUndefined(field) === true)) {
            error = "One field has been detected as null or undefined!";
            break formCheck;
        }

        if (!isAlphanumeric(nom) || !isLength(nom, { min: 2, max: 50 })) {
            error = "The field nom should be Alphanumeric and contain between 2 and 50 characters!";
            break formCheck;
        }

        // Check email
        if (!isEmail(email)) {
            error = "The email entered doesn't have a valid format!";
            break formCheck;
        }

        // Check password match
        if (!RePassword.test(password)) {
            error = "Invalid password format";
            break formCheck;
        }

        // Check password match
        if (password !== password2) {
            error = "Password are not identical!";
            break formCheck;
        }

    }

    // If there are errors...
    if (!is.nullOrUndefined(error)) {
        return res.json({ error });
    }

    const hashedPassword = await argon.hash(password);
    console.log(hashedPassword);
    // TODO: Check SQLite DB
    // TODO: Send Email

    return res.json({ error: null });
});

module.exports = httpServer;
