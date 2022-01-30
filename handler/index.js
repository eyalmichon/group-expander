const { Commands, prefix, errors } = require('./lib/commands');
const { b, m, i } = require('./util/style');
const { Forwarder } = require('./util/forwarder');
const fs = require('fs');
const path = require('path')
const configPath = path.join(__dirname, 'util/config.json');

// Check if config file exists.
if (!fs.existsSync(configPath)) {
    console.error(`Couldn't find config.json in ${configPath}, creating it...\n`)
    fs.writeFileSync(configPath, `{"botMaster":""}`)
    console.error(`Please go navigate into ${configPath} and fill in your number with its country's prefix inside the botMaster field.\n`)
    process.exit();
}
const { botMaster } = require('./util/config.json');
if (!botMaster) {
    console.error(`Please go navigate into ${configPath} and fill in your number inside the botMaster field.\n`)
    process.exit();
}

const commands = new Commands();
const myForwarder = new Forwarder()


/**
 * Delete a message after a certain time.
 * @param {*} object ogject of {client, waitMsg, from}
 * @param {*} time time in seconds.
 */
function delMsgAfter(object, time = 60) {
    setTimeout(() => object.client.deleteMessage(object.from, object.waitMsg, false), time * 1000);
}


/**
 * Forward messages to a group from specified groups.
 * @param {import('@open-wa/wa-automate').Client} client 
 * @param {import('@open-wa/wa-automate').Message} message 
 * @returns 
 */
const forwardHandler = async (client, message) => {
    const { id, from, sender, caption, quotedMsg, type, mentionedJidList } = message;
    // try to get the forwarder from the forwardDB.
    const forwarderObj = myForwarder.getForwarder(from);
    // get all group messages.
    const forwarderMsgs = myForwarder.getGroupMessages(from);
    // if the message doesn't have a sender or the group is not a forwarder, or already sent, return.
    if (!sender || !forwarderObj || !!forwarderMsgs[id]) return;
    // create object for id.
    forwarderMsgs[id] = {};
    // if mentioned, replace mentions with the names of the people mentioned in bold.
    if (!!mentionedJidList.length) {
        const mentionObjPromises = []
        mentionedJidList.forEach(mention => mentionObjPromises.push(client.getContact(mention)))
        const mentionsObj = await Promise.all(mentionObjPromises)
        // if returns null.
        if (!!mentionsObj[0])
            message.caption ? mentionsObj.forEach(obj => message.caption = message.caption.replace(/@\d*/, b(obj.pushname || obj.name))) :
                mentionsObj.forEach(obj => message.body = message.body.replace(/@\d*/, b(obj.pushname || obj.name)))
    }
    // if messages in DB are over the limit, delete the difference.
    if (forwarderObj.maxMsgs && myForwarder.getGroupMessagesLength(from) > forwarderObj.maxMsgs)
        // remove 20% of maxMsgs from the DB.
        myForwarder.removeMessages(from, forwarderObj.maxMsgs * 0.2)
    // boolean to check if messages is a quoted message.
    const isQuoted = !!quotedMsg;
    // if quoted, get all IDs for the relevant quoted message.
    const quotedReplyIDs = isQuoted ? forwarderMsgs[quotedMsg.id] : null

    const isAddMsg = (forwarderObj.isPrefixMsg || forwarderObj.isName)

    const name = sender.pushname || sender.formattedName;
    // beginning of message.
    let addedMsg = ``
    if (isAddMsg) {
        const addedMsgArr = []
        // if prefix needed add it.
        if (forwarderObj.isPrefixMsg) addedMsgArr.push(`${myForwarder.getPrefixMsg(forwarderObj.lang)}`)
        // if name needed add it.
        if (forwarderObj.isName) addedMsgArr.push(`${b(name)}`)
        addedMsg = addedMsgArr.join(' ') + ':'
    }

    // promise array for awaiting IDs later.
    const promiseMsgIDArray = []
    switch (type) {
        case 'chat':
            forwarderObj.groups.forEach(group => {
                !!quotedReplyIDs && !!quotedReplyIDs[group] ? promiseMsgIDArray.push(client.reply(group, (isAddMsg) ? [addedMsg, message.body].join('\n\n') : message.body, quotedReplyIDs[group])) :
                    promiseMsgIDArray.push(client.sendText(group, (isAddMsg) ? [addedMsg, message.body].join('\n\n') : message.body))
            })
            break;
        case 'image':
        case 'video':
            let media = await client.decryptMedia(message)
            forwarderObj.groups.forEach(group => promiseMsgIDArray.push(client.sendFile(group, media, '', (isAddMsg) ? (!!caption ? [addedMsg, caption].join('\n\n') : addedMsg) : '', !!quotedReplyIDs && !!quotedReplyIDs[group] ? quotedReplyIDs[group] : null, true)))
            break;
        case 'sticker':
        case 'ptt':
        case 'audio':
        case 'document':
        case 'vcard':
        case 'location':
            forwarderObj.groups.forEach(async group => {
                const msg = await client.forwardMessages(group, message.id)
                promiseMsgIDArray.push(msg[0])
                client.reply(group, (isAddMsg) ? addedMsg : '', !!quotedReplyIDs && !!quotedReplyIDs[group] ? quotedReplyIDs[group] : msg[0])
            })
            break;
    }
    // wait for all messages to get an ID
    const msgIDArray = await Promise.all(promiseMsgIDArray)

    const msgIDObject = {}
    forwarderObj.groups.forEach((group, i) => msgIDObject[group] = msgIDArray[i])
    // add all message IDs sent to this messages.
    forwarderMsgs[id] = msgIDObject
    // for each group add the forwarded message as an object with the other messages associated with it as its objects.
    forwarderObj.groups.forEach(group => {
        const groupObj = myForwarder.getForwarder(group);
        if (!!groupObj) {
            // if messages in DB are over the limit, delete the difference.
            if (groupObj.maxMsgs && myForwarder.getGroupMessagesLength(group) > groupObj.maxMsgs)
                // remove 20% of maxMsgs from the DB.
                myForwarder.removeMessages(group, groupObj.maxMsgs * 0.2)

            const msgObject = {}
            msgObject[from] = id;
            groupObj.groups.forEach(group => {
                if (group != from)
                    msgObject[group] = msgIDObject[group]
            })
            // add all ids to the group by the message id of that group
            myForwarder.getGroupMessages(group)[msgIDObject[group]] = msgObject;
        }
    })

    myForwarder.writeToMessagesDB();
}

