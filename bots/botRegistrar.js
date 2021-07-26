class BotRegistrar {
    constructor() {
        this.bots = [];
    }

    Register(bot) {
        if (this.bots.some(registeredBot => registeredBot.constructor.name === bot.constructor.name)) {
            return
        }

        this.bots.push(bot);

        console.log("Registered: ", bot.constructor.name)
    }

    HandleMessage(msg) {
        this.bots.forEach(bot => {

            if(typeof bot.HandleMessage == 'function') {
                bot.HandleMessage(msg);
            }
        });
    }
}

module.exports = BotRegistrar;