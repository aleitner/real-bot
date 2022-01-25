class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        if (msg.content != "!translate") {
            return
        }

        if (!msg.hasOwnProperty('reference')) {
            return
        }


        console.log(msg.reference.messageID)

        // Get repliedTo
        const repliedTo = await msg.channel.messages.fetch(msg.reference.messageID);
        console.log(repliedTo[msg.reference.messageID])

        var newMessage = repliedTo.content.replace(/[^A-Z0-9]+/ig, " ");
        // msg.reply(`What <@${repliedTo.author.id}> might be trying to say is \n"${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;