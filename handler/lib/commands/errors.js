const { b, m, i, prefix } = require("./helper");

const addType = (error) => {
    return { type: 'reply', info: error };
}

const errors = {
    OWNER: addType(`📛 Error, this command can only be used by the bot master!`),
    ADMIN: addType(`📛 Error, this command can only be used by group admins!`),
    GROUP: addType(`📛 Error, this command can only be used within a group!`),
    WRONG_ID: addType(`📛 Error, ID entered was incorrect!`),
    UNKNOWN: addType(`📛 An unknown error has occurred.`),
}

module.exports = { errors }