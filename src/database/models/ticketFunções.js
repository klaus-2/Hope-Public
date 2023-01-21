const { Schema, model } = require('mongoose');

const ticketFunçõesSchema = Schema({
	messageID: String,
	channelID: String,
	guildID: String,
	voiceID: String,
	authorID: String,
	tag: String,
	discriminator: String,
	ticketNameType: Number,
	ticketCase: Number,
});

module.exports = model('ticketFunções', ticketFunçõesSchema);