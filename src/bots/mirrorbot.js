let sh = require("shorthash");

class MirrorBot {

    constructor (client) {
        this.client = client
    }

    getHelpText() {
        return {
            mirror: 'Type: Mirror mirror on the wall, who\'s <your_message> of us all.',
        };
    }

    getRequiredRoles() {
        return []; // No required roles by default
    }

    async HandleMessage(msg) {
        let whoRegEx = /^(m|M)irror (m|M)irror on the wall,? who(.+) of (them |us |\w?)?all/;

        let found = msg.content.match(whoRegEx);

        if (found !== null && found.length >= 4) {
    
            // description is the text that describes the person
            let description = found[3]

            // Deterministic user by hashing the description
            let id = String2Hex(sh.unique(description.toLowerCase())).replace(/\D/g, '');
            const list = this.client.guilds.get(msg.guild.id).members.filter(member => !member.user.bot)
            var memberCount = list.size
            let user = id % memberCount;

            let count = 0;
            list.forEach(function (member, key, map) {
                count++;
                if (user != (count-1)) {
                    return;
                }
                // msg.channel.send('<@'+member.user.id+'>'+description+' of them all')
                msg.channel.send(member.user.username+description+' of them all')

                console.log('[MirrorBot] '+member.user.username+description+' of them all')
            })
        }
    }
}

function String2Hex(tmp) {
    let str = '';
    for (let i = 0; i < tmp.length; i++) {
        str += tmp[i].charCodeAt(0).toString(16);
    }
    return str;
}

module.exports = MirrorBot;