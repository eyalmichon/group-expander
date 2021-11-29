const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { parse } = require("../../util/parser");

class Owner {

    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Owner', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands) {
        commands.addforwarder = this.addInfo(this.addForwarder)

        commands.rmforwarder = this.addInfo(this.removeForwarder)

        commands.addgroupforwarder = this.addInfo(this.addGroupToForwarder)
        commands.addgf = this.alias(this.addGroupToForwarder)

        commands.rmgroupforwarder = this.addInfo(this.removeGroupFromForwarder)
        commands.rmgf = this.alias(this.removeGroupFromForwarder)

        commands.setlanguageforwarder = this.addInfo(this.setLanguageForwarder)
        commands.slf = this.alias(this.setLanguageForwarder)

        commands.setmaxmsgsforwarder = this.addInfo(this.setMaxMsgsForwarder)
        commands.smmf = this.alias(this.setMaxMsgsForwarder)

        commands.setprefixforwarder = this.addInfo(this.setPrefixForwarder)
        commands.spf = this.alias(this.setPrefixForwarder)

        commands.kickall = this.addInfo(this.kickAll);

        commands.id = this.addInfo(this.chatIDs);
        commands.jid = this.alias(this.chatIDs);
        commands.chatids = this.alias(this.chatIDs);

        commands.tag = this.addInfo(this.tag);
    }

    addForwarder = {
        func: (object) => {
            const { myForwarder, from, args } = object;
            // get the language from args[0] if args[1] is empty
            let lang = args[1] || args[0];
            // if args[1] is empty, get group ID from 'from'
            let groupID = !!args[1] ? args[0] : from;
            let text = '';
            if (myForwarder.addForwarder(groupID, lang))
                text = `📧 Forwarder has been ${b('added')} to forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.addForwarder
    }
    removeForwarder = {
        func: (object) => {
            const { myForwarder, from, args } = object;
            // if args[0] is empty, get group ID from 'from'
            let groupID = !!args[0] ? args[0] : from;
            let text = '';
            if (myForwarder.removeForwarder(groupID))
                text = `📧 Forwarder has been ${b('removed')} from forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.removeForwarder
    }
    addGroupToForwarder = {
        func: (object) => {
            const { myForwarder, from, args } = object;
            // get the group from args[0] if args[1] is empty
            let groupID = args[1] || args[0];
            // if args[1] is empty, get group ID from 'from'
            let forwarder = !!args[1] ? args[0] : from;
            let text = '';
            if (myForwarder.addGroup(forwarder, groupID))
                text = `📧 Group has been ${b('added')} to ${forwarder} in forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.addGroupToForwarder
    }
    removeGroupFromForwarder = {
        func: (object) => {
            const { myForwarder, from, args } = object;
            // get the group from args[0] if args[1] is empty
            let groupID = args[1] || args[0];
            // if args[1] is empty, get group ID from 'from'
            let forwarder = !!args[1] ? args[0] : from;
            let text = '';
            if (myForwarder.removeGroup(forwarder, groupID))
                text = `📧 Group has been ${b('removed')} from ${forwarder} in forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.removeGroupFromForwarder
    }
    setLanguageForwarder = {
        func: (object) => {
            const { myForwarder, from, args } = object;
            // get the language from args[0] if args[1] is empty
            let lang = args[1] || args[0];
            // if args[1] is empty, get group ID from 'from'
            let forwarder = !!args[1] ? args[0] : from;
            let text = '';
            if (myForwarder.setLanguage(forwarder, lang))
                text = `📧 Group language has been ${b('set')} to ${lang} for ${forwarder} in forwardDB`;
            else
                text = `📛 Language given "${lang}" or Forwarder "${forwarder} were ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.setLanguageForwarder
    }
    setMaxMsgsForwarder = {
        func: (object) => {
            const { myForwarder, from, args } = object;
            // get the language from args[0] if args[1] is empty
            let n = args[1] || args[0];
            // if args[1] is empty, get group ID from 'from'
            let forwarder = !!args[1] ? args[0] : from;
            let text = '';
            if (myForwarder.setMaxMsgs(forwarder, n))
                text = `📧 Group maxMsgs has been ${b('set')} to ${n} for ${forwarder} in forwardDB`;
            else
                text = `📛 maxMsgs number given "${n}" or Forwarder "${forwarder} were ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.setMaxMsgsForwarder
    }

    setPrefixForwarder = {
        func: (object) => {
            const { myForwarder, from, args } = object;
            const options = parse(args);

            // if args[0] is empty, get group ID from 'from'
            let forwarder = options.joinedText || from;

            let result = '';
            if (options.prefix || options.p)
                result = myForwarder.setPrefixMsgBool(forwarder)
            else if (options.name || options.n)
                result = myForwarder.setNameBool(forwarder)

            let text = '';
            if (result)
                text = `📧 Group prefix message has been ${b('changed')} for ${forwarder} in forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.setPrefixForwarder
    }

    kickAll = {
        func: (object, client) => {
            const { groupMembers, from, botMaster, botNumber, args } = object;
            const options = parse(args);
            // must provide in joinedText `I understand that this command will kick everyone`
            if (options.joinedText === `I understand that this command will kick everyone` && groupMembers) {

                groupMembers.filter(member => member !== botMaster && member !== botNumber).forEach(member => {
                    client.removeParticipant(from, member);
                })
                return { info: true };
            }
            else
                return errors.GROUP;
        },
        help: () => help.Owner.kickAll
    }


    chatIDs = {
        func: (object, client) => {
            const { args } = object;
            const options = parse(args);
            let all = !!options.a || !!options.all;

            return client.getAllChatIds()
                .then(async ids => {
                    const chatIDsPromises = [];
                    if (all)
                        ids.forEach(id => chatIDsPromises.push(client.getChatById(id).then(chatObject => (`${chatObject.formattedTitle}\n${id}`))))
                    else
                        ids.forEach(id => chatIDsPromises.push(client.getChatById(id).then(chatObject => chatObject.isGroup ? (`${chatObject.formattedTitle}\n${id}`) : undefined)))
                    return await Promise.all(chatIDsPromises)
                })
                .then(res => {
                    return returnType.sendMaster(res.filter(item => item !== undefined).join('\n'));
                })
        },
        help: () => help.Owner.ID
    }

    tag = {
        func: (object, client) => {
            const { mentionedJidList, from, args } = object;
            let n = args[0]
            let tagList = [];

            mentionedJidList.forEach(mentioned => {
                tagList.push(`@${mentioned.replace('@c.us', '')}`)
            });
            let tagText = tagList.join(' ');
            for (let i = 0; i < n; i++) {
                client.sendTextWithMentions(from, tagText);
            }
            return { info: true };
        },
        help: () => help.Owner.tag
    }

}

module.exports = { Owner }