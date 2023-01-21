const { Schema, model } = require('mongoose');

const VoteStatsSchema = Schema({
    _id: String,
    topgg: { type: Number, default: null },
    vdb: { type: Number, default: null },
    dbl: { type: Number, default: null },
    lastVote: { type: Number, default: null },
    totalVotes: { type: Number, default: false },
});

module.exports = model('Votos', VoteStatsSchema);