function testC(fakeSocket) {
    fakeSocket.emit("testC_done");

    return {
        exit: true
    };
}
module.exports = testC;
