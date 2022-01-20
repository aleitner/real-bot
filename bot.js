const Discord = require('discord.js');
const BotRegistrar = require('./bots/botRegistrar');
const YanceyGangBot = require('./bots/yanceygangbot');
const MirrorBot = require('./bots/mirrorbot');
const YanceyJunkBot = require('./bots/yanceyjunkbot');
// const SentimentAnalysisBot = require('./bots/sentimentanalysisbot');

// Initialize Discord Bot
var client = new Discord.Client({fetchAllMembers: true});

let br = new BotRegistrar(client);
br.Register(new YanceyGangBot(client));
br.Register(new MirrorBot(client));
br.Register(new YanceyJunkBot(client));
// br.Register(new SentimentAnalysisBot(client));


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    br.HandleMessage(msg);
});

client.login(process.env.BOT_TOKEN);
