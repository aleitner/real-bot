const DatabaseManager = require('./utils/databaseManager');

class BotManager {
    constructor(client) {
        this.client = client;
        this.databaseManager = new DatabaseManager();
        this.bots = new Map(); // Store registered bots
    }

    Register(bot) {
        if (!this.bots.has(bot.constructor.name)) {
            this.bots.set(bot.constructor.name, bot);
            console.log("Registered: ", bot.constructor.name);
        }
    }

    getAvailableBots() {
        return Array.from(this.bots.keys());
    }

    async HandleMessage(msg) {
        if (msg.author.bot) return;

        const serverConfig = await this.databaseManager.loadServerConfig(msg.guild.id);
        if (!msg.content.toLowerCase().startsWith(serverConfig.prefix)) return;

        const args = msg.content.slice(serverConfig.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        switch (command) {
            case 'help':
                this.handleHelpCommand(msg, serverConfig);
                break;
            case 'enable-bot':
                this.handleEnableBot(msg, serverConfig, args);
                break;
            case 'disable-bot':
                this.handleDisableBot(msg, serverConfig, args);
                break;
            case 'list-bots':
                this.handleListBots(msg, serverConfig);
                break;
            default:
                this.handleBotCommands(msg, serverConfig);
        }
    }

    handleHelpCommand(msg, serverConfig) {
        const isAdmin = msg.member.permissions.has("ADMINISTRATOR");

        let helpText = `
    Available commands:
    - !list-bots : List all available bots and their status (enabled or disabled).
    - !help : Show this help message.`;

        if (isAdmin) {
            helpText += `\n\nAdmin commands:
    - !enable-bot <bot_name> : Enable a bot on this server.
    - !disable-bot <bot_name> : Disable a bot on this server.`;
        }
    
        let botCommands = '\n\nBot-specific commands';
    
        this.bots.forEach((bot) => {
            if (serverConfig.isBotEnabled(bot.constructor.name)) {
                const helpTexts = bot.getHelpText();
                for (const [command, description] of Object.entries(helpTexts)) {
                    botCommands += `\n- !${command} : ${description}`;
                }
            }
        });
    
        msg.reply(helpText + botCommands);
    }

    handleEnableBot(msg, serverConfig, args) {
        if (!msg.member.permissions.has("ADMINISTRATOR")) return;
        const botName = args[0];
        const availableBots = this.getAvailableBots();
    
        if (availableBots.includes(botName)) {
            serverConfig.enableBot(botName);
            this.databaseManager.saveServerConfig(serverConfig);
            msg.reply(`Bot '${botName}' has been added to the supported bots list.`);
        } else {
            msg.reply(`Bot '${botName}' does not exist. Please check the available bots with the 'list-available-bots' command.`);
        }
    }

    handleDisableBot(msg, serverConfig, args) {
        if (!msg.member.permissions.has("ADMINISTRATOR")) return;
        const botName = args[0];
        serverConfig.disableBot(botName);
        this.databaseManager.saveServerConfig(serverConfig);
        msg.reply(`Bot '${botName}' has been removed from the supported bots list.`);
    }

    handleListBots(msg, serverConfig) {
        const availableBots = this.getAvailableBots();
        const enabledBots = serverConfig.listEnabledBots();
    
        const botList = availableBots.map((botName) => {
            const isEnabled = enabledBots.includes(botName);
            const icon = isEnabled ? '🟢' : '🔴';
            return `${icon} ${botName}`;
        }).join('\n');
    
        msg.reply(`Available bots: \n${botList}`);
    }

    async handleBotCommands(msg, serverConfig) {
        this.bots.forEach(async (bot) => {
            if (!serverConfig.isBotEnabled(bot.constructor.name)) {
                return; // Skip the bot if it's not supported by the server
            }
    
            const requiredRoles = bot.getRequiredRoles();
            if (requiredRoles.length > 0) {
                const userRoles = msg.member.roles.cache;
                const hasRequiredRole = requiredRoles.some(roleName => userRoles.find(role => role.name === roleName));
    
                if (!hasRequiredRole) {
                    msg.reply(`You don't have the required role(s) to use this bot. Required role(s): ${requiredRoles.join(', ')}`);
                    return;
                }
            }
    
            try {
                if (typeof bot.HandleMessage === 'function') {
                    await bot.HandleMessage(msg, serverConfig);
                }
            } catch (error) {
                console.error(`Error handling message in ${bot.constructor.name}:`, error);
            }
        })
    }
}

module.exports = BotManager;