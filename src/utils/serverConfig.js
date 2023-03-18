class ServerConfig {
    constructor(guildId, defaultEnabledBots = []) {
        this.guildId = guildId;
        this.prefix = '!'; // Default prefix for commands
        this.enabledBots = new Set(defaultEnabledBots); // Store the names of supported bots
        this.blacklist = new Set();
    }

    enableBot(botName) {
        this.enabledBots.add(botName);
    }
    
    disableBot(botName) {
        this.enabledBots.delete(botName);
    }
    
    isBotEnabled(botName) {
        return this.enabledBots.has(botName);
    }

    listEnabledBots() {
        return Array.from(this.enabledBots);
    }
}

module.exports = ServerConfig;