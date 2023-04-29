const axios = require('axios');
const CooldownManager = require('../utils/cooldownManager');
const ChatGPTBotConfig = require('../models/chatgptbotConfig');
const ChatGPTBotRepository = require('../repositories/chatgptbotRepository')

/**
 * Class representing a ChatGPTBot.
 */
class ChatGPTBot {
    /**
     * Create a ChatGPTBot.
     * @param {Object} client - Discord client.
     * @param {number} cooldownSeconds - Cooldown for the chat command.
     */
    constructor(client, databaseManager, cooldownSeconds = 10) {
        this.client = client;
        this.apiKey = process.env.CHATGPT_API_KEY;
        this.organizationId = process.env.CHATGPT_ORGANIZATION_ID;
        this.cooldownManager = new CooldownManager(cooldownSeconds);
        this.repository = new ChatGPTBotRepository(databaseManager);
        this.config = {};
        this.secretContext = 'Multiple users will sending you messages and all messages will be prefixed with "user: " allowing you to know who sent the message. You will not respond in that same format.'
        this.costPerToken = 0.00003;
    }

    /**
     * Get help text for commands.
     * @param {Object} member - The Discord member object.
     * @return {Object} Help text object with command explanations.
     */
    getHelpText(member) {
        const helpText = {
            chatgpt: "Use !chatgpt 'your_question' to ask ChatGPTBot a question.",
        };

        // Include set-context command for admins
        if (this.isAdmin(member)) {
            helpText['chatgpt set-context'] = "Use !chatgpt set-context 'message' to set the context message for the server.";
            helpText['chatgpt append-context'] = "Use !chatgpt append-context 'message' to add to the context message for the server.";
            helpText['chatgpt add-admin-role'] = "Use !chatgpt @role to give admin privileges to the specified role."
            helpText['chatgpt show-costs'] = "Use !chatgpt show-costs to show how much this server has spent on API calls. Consider donating!"
        }

        return helpText;
    }

    getRequiredRoles() {
        return []; // No required roles by default
    }

    /**
     * Check if a member has an admin role.
     * @param {Object} member - The Discord member object.
     * @return {boolean} True if member is an admin, otherwise false.
     */
    isAdmin(member) {
        const serverId = member.guild.id;
        const serverConfig = this.config[serverId];
    
        // Check if the member has administrative permissions
        const hasAdminPermission = member.permissions.has("ADMINISTRATOR");
    
        // If the server config exists and has a list of admin roles, check if the member has any of those roles
        const hasConfigAdminRole = serverConfig && Array.isArray(serverConfig.adminRoles) &&
                                   serverConfig.adminRoles.some(roleId => member.roles.cache.has(roleId));
    
        // Return true if the member has administrative permissions or an admin role configured in the server config
        return hasAdminPermission || hasConfigAdminRole;
    }

    async handleNewGuild(guild) {
        const serverId = guild.id;

        // Check if there's already a config for the server
        if (!this.config[serverId]) {
            // Create a new server config and save it
            this.config[serverId] = new ChatGPTBotConfig(serverId);
            await this.repository.saveConfig(this.config[serverId]);
        }
    }