/**
 * Handles message on arrival.
 * 
 * @param {import('@open-wa/wa-automate').Client} client the wa-automate client.
 * @param {import('@open-wa/wa-automate').Message} message the message object.
 * @returns 
 */
const msgHandler = async (client, message) => {
    const { id, from, sender, isGroupMsg, chat, caption, quotedMsg } = message;
    let { body } = message;
    // if we don't send anything mark the chat as seen so we don't get it again on the next startup.
    await client.sendSeen(from);


    // split the body content into args.
    message.args = body.trim().split(/ +/);
    // get the command from the body sent.
    const command = message.args.shift().slice(1).toLowerCase();
    // add all content in quoted message to the args if it's not null.
    if (quotedMsg && quotedMsg.type === 'chat')
        message.args.push(...(quotedMsg.body.trim().replace(/\n+/g, ' ').split(/ +/)))
    // Bot's number.
    message.botNumber = await client.getHostNumber() + '@c.us';
    // if is a group message get the group admins
    message.groupAdmins = isGroupMsg ? await client.getGroupAdmins(from) : '';
    // check if the sender is a group admin.
    message.isGroupAdmin = message.groupAdmins.includes(sender.id) || false;
    // if is a group message get the group members
    message.groupMembers = isGroupMsg ? await client.getGroupMembersId(from) : '';
    // Add botMaster to message object.
    message.botMaster = botMaster;
    // Return if not group admin or owner.
    if (!sender
        || (!body)
        || (!body.startsWith(prefix) && (!caption || !(body = caption).startsWith(prefix)))
        || (!message.isGroupAdmin && sender.id !== message.botMaster))
        return;

    let result = {};
    let waitMsg = null;
    switch (commands.type(command)) {
        case 'Help':
            // for a command help.
            if (args[0]) {
                if (commands.type(args[0].toLowerCase()))
                    result = { type: 'reply', info: await commands.help(args[0].toLowerCase()) };
            }
            // for help.
            else {
                result = await commands.execute(command);
            }
            break;
        // Owner commands.
        case 'Owner':
            if (sender.id !== botMaster) break;
            message.myForwarder = myForwarder;
            result = await commands.execute(command, message, client);
            break;
        // Admin Commands.
        case 'Admin':
            if (!isGroupMsg) break;
            if (!message.isGroupAdmin) break
            result = await commands.execute(command, message, client);
            break;
        default:
            return;
    }

    waitMsg = await waitMsg

    if (!result || !result.info)
        result = errors.BAD_CMD

    switch (result.type) {
        case 'reply':
            await client.reply(from, result.info, id);
            break;
        case 'text':
            await client.sendText(from, result.info);
            break;
        case 'sendMaster':
            await client.sendText(botMaster, result.info);
            break;
        default:
            break;
    }

    if (!!waitMsg) delMsgAfter({ client, waitMsg, from }, 1)

}

module.exports = { msgHandler, forwardHandler }