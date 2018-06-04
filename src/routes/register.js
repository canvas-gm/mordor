// Require Node.JS Dependencies
const { join } = require("path");

// Require third-party Dependencies
const { blue } = require("chalk");
const is = require("@sindresorhus/is");
const nodemailer = require("nodemailer");
const {
    isAlphanumeric,
    isEmail,
    isLength
} = require("validator");
const uuid = require("uuid/v4");
const Datastore = require("nedb-promises");
const argon2 = require("argon2");

// Globals
const RePassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,50}$/;
const dbDir = join(__dirname, "../../db");

/**
 * @func registerAccount
 * @desc register a new Account on Mordor
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @returns {void}
 */
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
    const hashedPassword = await argon2.hash(password);

    // Load database
    const db = Datastore.create(join(dbDir, "storage.db"));
    await db.load();
    const docs = (await db.find({ email })).filter(
        async(user) => await argon2.verify(user.password, hashedPassword)
    );
    if (docs.length > 0) {
        return res.json({ error: "Your email is already used!" });
    }

    // Insert user in DB
    const token = uuid();
    await db.insert({
        email,
        password: hashedPassword,
        token,
        active: true,
        registeredAt: new Date()
    });

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const account = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: "\"Thomas GENTILHOMME\" <gentilhomme.thomas@gmail.com>",
        to: email,
        subject: "CGM Mordor - Registration email",
        text: `Registration email, token: ${token}`,
        html: `<b>Registration email, token: ${token}</b>`
    });
    console.log(info);

    return res.json({ error: null });
}

// Export route
module.exports = {
    handler: registerAccount,
    method: "POST",
    uri: "/register"
};
