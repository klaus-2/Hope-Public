const { Schema, model } = require('mongoose');

const reactionRoleEmbed = Schema({
	rrembed_sID: { type: String, default: null },
	PlainMessage: { type: String, default: 'React here to get your roles!' },
	EmbedToggle: { type: Boolean, default: 'false' },
	embedRR: {
		title: { type: String, default: `Hello!` },
		titleURL: { type: String, default: `` },
		description: { type: String, default: `React here to get your roles!` },
		footer: { type: String, default: `` },
		footerIcon: { type: String, default: `` },
		color: { type: String, default: `#000000` },
		timestamp: { type: String, default: false },
		thumbnail: { type: String, default: `` },
		image: { type: String, default: `` },
		author: {
			name: { type: String, default: `` },
			url: { type: String, default: `` },
			icon: { type: String, default: `` },
		},
	},
});

module.exports = model('rrEmbed', reactionRoleEmbed);