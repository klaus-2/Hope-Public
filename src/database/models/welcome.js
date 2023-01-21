const { Schema, model } = require('mongoose');

const welcomeSchema = Schema({
	_id: String,
	// WELCOME SETTINGS
	welcomeToggle: { type: Boolean, default: false },
	welcomeChannel: { type: String, default: '00' },
	welcomePrivateToggle: { type: Boolean, default: false },
	// WELCOME MESSAGE SETTINGS
	welcomeNotifyMention: { type: Boolean, default: false },
	messageType: { type: String, default: 'message' }, // < message | embed | image >
	// IF MESSAGE
	welcomeMessageText: { type: String, default: 'Hello {user_name}, Welcome to **{guild}**!' },
	// IF EMBED
	welcomeEmbed: {
		title: { type: String, default: null },
		titleURL: { type: String, default: null },
		description: { type: String, default: null },
		footer: { type: String, default: null },
		footerIcon: { type: String, default: null },
		color: { type: String, default: null },
		timestamp: { type: Boolean, default: false },
		thumbnail: { type: String, default: null },
		image: { type: String, default: null },
		author: {
			name: { type: String, default: null },
			url: { type: String, default: null },
			icon: { type: String, default: null },
		},
	},
	// IF IMAGE
	welcomeImageTitle: { type: String, default: '{userName} just joined the server' },
	welcomeImageSub: { type: String, default: 'Member #{number}' },
	welcomeImageModel: { type: String, default: null },
	welcomeImageColor: { type: String, default: '../../cards/card1.png' },
	welcomeImageTextColor: { type: String, default: null },
	welcomeImageTextFont: { type: String, default: null },
	// LEAVE SETTINGS
	leaveToggle: { type: Boolean, default: false },
	leaveChannel: { type: String, default: '00' },
	leavePrivateToggle: { type: Boolean, default: false },
	// LEAVE MESSAGE SETTINGS
	leaveNotifyMention: { type: Boolean, default: false },
	leaveMessageType: { type: String, default: 'message' }, // < message | embed | image >
	// IF MESSAGE
	leaveMessageText: { type: String, default: 'Hello {user_name}, Welcome to **{guild}**!' },
	// IF EMBED
	leaveEmbed: {
		title: { type: String, default: null },
		titleURL: { type: String, default: null },
		description: { type: String, default: null },
		footer: { type: String, default: null },
		footerIcon: { type: String, default: null },
		color: { type: String, default: null },
		timestamp: { type: Boolean, default: false },
		thumbnail: { type: String, default: null },
		image: { type: String, default: null },
		author: {
			name: { type: String, default: null },
			url: { type: String, default: null },
			icon: { type: String, default: null },
		},
	},
	// IF IMAGE
	leaveImageTitle: { type: String, default: '{userName} just joined the server' },
	leaveImageSub: { type: String, default: 'Member #{number}' },
	leaveImageModel: { type: String, default: null },
	leaveImageColor: { type: String, default: null },
	leaveImageTextColor: { type: String, default: null },
	leaveImageTextFont: { type: String, default: null },
	// EXTRA
	leaves: { type: Array, default: [] },
});

module.exports = model('welcomeAddon', welcomeSchema);