// Require Node.JS Dependencies
const { join } = require("path");

// Require third-party Dependencies
const { blue } = require("chalk");
const is = require("@sindresorhus/is");
const argon = require("argon2");
const {
    isAlphanumeric,
    isEmail,
    isLength
} = require("validator");
const sqlite = require("sqlite");
const uuid = require("uuid/v4");

// Globals
const RePassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,50}$/;
const dbDir = join(__dirname, "../../db");

// Route
async function registerAccount(req, res) {
    console.log(blue("HTTP Register URI has been hit!"));

    // Assign top variables
    if (is.nullOrUndefined(req.body)) {
        return res.json({ error: "Form body not defined in the request!" });
    }
    const { login = "", email = "", password, password2 } = req.body;
    let error;

    // Check and sanatize form data!
    formCheck: {
        // Check for undefined or null fields
        if ([login, email, password].every((field) => is.nullOrUndefined(field) === true)) {
            error = "One field has been detected as null or undefined!";
            break formCheck;
        }

        if (!isAlphanumeric(login) || !isLength(login, { min: 2, max: 50 })) {
            error = "The field login should be Alphanumeric and contain between 2 and 50 characters!";
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
        console.error("An error has been detected!");

        return res.json({ error });
    }

    // Hash the password!
    const hashedPassword = await argon.hash(password);

    // Open SQLite database
    const db = await sqlite.open(join(dbDir, "storage.sqlite"), {
        verbose: true,
        promise: Promise
    });
    console.log("successfully connected to the local db");

    try {
        const matchedUserAccount = await db.all(
            "SELECT * FROM users WHERE email = $email and password = $password",
            {
                $email: email,
                $password: hashedPassword
            }
        );
        console.log(matchedUserAccount);
        if (!is.nullOrUndefined(matchedUserAccount) && matchedUserAccount.length > 0) {
            return res.json({
                error: "Your email is already used for an another account!"
            });
        }

        // Create entry with the token (for email validation).
        const token = uuid();
        console.log(`token: ${token}`);
        const stmt = await db.run(
            "INSERT INTO users (login, email, password, token) VALUES (?, ?, ?, ?)",
            [login, email, hashedPassword, token]
        );
        if (stmt.changes !== 1) {
            throw new Error("Failed to insert new user!");
        }
        await db.close();

        // TODO: Send Email
        return res.json({ error: null });
    }
    catch (error) {
        console.error(error);

        return res.json({ error });
    }
}

// Export route
module.exports = {
    handler: registerAccount,
    method: "POST",
    uri: "/register"
};
