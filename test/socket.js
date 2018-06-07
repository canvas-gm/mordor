// Require Node.JS Dependencies
const net = require("net");
const events = require("events");

// Require Third-party Dependencies
const avaTest = require("ava");
const uuid = require("uuid/v4");

// Require Internal Dependencies
const { handler, socket: socketWrapper } = require("../src/socketHandler");
const { parseSocketMessages } = require("../src/utils");

// Test variable(s)
let socketServer = null;
let socketClient = null;

/**
 * @private
 * @class eventsWrapper
 * @extends events
 */
class eventsWrapper extends events {}
const eWrapper = new eventsWrapper();

/**
 * @func send
 * @desc Send message to socket client
 * @param {!String} title message title
 * @param {Object=} body message body
 * @param {Number=} [timeOut=5000] Send timeout!
 * @returns {Promise<any>}
 */
function send(title, body = {}, timeOut = 5000) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ title, body });
        socketClient.write(Buffer.from(`${data}\n`));

        // Return if we dont expect a return from MordorClient
        if (timeOut === 0) {
            return resolve();
        }

        /** @type {NodeJS.Timer} */
        let timeOutRef = null;
        function handler(data) {
            clearTimeout(timeOutRef);
            resolve(data);
        }
        timeOutRef = setTimeout(() => {
            eWrapper.removeListener(title, handler);
            reject(new Error(`Timeout message ${title}`));
        }, timeOut);
        eWrapper.addListener(title, handler);

        return void 0;
    });
}
// Setup ping!
eWrapper.on("ping", (dt) => send("ping", dt, 0));

// Run Socket Server before all tests!
avaTest.before(async(test) => {

    // Initialize self
    await new Promise((resolve, reject) => {
        socketServer = net.createServer(handler);
        socketServer.listen(1338);
        socketServer.once("error", reject);
        socketServer.on("listening", function socketListen() {
            console.log("Socket server is listening on port 1338");
            resolve();
        });
    });
    socketServer.removeAllListeners("error");
    socketServer.on("error", console.error);

    // Initialize Client
    await new Promise((resolve, reject) => {
        const timeOut = setTimeout(() => {
            reject(new Error("timeout"));
        }, 1000);
        const options = {
            host: "127.0.0.1",
            port: 1338
        };
        socketClient = net.connect(options, () => {
            clearTimeout(timeOut);
            resolve();
        });
        socketClient.once("error", reject);
    });
    socketClient.removeAllListeners("error");
    socketClient.on("error", console.error);
    socketClient.on("data", (buf) => {
        const messages = parseSocketMessages(buf.toString());
        for (const message of messages) {
            eWrapper.emit(message.title, message.body);
        }
    });

    // Initialize client!
    test.pass();
});

// Close everything
avaTest.after((test) => {
    socketWrapper.disconnectAllSockets();
    test.pass();
});

avaTest("command -> registerServer", async(test) => {
    const name = "test project!";
    const uid = uuid();
    const { error } = await send("registerServer", { uid, name }, 100);
    test.is(error, null);

    // Register projects
    const projectsToBeRegistered = [
        { name: "fraxken project", description: "Mer il est fouu!!!" },
        { name: "javascript > *", description: "Error 404" }
    ];
    for (const project of projectsToBeRegistered) {
        await send("registerProject", project, 100);
    }

    const projects = await send("getProjects", {}, 100);
    test.is(projects.error, null);
    delete projects.error;

    // Verify getProjects!
    test.is(Reflect.has(projects, name), true);
    const project = Reflect.get(projects, name);
    test.is(Reflect.has(project, "id"), true);
    test.is(project.id, uid);
    test.is(project.projects instanceof Array, true);
    test.deepEqual(project.projects, projectsToBeRegistered);
});
