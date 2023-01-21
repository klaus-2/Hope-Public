const { Schema, model } = require('mongoose');

const ticketReação = Schema({
	messageID: String,
	channelID: String,
	guildID: String,
});

module.exports = model('ticketReação', ticketReação);