// Require Node.JS Dependencies
const { readFileSync } = require("fs");
const { join } = require("path");

// Require Third-party Dependencies
const avaTest = require("ava");
const is = require("@sindresorhus/is");

// Require Internal Dependencies
const viewRenderer = require("../src/viewRenderer");

// String value of view.html
const viewStr = readFileSync(join(__dirname, "view.html")).toString();

avaTest("dir argument throw TypeError", (test) => {
    const error = test.throws(() => {
        viewRenderer(5);
    }, TypeError);
    test.is(error.message, "dir argument should be typeof string");
});

avaTest("disableCache options is not a boolean ", (test) => {
    const error = test.throws(() => {
        viewRenderer(__dirname, {
            disableCache: "true"
        });
    }, TypeError);
    test.is(error.message, "options.disableCache should be typeof boolean");
});

avaTest("viewRenderer return a AsyncFunction", (test) => {
    const render = viewRenderer(__dirname);
    test.is(is.asyncFunction(render), true);
});

avaTest("load view with cache", async(test) => {
    const render = viewRenderer(__dirname, {
        disableCache: false
    });
    test.is(await render("view"), viewStr);
    test.is(await render("view.html"), viewStr);
});

avaTest("load view without cache", async(test) => {
    const render = viewRenderer(__dirname, {
        disableCache: true
    });
    test.is(await render("view"), viewStr);
    test.is(await render("view.html"), viewStr);
});

avaTest("load view from an unknow directory", async(test) => {
    const render = viewRenderer(join(__dirname, "unknow"));
    const error = await test.throws(async() => {
        await render("view");
    }, Error);
    test.is(error.code, "ENOENT");
});
