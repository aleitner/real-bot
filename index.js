const Discord = require('discord.js');
const BotManager = require('./src/botManager');
const MirrorBot = require('./src/bots/mirrorbot');
const ChatGPTBot = require('./src/bots/chatgptbot');

// Initialize Discord Bot
var client = new Discord.Client({fetchAllMembers: true, intents: ["GUILDS", "GUILD_MESSAGES"]});

const databasePath = process.env.DATABASE_URL ? process.env.DATABASE_URL : path.join(__dirname, '..', '..', 'data', 'development.sqlite');

let botManager = new BotManager(client, databasePath);
botManager.Register(new MirrorBot(client));
botManager.Register(new ChatGPTBot(client));

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Log the list of servers the bot is in
    console.log('Servers:');
    client.guilds.cache.forEach(guild => {
        console.log(` - ${guild.name} (${guild.id})`);
    });
});

client.on('messageCreate', msg => {
    botManager.HandleMessage(msg);
});

client.login(process.env.BOT_TOKEN);
