class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        if (msg.content != "!translate") {
            // return
        }

        console.log(msg.reference)

        const originalMsg = await msg.channel.messages.fetch(msg.reference.messageID);

        console.log(originalMsg.content)
        
        var newMessage = msg.content.replace(/[^A-Z0-9]+/ig, " ");

        // msg.channel.send(`What <@${msg.author.id}> might be trying to say is \n"${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;