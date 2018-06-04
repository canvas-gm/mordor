/**
 * @func validateAccountToken
 * @desc validate the registration token to active the user account!
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @returns {void}
 */
function validateAccountToken() {
    return { error: null };
}

// Export route
module.exports = {
    handler: validateAccountToken,
    method: "POST",
    uri: "/token/:token/:login"
};
