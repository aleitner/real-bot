const ChatGPTBotConfig = require('../models/chatgptbotConfig');

/**
 * ChatGPTBotRepository is a class that handles database operations to manage
 * configurations for a ChatGPT bot, such as loading and saving configurations,
 * as well as updating specific configuration values.
 */
class ChatGPTBotRepository {
    /**
     * Create a ChatGPTBotRepository.
     * @param {Object} databaseManager - The database manager instance.
     */
    constructor(databaseManager) {
        this.db = databaseManager;
    }

    /**
     * Load all server configs from the database.
     * @return {Promise<Array<ChatGPTBotConfig>>} An array of ChatGPTBotConfig instances.
     */
    async loadConfigs() {
        const configs = await this.db.all('SELECT * FROM chatgptbot_config');
        return configs.map(config => {
            let chatGPTBotConfig = new ChatGPTBotConfig(config.serverId);

            chatGPTBotConfig.serverContext = config.serverContext;
            chatGPTBotConfig.serverMessageHistory = JSON.parse(config.serverMessageHistory);
            chatGPTBotConfig.maxHistoryLength = config.maxHistoryLength;
            chatGPTBotConfig.temperature = config.temperature;
            chatGPTBotConfig.max_tokens = config.max_tokens;
            chatGPTBotConfig.n = config.n;
            chatGPTBotConfig.adminRoles = JSON.parse(config.adminRoles);

            return chatGPTBotConfig;
        });
    }

    /**
     * Load a single server config from the database.
     * @param {string} serverId - The Discord server ID.
     * @return {Promise<ChatGPTBotConfig>} A ChatGPTBotConfig instance.
     */
    async loadConfig(serverId) {
        const config = await this.db.get('SELECT * FROM chatgptbot_config WHERE serverId = ?', serverId);
        
        if (!config) return null;

        let chatGPTBotConfig = new ChatGPTBotConfig(config.serverId);

        chatGPTBotConfig.serverContext = config.serverContext;
        chatGPTBotConfig.serverMessageHistory = JSON.parse(config.serverMessageHistory);
        chatGPTBotConfig.maxHistoryLength = config.maxHistoryLength;
        chatGPTBotConfig.temperature = config.temperature;
        chatGPTBotConfig.max_tokens = config.max_tokens;
        chatGPTBotConfig.n = config.n;
        chatGPTBotConfig.adminRoles = JSON.parse(config.adminRoles);

        return chatGPTBotConfig;
    }

    /**
     * Save the server config to the database.
     * @param {ChatGPTBotConfig} config - The server config to be saved.
     * @return {Promise<void>}
     */
    async saveConfig(config) {
        // Format serverMessageHistory and adminRoles as JSON strings
        const serverMessageHistory = JSON.stringify(config.serverMessageHistory);
        const adminRoles = JSON.stringify(config.adminRoles);

        // Perform "INSERT OR REPLACE" query
        const query = `
            INSERT OR REPLACE INTO chatgptbot_config (
                serverId, serverContext, serverMessageHistory, maxHistoryLength,
                temperature, max_tokens, n, adminRoles
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;

        await this.db.run(query, [
            config.serverId,
            config.serverContext,
            serverMessageHistory,
            config.maxHistoryLength,
            config.temperature,
            config.max_tokens,
            config.n,
            adminRoles,
        ]);
    }

    /**
     * Update the server context in the database.
     * @param {string} serverId - The Discord server ID.
     * @param {string} serverContext - The new server context.
     * @return {Promise<void>}
     */
    async updateServerContext(serverId, serverContext) {
        const query = `
            UPDATE chatgptbot_config
            SET serverContext = ?
            WHERE serverId = ?;
        `;

        await this.db.run(query, [serverContext, serverId]);
    }

    /**
     * Update the server message history in the database.
     * @param {string} serverId - The Discord server ID.
     * @param {string} serverMessageHistory - The new server message history.
     * @return {Promise<void>}
     */
    async updateServerMessageHistory(serverId, serverMessageHistory) {
        const query = `
            UPDATE chatgptbot_config
            SET serverMessageHistory = ?
            WHERE serverId = ?;
        `;

        await this.db.run(query, [JSON.stringify(serverMessageHistory), serverId]);
    }

    /**
     * Update the server max history length in the database.
     * @param {string} serverId - The Discord server ID.
     * @param {string} maxHistoryLength - The new server max history length.
     * @return {Promise<void>}
     */
    async updateMaxHistoryLength(serverId, maxHistoryLength) {
        const query = `
            UPDATE chatgptbot_config
            SET maxHistoryLength = ?
            WHERE serverId = ?;
        `;

        await this.db.run(query, [maxHistoryLength, serverId]);
    }

    /**
     * Update the server temperature in the database.
     * @param {string} serverId - The Discord server ID.
     * @param {string} temperature - The new server temperature.
     * @return {Promise<void>}
     */
    async updateTemperature(serverId, temperature) {
        const query = `
            UPDATE chatgptbot_config
            SET temperature = ?
            WHERE serverId = ?;
        `;

        await this.db.run(query, [temperature, serverId]);
    }

    /**
     * Update the server max tokens in the database.
     * @param {string} serverId - The Discord server ID.
     * @param {string} max_tokens - The new server max tokens.
     * @return {Promise<void>}
     */
    async updateMaxTokens(serverId, max_tokens) {
        const query = `
            UPDATE chatgptbot_config
            SET max_tokens = ?
            WHERE serverId = ?;
        `;

        await this.db.run(query, [max_tokens, serverId]);
    }

    /**
     * Update the server n in the database.
     * @param {string} serverId - The Discord server ID.
     * @param {string} n - The new server n.
     * @return {Promise<void>}
     */
    async updateN(serverId, n) {
        const query = `
            UPDATE chatgptbot_config
            SET n = ?
            WHERE serverId = ?;
        `;

        await this.db.run(query, [n, serverId]);
    }

    /**
     * Update the server admin roles in the database.
     * @param {string} serverId - The Discord server ID.
     * @param {string} adminRoles - The new server admin roles.
     * @return {Promise<void>}
     */
    async updateAdminRoles(serverId, adminRoles) {
        const query = `
            UPDATE chatgptbot_config
            SET adminRoles = ?
            WHERE serverId = ?;
        `;

        await this.db.run(query, [JSON.stringify(adminRoles), serverId]);
    }

}

module.exports = ChatGPTBotRepository;