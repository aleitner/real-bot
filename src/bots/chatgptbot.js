const axios = require('axios');
const CooldownManager = require('../utils/cooldownManager');

class ChatGPTBot {
    constructor(client, cooldownSeconds = 10) {
        this.client = client;
        this.apiKey = process.env.CHATGPT_API_KEY;
        this.organizationId = process.env.CHATGPT_ORGANIZATION_ID;
        this.cooldownManager = new CooldownManager(cooldownSeconds);
    }

    async HandleMessage(msg) {
        if (msg.author.bot) return;

        // A simple check to see if the bot should respond
        if (msg.content.toLowerCase().startsWith('!chatgpt')) {
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

            try {
                const response = await this.callChatGPT(query);
                msg.channel.send(response);
            } catch (error) {
                console.error('Error calling ChatGPT:', error);
                msg.channel.send('Sorry, I could not get a response from ChatGPT.');
            }
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
            model: "gpt-3.5-turbo",
            messages: [
                {role: 'system', content: 'You are a helpful assistant.'},
                {role: 'user', content: prompt}
            ],
            max_tokens: 50,
            n: 1,
            temperature: 1,
        };

        const response = await axios.post(url, data, { headers });

        console.log(response.data.choices[0])
        return response.data.choices[0].message.content.trim();
    }
}

module.exports = ChatGPTBot;