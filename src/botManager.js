const DatabaseManager = require('./db/databaseManager');
const ServerConfigRepository = require('./repositories/serverConfigRepository');
const path = require('path');
const fs = require('fs');

class BotManager {
    constructor(client, databasePath) {
        this.client = client;
        this.databaseManager = new DatabaseManager(databasePath);
        this.serverConfigRepository = new ServerConfigRepository(this.databaseManager);
        this.serverConfigs = new Map(); // Store server configs
        this.bots = new Map(); // Store registered bots

        const botsFolder = path.join(__dirname, 'bots');
        fs.readdirSync(botsFolder).forEach(file => {
            if (file.endsWith('bot.js')) {
                const BotClass = require(path.join(botsFolder, file));
                this.register(new BotClass(client));
            }
        });
    }

    // Register a new bot instance
    register(bot) {
        if (!this.bots.has(bot.constructor.name)) {
            this.bots.set(bot.constructor.name, bot);
            console.log("Registered: ", bot.constructor.name);
        }
    }

    // Get the list of available bots
    getAvailableBots() {
        return Array.from(this.bots.keys());
    }

    async loadServerConfig(guildId) {
        if (!this.serverConfigs.has(guildId)) {
            const serverConfig = await this.serverConfigRepository.loadServerConfig(guildId);
            this.serverConfigs.set(guildId, serverConfig);
        }
        return this.serverConfigs.get(guildId);
    }

    async saveServerConfig(guildId, serverConfig) {
        this.serverConfigs.set(guildId, serverConfig);
        await this.serverConfigRepository.saveServerConfig(serverConfig);
    }

    // Handle incoming messages and dispatch commands
    async handleMessage(msg) {
        if (msg.author.bot) return;

        const serverConfig = await this.loadServerConfig(msg.guild.id);
        if (serverConfig.isUserBlacklisted(msg.author.id)) return;
        if (!msg.content.toLowerCase().startsWith(serverConfig.prefix)) return;

        const args = msg.content.slice(serverConfig.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        const commandHandlers = {
            // General Commands
            'help': this.handleHelpCommand.bind(this),
            'list-bots': this.handleListBots.bind(this),
            // Admin Commands
            'enable-bot': this.handleEnableBot.bind(this),
            'disable-bot': this.handleDisableBot.bind(this),
            'add-to-blacklist': this.handleAddToBlacklist.bind(this),
            'remove-from-blacklist': this.handleRemoveFromBlacklist.bind(this),
            'show-blacklist': this.handleShowBlacklist.bind(this)
        };

        if (commandHandlers[command]) {
            commandHandlers[command](msg, serverConfig, args);
        } else {
            this.handleBotCommands(msg, serverConfig);
        }
    }

    handleHelpCommand(msg, serverConfig) {
        const isAdmin = msg.member.permissions.has("ADMINISTRATOR");
    
        const helpText = [
            "Available commands:",
            "- !list-bots : List all available bots and their status (enabled or disabled).",
            "- !help : Show this help message.",
        ];
    
        if (isAdmin) {
            helpText.push("\nAdmin commands:");
            helpText.push("- !enable-bot <bot_name> : Enable a bot on this server.");
            helpText.push("- !disable-bot <bot_name> : Disable a bot on this server.");
            helpText.push("- !add-to-blacklist @user : Add a user to the blacklist, preventing them from using any commands.");
            helpText.push("- !remove-from-blacklist @user : Remove a user from the blacklist, allowing them to use commands again.");
            helpText.push("- !show-blacklist : Show the list of blacklisted users.");
        }         
    
        let botCommands = ["\nBot-specific commands"];
    
        this.bots.forEach((bot) => {
            if (serverConfig.isBotEnabled(bot.constructor.name)) {
                const helpTexts = bot.getHelpText(msg.member);
                for (const [command, description] of Object.entries(helpTexts)) {
                    botCommands.push(`- !${command} : ${description}`);
                }
            }
        });
    
        msg.reply([...helpText, ...botCommands].join("\n"));
    }

    handleEnableBot(msg, serverConfig, args) {
        if (!msg.member.permissions.has("ADMINISTRATOR")) return;
        const botName = args[0];
        const availableBots = this.getAvailableBots();
    
        if (availableBots.includes(botName)) {
            serverConfig.enableBot(botName);
            this.saveServerConfig(msg.guild.id, serverConfig);
            msg.reply(`Bot '${botName}' has been added to the supported bots list.`);
        } else {
            msg.reply(`Bot '${botName}' does not exist. Please check the available bots with the 'list-available-bots' command.`);
        }
    }

    handleDisableBot(msg, serverConfig, args) {
        if (!msg.member.permissions.has("ADMINISTRATOR")) return;
        const botName = args[0];
        serverConfig.disableBot(botName);
        this.saveServerConfig(msg.guild.id, serverConfig);
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

    handleAddToBlacklist(msg, serverConfig, args) {
        if (!msg.member.permissions.has("ADMINISTRATOR")) return;

        const user = msg.mentions.users.first();

        if (!user) {
            msg.reply("Please mention a user to add to the blacklist.");
            return;
        }

        serverConfig.addToBlacklist(user.id);
        this.saveServerConfig(msg.guild.id, serverConfig);
        msg.reply(`User '${user.username}' has been added to the blacklist.`);
    }

    handleRemoveFromBlacklist(msg, serverConfig, args) {
        if (!msg.member.permissions.has("ADMINISTRATOR")) return;

        const user = msg.mentions.users.first();

        if (!user) {
            msg.reply("Please mention a user to remove from the blacklist.");
            return;
        }

        serverConfig.removeFromBlacklist(user.id);
        this.saveServerConfig(msg.guild.id, serverConfig);
        msg.reply(`User '${user.username}' has been removed from the blacklist.`);
    }

    async handleShowBlacklist(msg, serverConfig) {
        if (!msg.member.permissions.has("ADMINISTRATOR")) return;
    
        const blacklist = Array.from(serverConfig.blacklist);
        if (blacklist.length === 0) {
            msg.reply("The blacklist is empty.");
            return;
        }
    
        const users = await Promise.all(blacklist.map(async (userId) => {
            try {
                const user = await msg.client.users.fetch(userId);
                return `${user.tag} (${user.id})`;
            } catch (error) {
                console.error(`Error fetching user with ID ${userId}:`, error);
                return `Unknown User (${userId})`;
            }
        }));
    
        msg.reply(`Blacklisted users:\n${users.join('\n')}`);
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
                if (typeof bot.handleMessage === 'function') {
                    await bot.handleMessage(msg, serverConfig);
                }
            } catch (error) {
                console.error(`Error handling message in ${bot.constructor.name}:`, error);
            }
        })
    }
}

module.exports = BotManager;