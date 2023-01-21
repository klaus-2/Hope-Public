const { Schema, model } = require('mongoose');

const ticketEmbedSchema = Schema({
	tembed_sID: { type: String, default: null },
	ticketReactChannel: { type: String, default: null },
	messageID: { type: Array, default: [] },
	supportRoleID: { type: String, default: null },
	categoryID: { type: String, default: null },
	voiceID: { type: String, default: null },
	authorID: { type: String, default: null },
	ticketModlogID: { type: String, default: null },
	ticketType: { type: String, default: 'message' },
	ticketNameType: { type: Number, default: '1' },
	reactionType: { type: Number, default: '1' },
	ticketCase: { type: Number, default: '1' },
	maxTicket: { type: Number, default: '1' },
	ticketToggle: { type: Boolean, default: false },
	ticketAdditionalMessage: { type: Boolean, default: false },
	AdditionalMessage: { type: String, default: null },
	jsonCode: { type: String, default: null },
	ticketClose: { type: Boolean, default: false },
	ticketPing: { type: Boolean, default: false },
	requireReason: { type: Boolean, default: true },
	ticketCustom: { type: Boolean, default: "false" },
	embedticket: {
		title: { type: String, default: null },
		titleURL: { type: String, default: null },
		description: { type: String, default: null },
		footer: { type: String, default: null },
		footerIcon: { type: String, default: null },
		color: { type: Number, default: null },
		timestamp: { type: String, default: false },
		thumbnail: { type: String, default: null },
		image: { type: String, default: null },
		author: {
			name: { type: String, default: null },
			url: { type: String, default: null },
			icon: { type: String, default: null },
		},
	},
	ticketembed: {
		title: { type: String, default: null },
		titleURL: { type: String, default: null },
		description: { type: String, default: null },
		footer: { type: String, default: null },
		footerIcon: { type: String, default: null },
		color: { type: Number, default: null },
		timestamp: { type: String, default: false },
		thumbnail: { type: String, default: null },
		image: { type: String, default: null },
		author: {
			name: { type: String, default: null },
			url: { type: String, default: null },
			icon: { type: String, default: null },
		},
		Emoji: { type: String, default: null },
		EmojiID: { type: String, default: null },
		BotãoTexto: { type: String, default: null },
		ticketTimestamp: { type: Boolean, default: false },
	},
});

module.exports = model('ticketEmbed', ticketEmbedSchema);