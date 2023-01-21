const { Schema, model } = require('mongoose');

const AutoRedditSchema = Schema({
	bestbot: { type: String, default: 'Hope' },
	subredditName: String,
	channelIDs: Array,
});

module.exports = model('AutoReddit', AutoRedditSchema);