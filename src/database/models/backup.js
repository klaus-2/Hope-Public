const { Schema, model } = require('mongoose');

const backup = Schema({
    userID: { type: String, default: null },
    guildName: { type: String, default: null },
    guildID: { type: String, default: null },
    code: { type: String, default: 0 },
    emojis: { type: Array, default: [] },
});

module.exports = model('backup', backup);