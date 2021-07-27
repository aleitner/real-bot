class YanceyGangBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) { 
        if (!msg.channel.name.includes("yanceygang")) {
            return
        }

        if (msg.content.includes('<#'+msg.channel.id+'>')) {
            return
        }

        msg.delete(1000)
    }

}

module.exports = YanceyGangBot;