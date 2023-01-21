const { Schema, model } = require('mongoose');

const newsDB = Schema({
    id: {type: String, default: "Hope"},
    newsTitle: {type: String, default: null},
    newsShort: {type: String, default: null},
    newsFull: {type: String, default: null},
    newsTag: {type: String, default: null},
    newsIcon: {type: String, default: null},
    newsLink: {type: String, default: null},
    date: {type: Date, default: null},
});

module.exports = model('newsDB', newsDB);