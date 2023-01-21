const { Schema, model } = require('mongoose');

const actionLog = Schema({
    guildID: {type: String, default: '864193088548634685'},
    action: {type: String, default: 'Teste de ação blabla 123 XD...'},
    userID: {type: String, default: 'Klaus#1565'},
    userTag: {type: String, default: 'Klaus#1565'},
    userAvatar: {type: String, default: 'Klaus#1565'},
    data: {type: Date, default: '01/05/2020'},
});

module.exports = model('actionlog', actionLog);