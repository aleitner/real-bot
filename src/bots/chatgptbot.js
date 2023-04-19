const axios = require('axios');
const CooldownManager = require('../utils/cooldownManager');

class ChatGPTBot {
    constructor(client, cooldownSeconds = 15) {
        this.client = client;
        this.apiKey = process.env.CHATGPT_API_KEY;
        this.organizationId = process.env.CHATGPT_ORGANIZATION_ID;
        this.cooldownManager = new CooldownManager(cooldownSeconds);
        this.serverContext = {};
    }

    getHelpText() {
        return {
            chatgpt: 'Use !chatgpt <your_question> to ask ChatGPTBot a question.',
        };
    }  
    
    getRequiredRoles() {
        return []; // No required roles by default
    }

    // Function to set a message associated with a Discord server ID in the context
    setContextMessage(serverId, message) {
        this.serverContext[serverId] = message;
    }

    isAdmin(member) {
        // Customize this function to check for admin role in your server
        return member.hasPermission('ADMINISTRATOR');
    }

    async handleMessage(msg, serverConfig) {
        if (msg.author.bot) return;
        if (!msg.content.toLowerCase().startsWith(`${serverConfig.prefix}chatgpt`)) return;

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

        // Check if the message is from an admin and starts with 'set-context'
        if (this.isAdmin(msg.member) && query.toLowerCase().startsWith('set-context')) {
            const contextMessage = query.slice(12).trim(); // Remove the 'set-context' prefix
            const serverId = msg.guild.id;
            this.setContextMessage(serverId, contextMessage);
            msg.reply('Context message has been updated.');
            return;
        }

        try {
            const response = await this.callChatGPT(query);
            msg.channel.send(response);
        } catch (error) {
            console.error('Error calling ChatGPT:', error);
            msg.channel.send('Sorry, I could not get a response from ChatGPT.');
        }
    }

    async callChatGPT(prompt) {
        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Organization': this.organizationId
        };

        const data = {
            model: "gpt-4",
            messages: [
                {role: 'system', content: this.serverContext[serverId]},
                {role: 'user', content: prompt}
            ],
            max_tokens: 50,
            n: 1,
            temperature: 1,
        };

        const response = await axios.post(url, data, { headers, timeout: 10000 });

        console.log(response.data.choices[0])
        return response.data.choices[0].message.content.trim();
    }
}

module.exports = ChatGPTBot;
