// Require Node.JS Dependencies
const net = require("net");
const events = require("events");

// Require Third-party Dependencies
const avaTest = require("ava");
const is = require("@sindresorhus/is");
const uuid = require("uuid/v4");
const randToken = require("rand-token");
const rethinkdb = require("rethinkdb");

// Require Internal Dependencies
const { handler } = require("../src/socketHandler");
const { parseSocketMessages } = require("../src/utils");

// Require config
const config = require("../config/editableSettings.json");

// Test variable(s)
let socketServer = null;
const authAccount = {
    email: "sockettest@gmail.com",
    password: "P@ssword1953"
};

// Test account (payload)
const testAccount = {
    active: true,
    login: "test",
    password: "$argon2i$v=19$m=4096,t=3,p=1$hfyVz+rUZkXbVzDW9E3cbg$jhEvlGdXY4rsun/Im1h+1lAA3GzeFbLSlx8P+Q+fHvc",
    email: "sockettest@gmail.com"
};

/**
 * @private
 * @class eventsWrapper
 * @extends events
 */
class eventsWrapper extends events {

    /**
     * @constructor
     * @param {net.Socket} socket Node.JS Socket client
     */
    constructor(socket) {
        super();
        this.socket = socket;
        this.socket.on("data", (buf) => {
            const messages = parseSocketMessages(buf.toString());
            for (const message of messages) {
                this.emit(message.title, message.body);
            }
        });
        this.socket.on("error", console.error);
        this.on("ping", (dt) => this.send("ping", dt, 0));
    }

    /**
     * @method send
     * @desc Send message to socket client
     * @param {!String} title message title
     * @param {Object=} body message body
     * @param {Number=} [timeOut=5000] Send timeout!
     * @returns {Promise<any>}
     */
    send(title, body = {}, timeOut = 5000) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({ title, body });
            this.socket.write(Buffer.from(`${data}\n`));

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
                this.removeListener(title, handler);
                reject(new Error(`Timeout message ${title}`));
            }, timeOut);
            this.addListener(title, handler);

            return void 0;
        });
    }

}

/**
 * @async
 * @func createSocketClient
 * @returns {Promise<eventsWrapper>}
 */
async function createSocketClient() {
    /** @type {net.Socket} */
    let socketClient = null;
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

    return new eventsWrapper(socketClient);
}

/**
 * @func generateServer
 * @returns {Object}
 */
function generateServer() {
    return { name: randToken.generate(10), uid: uuid() };
}

// Run Socket Server before all tests!
avaTest.before(async(test) => {
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

    const conn = await rethinkdb.connect(config.database);
    try {
        const wR = await rethinkdb.db("mordor").table("users")
            .insert(testAccount)
            .run(conn);
        test.is(wR.inserted, 1);
        await conn.close();
    }
    catch (error) {
        await conn.close();
    }

    test.pass();
});

// Delete test account!
avaTest.after(async(test) => {
    const conn = await rethinkdb.connect(config.database);
    try {
        const wR = await rethinkdb.db("mordor").table("users")
            .filter({ email: testAccount.email })
            .delete()
            .run(conn);
        test.is(wR.deleted, 1);
        await conn.close();
    }
    catch (error) {
        await conn.close();
    }
});

// Initialize a new client for each new test!
avaTest.beforeEach(async(test) => {
    test.context.client = await createSocketClient();
    test.context.server = generateServer();
    test.pass();
});

// Close client after each!
avaTest.afterEach((test) => {
    test.context.client.socket.end();
    test.pass();
});

avaTest("command -> authentication", async(test) => {
    const { client } = test.context;

    // Authenticate (email error)
    const { error: errorEmail } = await client.send("authentication", {}, 500);
    test.is(errorEmail, "User email should be a string!");

    // Authenticate (password error)
    const { error: errorPw } = await client.send("authentication", { email: "yo" }, 500);
    test.is(errorPw, "User password should be a string!");

    // No account matching!
    const email = "random@gmail.com";
    const { error: matchError } = await client.send(
        "authentication",
        { email, password: "1234" },
        1000
    );
    test.is(matchError, `Unable to found any valid account with email ${email}`);
});

avaTest("command -> registerServer", async(test) => {
    const { client, server } = test.context;

    // Register (first-time) server
    const { error: registerError } = await client.send("registerServer", server, 100);
    test.is(registerError, null);

    // Should return server already registered!
    const { error } = await client.send("registerServer", server, 100);
    test.is(error, "Server already authentified (currently in use)");
});

avaTest("command -> registerServer (While authenticated as client)", async(test) => {
    const { client, server } = test.context;

    // Authenticate
    const { error, socketId } = await client.send("authentication", authAccount, 500);
    test.is(error, null);
    test.is(is.string(socketId), true);
    test.is(socketId.length, 36);

    // Authenticate second time
    const { error: authError } = await client.send("authentication", authAccount, 500);
    test.is(authError, "Socket session already authenticated!");

    // Check error
    const { error: registerError } = await client.send("registerServer", server, 100);
    test.is(registerError, "Cannot register a Server if you'r authenticated as Client");
});

avaTest("command -> registerProject", async(test) => {
    const { client, server } = test.context;

    // Register server
    const { error: registerError } = await client.send("registerServer", server, 100);
    test.is(registerError, null);

    // Register projects
    const projectsToBeRegistered = [
        { name: "fraxken project", description: "Mer il est fouu!!!" },
        { name: "javascript > *", description: "Error 404" }
    ];
    for (const project of projectsToBeRegistered) {
        await client.send("registerProject", project, 100);
    }

    // Try to register the same project!
    {
        const { error } = await client.send("registerProject", projectsToBeRegistered[0], 100);
        test.is(error, "Project with name fraxken project has been already registered!");
    }

    // Get all projects!
    const projects = await client.send("getProjects", {}, 100);
    test.is(projects.error, null);
    delete projects.error;

    // Verify getProjects!
    test.is(Reflect.has(projects, server.name), true);
    const project = Reflect.get(projects, server.name);
    test.is(Reflect.has(project, "id"), true);
    test.is(project.id, server.uid);
    test.is(project.projects instanceof Array, true);
    test.deepEqual(project.projects, projectsToBeRegistered);
});

avaTest("command -> registerProject (Not authenticated)", async(test) => {
    const { client } = test.context;

    // Check error
    const { error } = await client.send("registerProject", {}, 100);
    test.is(error, "Unknow server. Please authenticate before registering any projects!");
});
