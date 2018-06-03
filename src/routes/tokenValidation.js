// Require third-party Dependencies
const { blue } = require("chalk");

/**
 * @func validateAccountToken
 * @desc validate the registration token to active the user account!
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @returns {void}
 */
function validateAccountToken(req, res) {
    console.log(blue("HTTP tokenValidation URI has ben hit!"));
    res.end("ok");
}

// Export route
module.exports = {
    handler: validateAccountToken,
    method: "POST",
    uri: "/token/:token/:login"
};
