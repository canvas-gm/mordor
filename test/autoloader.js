// Require Node.JS Dependencies
const { join } = require("path");
const events = require("events");

// Require Third-party Dependencies
const avaTest = require("ava");

// Require Internal Dependencies
const autoLoader = require(join(__dirname, "../src/autoloader.js"));

/* eslint-disable class-methods-use-this */
/**
 * @private
 * @class eventsWrapper
 * @extends events
 */
class eventsWrapper extends events {
    /**
     * @private
     * @method eventsWrapper
     * @param {*} socket *
     * @param {*} title *
     * @param {*} body *
     * @returns {void}
     */
    send(socket, title, body) {
        socket.emit(title, body);
    }
}

avaTest("autoLoad", async(test) => {
    const wrapper = new eventsWrapper();
    const fakeSocket = new eventsWrapper();
    const loaded = autoLoader(wrapper, join(__dirname, "autoload"));
    test.is(loaded, 4);

    // Test A
    await new Promise((resolve, reject) => {
        let timeOut = null;
        let doneEmitted = false;

        fakeSocket.on("done", () => {
            doneEmitted = true;
        });

        fakeSocket.on("testA", ({ error }) => {
            if (error) {
                return reject(error);
            }
            if (!doneEmitted) {
                return reject(new Error("done not emitted!"));
            }
            clearTimeout(timeOut);

            return resolve();
        });

        wrapper.emit("testA", fakeSocket);
        timeOut = setTimeout(() => reject(new Error("Timeout")), 50);
    });

    // Test B
    await new Promise((resolve, reject) => {
        let timeOut = null;

        fakeSocket.on("testB", ({ error }) => {
            if (!error) {
                return reject(new Error("No error throwed in testB"));
            }
            clearTimeout(timeOut);

            return resolve();
        });

        wrapper.emit("testB", fakeSocket);
        timeOut = setTimeout(() => reject(new Error("Timeout")), 50);
    });

    // Test C
    await new Promise((resolve, reject) => {
        let doneEmitted = false;

        fakeSocket.on("testC_done", () => {
            doneEmitted = true;
        });

        fakeSocket.on("testC", () => {
            reject(new Error("Back-event emitted!"));
        });

        wrapper.emit("testC", fakeSocket);
        setTimeout(() => {
            if (!doneEmitted) {
                return reject(new Error("testC done not emitted!"));
            }

            return resolve();
        }, 200);
    });

    // Test D
    await new Promise((resolve, reject) => {
        let timeOut = null;
        let doneEmitted = false;

        fakeSocket.on("testD_done", () => {
            doneEmitted = true;
        });

        fakeSocket.on("testD", ({ error }) => {
            if (error) {
                return reject(error);
            }
            if (!doneEmitted) {
                return reject(new Error("done not emitted!"));
            }
            clearTimeout(timeOut);

            return resolve();
        });

        wrapper.emit("testD", fakeSocket);
        timeOut = setTimeout(() => reject(new Error("Timeout")), 50);
    });

    test.pass();
});
