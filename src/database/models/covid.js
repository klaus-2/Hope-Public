const { Schema, model } = require('mongoose');

const Covid = Schema({
     _id: {type: String, default: null},
    channelID: {type: String, default: null},
    enabled: {type: Boolean, default: false},
    msgId: {type: String, default: null},
});

module.exports = model('autoCovid', Covid);
