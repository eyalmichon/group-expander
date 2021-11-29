const { b, m, i, help } = require("./helper");
const { errors } = require('./errors');

class Admin {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Admin', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands) {
        commands.everyone = this.addInfo(this.everyone)
        commands.tagall = this.alias(this.everyone)

        commands.kick = this.addInfo(this.kick)
    }
    everyone = {
        func: (object, client) => {
            const { groupMembers, botNumber } = object;
            let mentionlist = [];
            groupMembers
                .filter(member => member !== message.sender.id && member !== botNumber)
                .forEach(member => {
                    mentionlist.push(`@${member.replace('@c.us', '')}`)
                });
            client.sendTextWithMentions(message.from, mentionlist.join(' '))
            return { info: true };
        },
        help: () => help.Admin.everyone
    }

    kick = {
        func: (object, client) => {
            const { quotedMsg, from, mentionedJidList } = object;

            if (quotedMsg !== null)
                client.removeParticipant(from, quotedMsg.sender.id);

            mentionedJidList.forEach(member => {
                client.removeParticipant(from, member);
            })
            return { info: true };
        },
        help: () => help.Admin.kick
    }
}

module.exports = { Admin }