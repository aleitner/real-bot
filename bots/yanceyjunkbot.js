class YanceyJunkBot {

    constructor (client) {
        this.client = client
    }

    async HandleMessage(msg) {
        if (msg.content != "!translate") {
            // return
        }

        msg.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
          })
          // not the same; from awaitMessages() instead
          .then(originalMsg => {
            originalMsg = originalMsg.first()
            var newMessage = originalMsg.content.replace(/[^A-Z0-9]+/ig, " ");

            console.log(newMessage)

          })
        // msg.reply(`What <@${msg.author.id}> might be trying to say is \n"${newMessage}".`)
    }
}

module.exports = YanceyJunkBot;