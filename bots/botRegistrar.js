class BotRegistrar {
    constructor() {
        this.bots = new Map();
    }
    
    Register(bot) {
        if (!this.bots.has(bot.constructor.name)) {
            this.bots.set(bot.constructor.name, bot);
            console.log("Registered: ", bot.constructor.name);
        }
    }
    
    Unregister(bot) {
        if (this.bots.has(bot.constructor.name)) {
            this.bots.delete(bot.constructor.name);
            console.log("Unregistered: ", bot.constructor.name);
        }
    }
    
    HandleMessage(msg) {
        this.bots.forEach(bot => {
            try {
                if (typeof bot.HandleMessage == 'function') {
                    bot.HandleMessage(msg);
                }
            } catch (error) {
                console.error(`Error handling message in ${bot.constructor.name}:`, error);
            }
        });
    }
}

module.exports = BotRegistrar;