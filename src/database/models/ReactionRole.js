const { Schema, model } = require('mongoose');

const reactionRoleSchema = Schema({
	guildID: String,
	messageID: String,
	channelID: String,
	reactions: Array,
	buttons: Array,
	dropdowns: Array,
	dm: Boolean,
	option: Number,
});

module.exports = model('ReactionRole', reactionRoleSchema);
