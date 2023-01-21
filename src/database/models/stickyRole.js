const { Schema, model } = require('mongoose');

const stickyRole = Schema({
    _id: String,
    stickyroleID: { type: Array, default: null },
    stickyroleToggle: { type: Boolean, default: false },
    stickyroleUser: { type: Array, default: null },
});

module.exports = model('stickyRole', stickyRole);