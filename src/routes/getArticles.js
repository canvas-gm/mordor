// Require third-party Dependencies
const { blue } = require("chalk");

// Require Articles
const Articles = require("../../data/articles.json");

/**
 * @func getArticles
 * @desc Return the complete list of articles
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @returns {void}
 */
function getArticles(req, res) {
    console.log(blue("HTTP articles URI has ben hit!"));
    res.json(Articles);
}

// Export route
module.exports = {
    handler: getArticles,
    method: "GET",
    uri: "/articles"
};
