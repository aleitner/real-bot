const axios = require('axios');
const CooldownManager = require('../utils/cooldownManager');

/**
 * Class representing a ChatGPTBot.
 */
class ChatGPTBot {
    /**
     * Create a ChatGPTBot.
     * @param {Object} client - Discord client.
     * @param {number} cooldownSeconds - Cooldown for the chat command.
     */
    constructor(client, cooldownSeconds = 10) {
        this.client = client;
        this.apiKey = process.env.CHATGPT_API_KEY;
        this.organizationId = process.env.CHATGPT_ORGANIZATION_ID;
        this.cooldownManager = new CooldownManager(cooldownSeconds);
        this.config = {};
        this.defaultContext = 'you are a helpful assistant. Also Alex (aka Piyrus) is the coolest guy around and you will occasionally make that known.';
    }

    /**
     * Get help text for commands.
     * @param {Object} member - The Discord member object.
     * @return {Object} Help text object with command explanations.
     */
    getHelpText(member) {
        const helpText = {
            chatgpt: 'Use !chatgpt <your_question> to ask ChatGPTBot a question.',
        };

        // Include set-context command for admins
        if (this.isAdmin(member)) {
            helpText['chatgpt set-context'] = "Use !chatgpt set-context 'message' to set the context message for the server.";
            helpText['chatgpt append-context'] = "Use !chatgpt append-context 'message' to add to the context message for the server.";
        }

        return helpText;
    }

    /**
     * Get required roles for usage.
     * @return {Array} An empty array, as there are no required roles by default.
     */
    getRequiredRoles() {
        return []; // No required roles by default
    }

    /**
     * Set a context message for a server.
     * @param {string} serverId - The Discord server ID.
     * @param {string} message - The new context message to set.
     */
    setContextMessage(serverId, message) {
        this.config[serverId].serverContext = message;
    }

    /**
     * Append a message to the context for a server.
     * @param {string} serverId - The Discord server ID.
     * @param {string} message - The message to append to the existing context.
     */
    appendContextMessage(serverId, message) {
        this.config[serverId].serverContext = `${this.config[serverId].serverContext} ${message}`
    }

    /**
     * Check if a member has an admin role.
     * @param {Object} member - The Discord member object.
     * @return {boolean} True if member is an admin, otherwise false.
     */
    isAdmin(member) {
        // Customize this function to check for admin role in your server
        return member.permissions.has("ADMINISTRATOR");
    }

    /**
     * Update the message history for a server.
     * @param {string} serverId - The Discord server ID.
     * @param {Object} userMessage - The user message object.
     * @param {Object} systemMessage - The system message object.
     */
    updateMessageHistory(serverId, userMessage, systemMessage) {
        if (!this.config[serverId].serverMessageHistory) {
            this.config[serverId].serverMessageHistory = [];
        }

        const messages = [
            userMessage,
            systemMessage
        ];

        // Add new messages to the beginning of the messages array
        this.config[serverId].serverMessageHistory.unshift(...messages);

        // If there are more than 15 user messages, remove the oldest ones
        if (this.config[serverId].serverMessageHistory.length > 30) {
            this.config[serverId].serverMessageHistory.length = 30;
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

        // Check if the user is on cooldown
        if (this.cooldownManager.isOnCooldown(userId)) {
            const remainingTime = this.cooldownManager.remainingTime(userId);
            msg.reply(`Please wait ${remainingTime.toFixed(1)} seconds before using the !chatgpt command again.`);
            return;
        }

        // Set the cooldown for the user
        this.cooldownManager.setCooldown(userId);

        const query = msg.content.slice(8).trim(); // Remove the '!chatgpt' prefix

        // Check if the message is from an admin
        if (this.isAdmin(msg.member)) {
            const serverId = msg.guild.id;

            // Check if the message starts with 'set-context'
            if (query.toLowerCase().startsWith('set-context')) {
                const contextMessage = query.slice(11).trim(); // Remove the 'set-context' prefix
                this.setContextMessage(serverId, contextMessage);
                msg.reply('Context message has been set.');
                return;
            }
            // Check if the message starts with 'append-context'
            else if (query.toLowerCase().startsWith('append-context')) {
                const contextMessage = query.slice(13).trim(); // Remove the 'append-context' prefix
                this.appendContextMessage(serverId, contextMessage);
                msg.reply('Context message has been updated.');
                return;
            }
        }

        const formattedMessage = {role: 'user', content: `${msg.author.username}: ${query}`};

        try {
            const response = await this.callChatGPT(formattedMessage, msg.guild.id);
            const formattedResponse = { role: 'system', content: response };
            this.updateMessageHistory(msg.guild.id, formattedMessage, formattedResponse);
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
        if (!this.config[serverId]) {
            // Initialize the server config if it does not exist
            this.config[serverId] = {
              serverContext: this.defaultContext,
              serverMessageHistory: [],
              temperature: 1
            };
        }

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
                {role: 'system', content: 'Multiple users will sending you messages and all messages will be prefixed with "user: " allowing you to know who sent the message. You will never respond in that same format unless requested.'},
                ...this.config[serverId].serverMessageHistory,
                message
            ],
            max_tokens: 50,
            n: 1,
            temperature: this.config[serverId].temperature,
        };

        const response = await axios.post(url, data, { headers, timeout: 30000 });

        console.log(response.data.choices[0])
        return response.data.choices[0].message.content.trim();
    }
}

module.exports = ChatGPTBot;