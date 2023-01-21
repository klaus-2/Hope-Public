const { Schema, model } = require('mongoose');

const autoAnimeSchema = Schema({
    _id: String,
    enabled: { type: Boolean, default: false },
    channelID: { type: String, default: null },
    animes: { type: Array, default: null },
    finalizados: { type: Array, default: null },
    roleNotify: { type: String, default: null },
});

module.exports = model('AutoAnime', autoAnimeSchema);