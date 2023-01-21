const { Schema, model } = require('mongoose');

const Sticky = Schema({
    channelID: {type: String, default: '00'},
    guildId: {type: String, default: null},
    embed: {
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
    msgCount: {type: Number, default: 5},
    enabled: {type: Boolean, default: false},
    msgId: {type: String, default: null},
});

module.exports = model('sticky', Sticky);