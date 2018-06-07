function testA(fakeSocket) {
    fakeSocket.emit("done");

    return { error: null };
}
module.exports = testA;
