// Require Articles
const Articles = require("../../data/articles.json");

/**
 * @func getArticles
 * @desc Return the complete list of articles
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @returns {Object}
 */
function getArticles() {
    return Articles;
}

// Export route
module.exports = {
    handler: getArticles,
    method: "GET",
    uri: "/articles"
};
