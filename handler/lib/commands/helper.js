const { b, m, i } = require('../../util/style');

/**
 * The bot's global prefix.
 */
const prefix = '!';

/**
 * Creates the requested return type object easily.
 */
const returnType = {
    /**
     * Object information for sending a reply.
     * @param {String} text The text you want to send as a reply.
     * @returns Object information for sending a reply.
     */
    reply: (text) => { return { type: 'reply', info: text } },
    /**
     * Object information for sending a text.
     * @param {String} text The text you want to send.
     * @returns Object information for sending a text.
     */
    text: (text) => { return { type: 'text', info: text } },
    /**
     * Object information for sending a text to the bot master.
     * @param {String} text the string of text.
     * @returns Object information for sending a text to the bot master.
     */
    sendMaster: (text) => { return { type: 'sendMaster', info: text } },
}

const help = {
    Owner: {
        addSender: `${b('Usage:')} ${prefix}addsender [group] [ID]\nAdd a number to the senders json file.`,
        removeSender: `${b('Usage:')} ${prefix}rmsender [group] [ID]\nRemove a number from the senders json file.\n${b('Aliases:')}\n[rmsender, rmvsender]`,
        kickAll: `${b('Usage:')} ${prefix}kickall\nKicks 🦶 all participants from the group.`,
        membersOf: `${b('Usage:')} ${prefix}membersof [group ID]\nGet a list of names from a specific group.`,
        ID: `${b('Usage:')} ${prefix}id\nGet a list of all group IDs that the bot is part of.\n${b('Aliases:')}\n[id, jid]`,
        tag: `${b('Usage:')} ${prefix}tag [number of tags] [@people]\nMass spam tag people with any amount of mentions.\n${b('⚠ WARNING! DO NOT ABUSE ⚠')}`,
        addForwarder: `${b('Usage:')} ${prefix}addforwarder [lang] OR in the bot's chat: ${prefix}addforwader [groupID] [lang]  (where lang is a language that is in the localizations.json file)`,
        removeForwarder: `${b('Usage:')} ${prefix}rmforwarder inside the forwarder OR in the bot's chat: ${prefix}rmforwader [groupID] (where groupID is the group you want to add to the forwarder)`,
        addGroupToForwarder: `${b('Usage:')} ${prefix}addgroupforwarder [groupID] inside the forwarder OR in the bot's chat: ${prefix}addgroupforwarder [forwarder groupID] [groupID] (where groupID is the group you want to add to the forwarder)\n${b('Aliases:')}\n[addgroupforwarder, addgf]`,
        removeGroupFromForwarder: `${b('Usage:')} ${prefix}rmgroupforwarder [lang] inside the forwarder OR in the bot's chat: ${prefix}rmgroupforwarder [forwarder groupID] [groupID] (where groupID is the group you want to remove from the forwarder)\n${b('Aliases:')}\n[rmgroupforwarder, rmgf]`,
        setLanguageForwarder: `${b('Usage:')} ${prefix}setlanguageforwarder [lang] inside the forwarder OR in the bot's chat: ${prefix}setlanguageforwarder [forwarder groupID] [lang] (where lang is a language that is in the localizations.json file)\n${b('Aliases:')}\n[setlanguageforwarder, slf]`,
        setMaxMsgsForwarder: `${b('Usage:')} ${prefix}setmaxmsgsforwarder [n] inside the forwarder OR in the bot's chat: ${prefix}setmaxmsgsforwarder [forwarder groupID] [n] (where n is a number that you want to set for the max amount of saved messages)\n${b('Aliases:')}\n[setmaxmsgsforwarder, smmf]`,
        setPrefixForwarder: `${b('Usage:')} ${prefix}setprefixforwarder [flag] inside the forwarder OR in the bot's chat: ${prefix}setprefixforwarder [forwarder groupID] [flag]\n${b('Options:')}\nPrefix message ON/OFF: -p/-prefix\nName in message ON/OFF: -n/-name\n${b('Aliases:')}\n[setprefixforwarder, spf]`,
    },
    Admin: {
        everyone: `${b('Usage:')} ${prefix}everyone\nTags everyone in the group.\n${b('Aliases:')}\n[everyone, tagall]`,
        kick: `${b('Usage:')} ${prefix}kick [@someone] or reply to a message sent by the user with ${prefix}kick\nKicks 🦶 a participant from the group.`,
    },
}

module.exports = {
    b, m, i,
    help,
    returnType,
    prefix
}