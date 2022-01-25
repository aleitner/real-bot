class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        if (msg.content != "!translate" && msg.hasOwnProperty('reference')) {
            // return
        }

        // Get repliedTo
        const repliedTo = await msg.channel.messages.fetch(msg.reference.messageID);
        var newMessage = repliedTo.content.replace(/[^A-Z0-9]+/ig, " ");

        console.log(repliedTo.content)
        // msg.reply(`What <@${repliedTo.author.id}> might be trying to say is \n"${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;