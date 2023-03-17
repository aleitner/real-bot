const Discord = require('discord.js');
const BotRegistrar = require('./src/botRegistrar');
const YanceyGangBot = require('./src/bots/yanceygangbot');
const MirrorBot = require('./src/bots/mirrorbot');
const YanceyJunkBot = require('./src/bots/yanceyjunkbot');
const ChatGPTBot = require('./src/bots/chatgptbot');
// const SentimentAnalysisBot = require('./bots/sentimentanalysisbot');

// Initialize Discord Bot
var client = new Discord.Client({fetchAllMembers: true, intents: ["GUILDS", "GUILD_MESSAGES"]});

let br = new BotRegistrar(client);
br.Register(new YanceyGangBot(client));
br.Register(new MirrorBot(client));
br.Register(new YanceyJunkBot(client));
br.Register(new ChatGPTBot(client));
// br.Register(new SentimentAnalysisBot(client));

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
    br.HandleMessage(msg);
});

client.login(process.env.BOT_TOKEN);
