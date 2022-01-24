class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        var newMessage = msg.content.replace(/[^A-Z0-9]+/ig, " ");
        console.log(newMessage)
        if (newMessage.length < msg.length*2/3) {
            return
        }

        // msg.channel.send(`What <@${msg.author.id}> might be trying to say is \nz"${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;