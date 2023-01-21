const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const sugestõesSchema = mongoose.Schema({
  // Guild ID
  _id: reqString,
  channelId: reqString,
})

module.exports = mongoose.model('sugestões', sugestõesSchema)