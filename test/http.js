// Require Node.JS Dependencies
const { readFileSync } = require("fs");
const { join } = require("path");

// Require Third-party Dependencies
const avaTest = require("ava");
const request = require("supertest");
const Datastore = require("nedb-promises");

// Require Internal Dependencies
const httpServer = require("../src/httpServer");

// required Test variable(s)
const rootStr = readFileSync(join(__dirname, "../views/index.html")).toString();
const jsonArticles = require(join(__dirname, "../data/articles.json"));
const registerBody = {
    login: "testAccount",
    email: "test.account@gmail.com",
    password: "Password1953",
    password2: "Password1953"
};
let Agent;
let Registered = false;

// Run HTTP Server before all tests!
avaTest.before(async(test) => {
    await httpServer.listen(1337);
    console.log("HTTP server is listening on port 1337");
    Agent = request("http://localhost:1337");
    test.pass();
});

// Cleanup DB
avaTest.after(async(test) => {
    if (!Registered) {
        return test.pass();
    }
    const db = Datastore.create(join(__dirname, "../db/storage.db"));
    await db.load();
    const numRemoved = await db.remove({ email: "test.account@gmail.com" }, { multi: true });
    test.is(numRemoved, 1);

    return test.pass();
});

avaTest("trigger (GET) '/' HTTP route", async(test) => {
    await Agent.get("/")
        .expect("Content-Type", "text/html")
        .expect(rootStr)
        .expect(200);
    test.pass();
});

avaTest("trigger (GET) '/articles' HTTP route", async(test) => {
    await Agent.get("/articles")
        .expect("Content-Type", "application/json")
        .expect(jsonArticles)
        .expect(200);
    test.pass();
});

avaTest("trigger (POST) '/register' HTTP route (At least with one field undefined)", async(test) => {
    await Agent.post("/register")
        .send({})
        .expect("Content-Type", "application/json")
        .expect({ error: "One field has been detected as null or undefined!" })
        .expect(200);

    test.pass();
});

avaTest("trigger (POST) '/register' HTTP route (Invalid login)", async(test) => {
    const tData = JSON.parse(JSON.stringify(registerBody));
    Reflect.set(tData, "login", "h");

    await Agent.post("/register")
        .send(tData)
        .expect("Content-Type", "application/json")
        .expect({ error: "The field login should be Alphanumeric and contain between 2 and 50 characters!" })
        .expect(200);

    test.pass();
});

avaTest("trigger (POST) '/register' HTTP route (Invalid email)", async(test) => {
    const tData = JSON.parse(JSON.stringify(registerBody));
    Reflect.set(tData, "email", "yopyopmail");

    await Agent.post("/register")
        .send(tData)
        .expect("Content-Type", "application/json")
        .expect({ error: "The email entered doesn't have a valid format!" })
        .expect(200);

    test.pass();
});

avaTest("trigger (POST) '/register' HTTP route (Invalid Password)", async(test) => {
    const tData = JSON.parse(JSON.stringify(registerBody));
    Reflect.set(tData, "password", "bad");

    await Agent.post("/register")
        .send(tData)
        .expect("Content-Type", "application/json")
        .expect({ error: "Invalid password format" })
        .expect(200);

    test.pass();
});

avaTest("trigger (POST) '/register' HTTP route (Invalid Password Repetition)", async(test) => {
    const tData = JSON.parse(JSON.stringify(registerBody));
    Reflect.set(tData, "password2", "bad");

    await Agent.post("/register")
        .send(tData)
        .expect("Content-Type", "application/json")
        .expect({ error: "Password are not identical!" })
        .expect(200);

    test.pass();
});

avaTest("trigger (POST) '/register' HTTP route", async(test) => {
    await Agent.post("/register")
        .send(registerBody)
        .expect("Content-Type", "application/json")
        .expect({ error: null })
        .expect(200);

    Registered = true;

    await Agent.post("/register")
        .send(registerBody)
        .expect("Content-Type", "application/json")
        .expect({ error: "Your email is already used!" })
        .expect(200);
    test.pass();
});

avaTest("trigger (POST) '/token' HTTP route", async(test) => {
    await Agent.post("/token/token/login")
        .expect("Content-Type", "application/json")
        .expect({ error: null })
        .expect(200);

    test.pass();
});
