const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    toMention: { type: String, required: true },
    timeStamp:{ type: Number, require:true },
    timelenght:{ type: Number, require:true },
    message:{ type: String, require:true, default: "You are being reminded!" },
    guildName:{type: String, required:false, default:"Not available"},
    guildID: { type: String, required: true },
});

const MessageModel = module.exports = mongoose.model('reminders', MessageSchema);