// Require Node.JS Dependencies
const { join, extname } = require("path");

// Require Third-party Dependencies
const avaTest = require("ava");
const is = require("@sindresorhus/is");

// Require Internal Dependencies
const utils = require("../src/utils");

avaTest("parseSocketMessages with empty string", (test) => {
    const ret = utils.parseSocketMessages("");
    test.deepEqual(ret, []);
});

avaTest("parseSocketMessages parse one message", (test) => {
    const message = {
        title: "yo",
        body: { foo: "bar" }
    };
    const ret = utils.parseSocketMessages(JSON.stringify(message));
    test.deepEqual(ret, [message]);
});

avaTest("parseSocketMessages parse multiple messages", (test) => {
    const message1 = {
        title: "yo",
        body: { foo: "bar" }
    };
    const message2 = {
        title: "xd"
    };
    const ret = utils.parseSocketMessages(
        `${JSON.stringify(message1)}\n${JSON.stringify(message2)}`
    );
    test.deepEqual(ret, [message1, { title: "xd", body: {} }]);
});

avaTest("parseSocketMessages parse invalid message", (test) => {
    const ret = utils.parseSocketMessages("hello world!");
    test.deepEqual(ret, []);
});

avaTest("parseSocketMessages parse invalid message with one right message", (test) => {
    const message = {
        title: "yo",
        body: { foo: "bar" }
    };
    const ret = utils.parseSocketMessages(`hello world!\n${JSON.stringify(message)}`);
    test.deepEqual(ret, [message]);
});

avaTest("parseSocketMessages parse message with no title", (test) => {
    const message = {
        body: { foo: "bar" }
    };
    const ret = utils.parseSocketMessages(JSON.stringify(message));
    test.deepEqual(ret, []);
});

avaTest("parseSocketMessages empty chariot", (test) => {
    const ret = utils.parseSocketMessages("\n\n");
    test.deepEqual(ret, []);
});

avaTest("getSocketAddr throw on undefined socket", (test) => {
    const error = test.throws(() => {
        utils.getSocketAddr(undefined);
    }, TypeError);
    test.is(error.message, "socket argument cannot be undefined or null!");
});

avaTest("getSocketAddr return concated string remoteAddress:remotePort", (test) => {
    const str = utils.getSocketAddr({
        remoteAddress: "127.0.0.1",
        remotePort: "1337"
    });
    test.is(str, "127.0.0.1:1337");
});

avaTest("getJavaScriptFiles check directoryPath type", (test) => {
    const error = test.throws(() => {
        utils.getJavaScriptFiles(undefined);
    }, TypeError);
    test.is(error.message, "dirname argument should be a string");
});

avaTest("getJavaScriptFiles unknow directory", (test) => {
    const error = test.throws(() => {
        utils.getJavaScriptFiles(join(__dirname, "unknow"));
    }, Error);
    test.is(error.code, "ENOENT");
});

avaTest("getJavaScriptFiles return /src (js) files", (test) => {
    const files = utils.getJavaScriptFiles(join(__dirname, "../src"));
    test.is(is.array(files), true);
    test.is(files.every((file) => extname(file) === ".js"), true);
});
