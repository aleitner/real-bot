class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        const yanceyId = '636380640199049229'

        // If message not from yancey return
        if (msg.author.id != yanceyId) {
            return
        }

        var newMessage = msg.replace(/[^A-Z0-9]+/ig, " ");

        msg.channel.send(`What Yancey might be trying to say is "${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;