const net = require("net");

const client = net.connect({ port: 1337 }, () => {
    console.log("connected to server!");
});

client.on("data", (data) => {
    console.log("data received!");
    console.log(JSON.parse(data.toString()));
});

function writeMessage(title, body = {}) {
    const data = JSON.stringify({
        title,
        body
    });
    client.write(Buffer.from(`${data}\n`));
}

writeMessage("authentication", {
    type: "server",
    name: "Test serv!"
});
setTimeout(() => {
    writeMessage("registerProject", {
        name: "Test project",
        description: "A test project!"
    });
}, 100);
setTimeout(() => {
    writeMessage("getProjects", {});
}, 200);
