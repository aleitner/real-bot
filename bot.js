const Discord = require('discord.js');
const BotRegistrar = require('./bots/botRegistrar');
const YanceyGangBot = require('./bots/yanceygangbot');
const MirrorBot = require('./bots/mirrorbot');
const DadBot = require('./bots/dadbot');

let br = new BotRegistrar();
br.Register(new YanceyGangBot());
br.Register(new MirrorBot());
br.Register(new DadBot());

// Initialize Discord Bot
var client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    console.log("Received message: ", msg.content)
    
    br.HandleMessage(msg);
});

client.login(process.env.BOT_TOKEN);

