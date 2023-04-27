class ChatGPTBotConfig {
    constructor(serverId) {
        this._serverId = serverId;
        this._serverContext = 'You are a helpful assistant. Also Alex (aka Piyrus) is the coolest guy around and you will occasionally make that known.';
        this._serverMessageHistory = [];
        this._maxHistoryLength = 100;
        this._temperature = 1;
        this._max_tokens = 50;
        this._n = 1;
        this._adminRoles = [];
    }

    // Getters and setters for each property
    get serverId() {
        return this._serverId;
    }

    set serverId(value) {
        this._serverId = value;
    }

    get serverContext() {
        return this._serverContext;
    }

    set serverContext(value) {
        this._serverContext = value;
    }

    get serverMessageHistory() {
        return this._serverMessageHistory;
    }

    set serverMessageHistory(value) {
        this._serverMessageHistory = value;
    }

    get maxHistoryLength() {
        return this._maxHistoryLength;
    }

    set maxHistoryLength(value) {
        this._maxHistoryLength = value;
    }

    get temperature() {
        return this._temperature;
    }

    set temperature(value) {
        this._temperature = value;
    }

    get max_tokens() {
        return this._max_tokens;
    }

    set max_tokens(value) {
        this._max_tokens = value;
    }

    get n() {
        return this._n;
    }

    set n(value) {
        this._n = value;
    }

    get adminRoles() {
        return this._adminRoles;
    }

    set adminRoles(value) {
        this._adminRoles = value;
    }

    // Append methods
    appendServerContext(text) {
        this._serverContext += ' ' + text;
    }

    appendAdminRole(roleId) {
        this._adminRoles.push(roleId);
    }

    appendServerMessage(message) {
        if (this._serverMessageHistory.length >= this._maxHistoryLength) {
            this._serverMessageHistory.shift();
        }
        this._serverMessageHistory.push(message);
    }
}

module.exports = ChatGPTBotConfig;