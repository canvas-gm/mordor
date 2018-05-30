function authentication(socket, { foo }) {
    console.log(`foo value => ${foo}`);
    this.send(socket, "yop", {foo: "xd"});
}

module.exports = authentication;
