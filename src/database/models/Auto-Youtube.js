const { Schema, model } = require('mongoose');

const autoYoutubeSchema = Schema({
    _id: String,
    enabled: { type: Boolean, default: false },
    channelID: { type: String, default: null },
    canais: { type: Array, default: null },
    lastVideoID: { type: Array, default: null },
    customMsg: { type: String, default: null },
});

module.exports = model('AutoYoutube', autoYoutubeSchema);