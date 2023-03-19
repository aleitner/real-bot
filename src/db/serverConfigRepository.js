const ServerConfig = require('../serverConfig');

class ServerConfigRepository {
    constructor(databaseManager) {
        this.dbManager = databaseManager;
    }

    SELECT_SERVER_CONFIG_SQL() {
        return 'SELECT * FROM server_configs WHERE guild_id = ?';
    }

    REPLACE_SERVER_CONFIG_SQL() {
        return `
            REPLACE INTO server_configs (guild_id, prefix, enabled_bots, blacklist)
            VALUES (?, ?, ?, ?)
        `;
    }

    async loadServerConfig(guildId) {
        const config = await this.dbManager.get(this.SELECT_SERVER_CONFIG_SQL(), [guildId]);

        if (config) {
            const serverConfig = new ServerConfig(guildId);
            serverConfig.prefix = config.prefix;
            serverConfig.enabledBots = new Set(JSON.parse(config.enabled_bots));
            serverConfig.blacklist = new Set(JSON.parse(config.blacklist));
            return serverConfig;
        } else {
            const newConfig = new ServerConfig(guildId, ['ChatGPTBot']);
            await this.saveServerConfig(newConfig);
            return newConfig;
        }
    }

    async saveServerConfig(serverConfig) {
        const params = [
            serverConfig.guildId,
            serverConfig.prefix,
            JSON.stringify(Array.from(serverConfig.enabledBots)),
            JSON.stringify(Array.from(serverConfig.blacklist)),
        ];

        await this.dbManager.run(this.REPLACE_SERVER_CONFIG_SQL(), params);
    }
}

module.exports = ServerConfigRepository;
