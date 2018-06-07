// Require Node.JS Dependencies
const { readFileSync } = require("fs");
const { join } = require("path");

// Require Third-party Dependencies
const avaTest = require("ava");
const is = require("@sindresorhus/is");

// Require Internal Dependencies
const viewRenderer = require("../src/viewRenderer");

// String value of view.html
const viewDir = join(__dirname, "views");
const viewStr = readFileSync(join(viewDir, "test.html")).toString();

avaTest("dir argument throw TypeError", (test) => {
    const error = test.throws(() => {
        viewRenderer(5);
    }, TypeError);
    test.is(error.message, "dir argument should be typeof string");
});

avaTest("disableCache options is not a boolean ", (test) => {
    const error = test.throws(() => {
        viewRenderer(viewDir, {
            disableCache: "true"
        });
    }, TypeError);
    test.is(error.message, "options.disableCache should be typeof boolean");
});

avaTest("viewRenderer return a AsyncFunction", (test) => {
    const render = viewRenderer(viewDir);
    test.is(is.asyncFunction(render), true);
});

avaTest("load view with cache", async(test) => {
    const render = viewRenderer(viewDir, {
        disableCache: false
    });
    test.is(await render("test"), viewStr);
    test.is(await render("test.html"), viewStr);
});

avaTest("load view without cache", async(test) => {
    const render = viewRenderer(viewDir, {
        disableCache: true
    });
    test.is(await render("test"), viewStr);
    test.is(await render("test.html"), viewStr);
});

avaTest("load view from an unknow directory", async(test) => {
    const render = viewRenderer(join(viewDir, "unknow"));
    const error = await test.throws(async() => {
        await render("test");
    }, Error);
    test.is(error.code, "ENOENT");
});
