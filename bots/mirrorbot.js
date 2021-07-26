let sh = require("shorthash");

class MirrorBot {

    HandleMessage(msg) {
        let whoRegEx = /^(m|M)irror (m|M)irror on the wall,? who(.+) of (them |us |\w?)?all/;

        let found = msg.content.match(whoRegEx);
        if (found !== null && found.length >= 4) {
    
            let description = found[3]
            let id = String2Hex(sh.unique(description.toLowerCase())).replace(/\D/g, '');
            let count = 0;
            let user = id % msg.guild.memberCount;
    
            msg.guild.members.forEach(function (value, key, map) {
                count++;
                if (user != (count-1)) {
                    return;
                }
    
                msg.channel.send('<@'+value.user.id+'>'+description+' of them all')
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