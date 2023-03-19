const Discord = require('discord.js');
const BotManager = require('./src/botManager');
const path = require('path');

// Initialize Discord Bot
var client = new Discord.Client({fetchAllMembers: true, intents: ["GUILDS", "GUILD_MESSAGES"]});
const databasePath = process.env.DATABASE_URL ? process.env.DATABASE_URL : path.join(__dirname, '..', '..', 'data', 'development.sqlite');
let botManager = new BotManager(client, databasePath);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Log the list of servers the bot is in
    console.log('Servers:');
    client.guilds.cache.forEach(guild => {
        console.log(` - ${guild.name} (${guild.id})`);
    });
});

client.on('messageCreate', msg => {
    botManager.handleMessage(msg);
});

client.login(process.env.BOT_TOKEN);
