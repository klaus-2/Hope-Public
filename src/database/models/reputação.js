const { Schema, model } = require('mongoose');

const Reputação = Schema({
	userID: {type: String, default: null},
	guildID: {type: String, default: null},
	recebido: {type: Number, default: 0},
    ultimoRep: {type: Date, default: null},
});

module.exports = model('reputação', Reputação);