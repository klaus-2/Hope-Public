const { Schema, model } = require('mongoose');

const rankSchema = Schema({
	userID: { type: String, default: null },
	guildID: { type: String, default: null },
	Xp: { type: Number, default: 0 },
	Level: { type: Number, default: 1 },
	saldo: {
		carteira: { type: Number, default: 0 },
		banco: { type: Number, default: 0 },
	},
	economia: {
		streak: {
			alltime: { type: Number, default: 0 },
			atual: { type: Number, default: 0 },
		},
		shard: { type: Number, default: null }
	},
});

module.exports = model('Ranks', rankSchema);
