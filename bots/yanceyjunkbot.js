class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        var newMessage = msg.content.replace(/[^A-Z0-9]+/ig, " ");
        console.log(newMessage, newMessage.length, msg.content.length, newMessage.length/msg.content.length, 2/3)
        if (newMessage.length/msg.content.length > 2/3) {
            return
        }

        // msg.channel.send(`What <@${msg.author.id}> might be trying to say is \n"${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;