/**
 * @class RemoteClient
 * @desc A remote (authenticated) socket client!
 *
 * @property {net.Socket} socket
 */
class RemoteClient {

    /**
     * @constructor
     * @param {net.Socket} socket Node.JS Socket
     * @param {Object} user user
     * @param {!String} user.login client login
     * @param {!String} user.email client email
     */
    constructor(socket, { login, email }) {
        this.socket = socket;
        this.login = login;
        this.email = email;
        this.updatedAt = new Date();
    }

    /**
     * @method isUpToDate
     * @returns {Boolean}
     */
    isUpToDate() {
        const delta = this.updatedAt.getTime() - new Date().getTime();
        console.log(delta);

        this.updatedAt = new Date();

        return true;
    }

    /**
     * @public
     * @method valueOf
     * @memberof RemoteClient#
     * @returns {Object}
     */
    valueOf() {
        return {
            login: this.login,
            email: this.email
        };
    }

}

module.exports = RemoteClient;
