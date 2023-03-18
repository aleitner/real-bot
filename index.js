const Discord = require('discord.js');
const BotManager = require('./src/botManager');
const MirrorBot = require('./src/bots/mirrorbot');
const ChatGPTBot = require('./src/bots/chatgptbot');

// Initialize Discord Bot
var client = new Discord.Client({fetchAllMembers: true, intents: ["GUILDS", "GUILD_MESSAGES"]});

let botManager = new BotManager(client);
botManager.Register(new MirrorBot(client));
botManager.Register(new ChatGPTBot(client));

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
    botManager.HandleMessage(msg);
});

client.login(process.env.BOT_TOKEN);
