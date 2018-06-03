/**
 * @func ping
 * @desc When ping is returned ping
 * @param {net.Socket} socket Node.JS Socket
 * @returns {void}
 */
function ping(socket, { dt }) {
    Reflect.set(socket, "pongDt", dt);

    return void 0;
}

module.exports = ping;
