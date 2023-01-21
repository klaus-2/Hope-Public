const { Schema, model } = require('mongoose')

const Marry = Schema({
    _id: Schema.Types.ObjectId,
    persons: Array,
    time: String,
})

module.exports = model('Marry', Marry)