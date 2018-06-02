// Require third-party Dependencies
const { blue } = require("chalk");

// Route
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
