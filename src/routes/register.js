// Require Third-party Dependencies
const is = require("@sindresorhus/is");
const nodemailer = require("nodemailer");
const uuid = require("uuid/v4");
const argon2 = require("argon2");
const rethinkdb = require("rethinkdb");
const {
    isAlphanumeric,
    isEmail,
    isLength
} = require("validator");

// Require config
const config = require("../../config/editableSettings.json");

/**
 * @const PasswordExpr
 * @type {RegExp}
 *
 * (?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character
 * (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character
 * (?=.*[0-9])	The string must contain at least 1 numeric character
 * (?=.[!@#$%^&]) The string must contain at least one special character
 * (?=.{8,})	The string must be eight characters or longer
 */
const PasswordExpr = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

// RethinkDB users table
const usersTable = rethinkdb.db("mordor").table("users");

/**
 * @func validateBodyData
 * @desc Validate the body of /register
 * @param {Object=} body body object
 * @returns {void}
 */
function validateBodyData({ login, email, password, password2 }) {
    if ([login, email, password].every((field) => is.nullOrUndefined(field) === true)) {
        throw new Error("One field has been detected as null or undefined!");
    }
    else if (!isAlphanumeric(login) || !isLength(login, { min: 2, max: 50 })) {
        throw new Error(
            "The field login should be Alphanumeric and contain between 2 and 50 characters!"
        );
    }
    else if (!isEmail(email)) {
        throw new Error("The email entered doesn't have a valid format!");
    }
    else if (!PasswordExpr.test(password)) {
        throw new Error("Invalid password format");
    }
    else if (password !== password2) {
        throw new Error("Password are not identical!");
    }

    return { email, password, login };
}

/**
 * @async
 * @func sendValidationEmail
 * @desc Send an email to validate (and active) the user account !
 * @param {!String} email Destination email
 * @param {!String} token Token used to validate account
 * @returns {Promise<void>}
 */
async function sendValidationEmail(email, token) {
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
    await transporter.sendMail({
        from: "\"Thomas GENTILHOMME\" <gentilhomme.thomas@gmail.com>",
        to: email,
        subject: "CGM Mordor - Registration email",
        text: `Registration email, token: ${token}`,
        html: `<b>Registration email, token: ${token}</b>`
    });
}

/**
 * @func registerAccount
 * @desc register a new Account on Mordor
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @returns {void}
 */
async function registerAccount(req) {
    const { login, email, password } = validateBodyData(req.body);

    // Hash the password!
    const hashedPassword = await argon2.hash(password);

    // Load database
    const conn = await rethinkdb.connect(config.database);
    const token = uuid();

    try {
        // Try to match user in our database
        const cursor = await usersTable.filter({ email }).run(conn);
        const docs = (await cursor.toArray()).filter(
            async(user) => await argon2.verify(user.password, hashedPassword)
        );
        if (docs.length > 0) {
            throw new Error("Your email is already used!");
        }

        // Insert the user in the database
        await usersTable.insert({
            login,
            email,
            password: hashedPassword,
            token,
            active: true,
            registeredAt: new Date()
        }).run(conn);

        // Close Connection!
        await conn.close();
    }
    catch (err) {
        await conn.close();
        throw err;
    }

    // Send validation email
    await sendValidationEmail(email, token);

    // Return no error
    return { error: null };
}

// Export route
module.exports = {
    handler: registerAccount,
    method: "POST",
    uri: "/register"
};