    /**
     * Handle incoming user messages.
     * @param {Object} msg - The user message object.
     * @param {Object} config - The server config.
     */
    async handleMessage(msg, config) {

        if (msg.author.bot) return;
        if (!msg.content.toLowerCase().startsWith(`${config.prefix}chatgpt`)) return;

        const userId = msg.author.id;
        const serverId = msg.guild.id;

        // Check if the user is on cooldown
        if (this.cooldownManager.isOnCooldown(userId)) {
            const remainingTime = this.cooldownManager.remainingTime(userId);
            msg.reply(`Please wait ${remainingTime.toFixed(1)} seconds before using the !chatgpt command again.`);
            return;
        }

        // Set the cooldown for the user
        this.cooldownManager.setCooldown(userId);

        // Load config or create one if we don't have one
        if (!this.config[serverId]) {
            let loadedConfig = await this.repository.loadConfig(serverId);
            this.config[serverId] = (loadedConfig != null) ? loadedConfig : new ChatGPTBotConfig(serverId);
            console.log(`[${serverId}] Loaded Config...`);
            console.log(this.config[serverId])
        }

        // Start typing indicator in the channel
        msg.channel.sendTyping();

        const query = msg.content.slice(8).trim(); // Remove the '!chatgpt' prefix

        // Check if the message is from an admin
        if (this.isAdmin(msg.member)) {

            // Check if the message starts with 'set-context'
            if (query.toLowerCase().startsWith('set-context')) {
                const contextMessage = query.slice(11).trim(); // Remove the 'set-context' prefix
                this.config[serverId].serverContext = contextMessage;
                this.config[serverId].serverMessageHistory = []; // Clear chat history when new context

                this.repository.updateServerContext(serverId, contextMessage);
                this.repository.updateServerMessageHistory(serverId, []);
                msg.reply('Context message has been set.');
                return;
            }
            // Check if the message starts with 'append-context'
            else if (query.toLowerCase().startsWith('append-context')) {
                const contextMessage = query.slice(14).trim(); // Remove the 'append-context' prefix
                this.config[serverId].appendServerContext(contextMessage);
                this.repository.updateServerContext(serverId, this.config[serverId].serverContext);
                msg.reply('Context message has been updated.');
                return;
            }
            // Check if the message starts with 'add-admin-role'
            else if (query.toLowerCase().startsWith('add-admin-role')) {
                const roleId = query.match(/<@&(\d+)>/)[1]; // Extract roleId from <@&roleId>
                if (roleId) {
                    this.config[serverId].appendAdminRole(roleId);
                    this.repository.updateAdminRoles(serverId, this.config[serverId].adminRoles);
                    msg.reply(`Added <@&${roleId}> as an admin role.`);
                } else {
                    msg.reply('Invalid role. Please tag a valid role.');
                }
                return;
            } if (query.toLowerCase().startsWith('show-costs')) {
                msg.reply(`Current costs: \$${this.config[serverId].serverCost.toFixed(2)}. Consider donating!`);
                return;
            }
        }

        const formattedMessage = {role: 'user', content: `${msg.author.username}: ${query}`};

        try {
            const response = await this.callChatGPT(formattedMessage, msg.guild.id);
            const formattedResponse = { role: 'system', content: response };
            this.config[serverId].appendServerMessage(formattedMessage);
            this.config[serverId].appendServerMessage(formattedResponse);

            this.repository.updateServerMessageHistory(serverId, this.config[serverId].serverMessageHistory);
            this.repository.updateServerCost(serverId, this.config[serverId].serverCost);
            msg.channel.send(response);
        } catch (error) {
            console.error('Error calling ChatGPT:', error);
            msg.channel.send('Sorry, I could not get a response from ChatGPT.');
        }
    }

    /**
     * Call the ChatGPT API.
     * @param {Object} message - The user message object.
     * @param {string} serverId - The Discord server ID.
     * @return {Promise<string>} The response from the ChatGPT API.
     */
    async callChatGPT(message, serverId) {

        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Organization': this.organizationId
        };

        const data = {
            model: "gpt-4",
            messages: [
                {role: 'system', content: this.config[serverId].serverContext},
                {role: 'system', content: this.secretContext},
                {role: 'system', content: `You will respond within the max_token limit of ${this.config[serverId].max_tokens}.`},
                ...this.config[serverId].serverMessageHistory,
                message
            ],
            max_tokens: this.config[serverId].max_tokens,
            n: this.config[serverId].n,
            temperature: this.config[serverId].temperature,
        };

        const response = await axios.post(url, data, { headers, timeout: 30000 });

        // Calculate the total Cost of the api call
        this.config[serverId].appendServerCost(response.data.usage.total_tokens * this.costPerToken);

        console.log(response.data.choices[0])

        return response.data.choices[0].message.content.trim();
    }
}

module.exports = ChatGPTBot;