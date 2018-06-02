// Require third-party Dependencies
const { blue } = require("chalk");

// Require Articles
const Articles = require("../../data/articles.json");

// Handler
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
