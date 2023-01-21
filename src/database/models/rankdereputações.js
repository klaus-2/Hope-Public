const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const Rank_de_Reputações = mongoose.Schema({
  // Guild ID
  _id: reqString,
  channelId: reqString,
  msgID: reqString,
})

module.exports = mongoose.model('Rank-de-Reputações', Rank_de_Reputações)