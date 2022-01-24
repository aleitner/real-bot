class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        var newMessage = msg.replace(/[^A-Z0-9]+/ig, " ");
        if (newMessage.length < msg.length*2/3 && msg[0] != ':') {
            return
        }

        msg.channel.send(`What Yancey might be trying to say is "${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;