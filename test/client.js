require("make-promises-safe");
const net = require("net");

const timeout = ms => new Promise(res => setTimeout(res, ms))
const client = net.connect({ port: 1337 }, async() => {
    console.log("connected to server!");
    for (;;) {
        writeMessage("ping", { dt: null });
        await timeout(100);
    }
});
client.on("error", console.error);
client.on("end", () => {
    console.log("remote socket end");
    process.exit(0);
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

