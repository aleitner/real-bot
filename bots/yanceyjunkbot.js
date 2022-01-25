class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        if (msg.content != "!translate") {
            // return
        }

        const repliedTo = await msg.channel.messages.fetch(message.reference.messageID);
        console.log(repliedTo.content)
        var newMessage = repliedTo.content.replace(/[^A-Z0-9]+/ig, " ");

        // msg.channel.send(`What <@${msg.author.id}> might be trying to say is \n"${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;