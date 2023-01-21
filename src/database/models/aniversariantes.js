const { Schema, model } = require('mongoose');

const AniversariantesSchema = Schema({
    userID: String,
    guildID: String,
    timezone: { type: String, default: null},
    birthday: { type: Date, default: null},
});

module.exports = model('Aniversariantes', AniversariantesSchema);