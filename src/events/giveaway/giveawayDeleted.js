// Dependencies
const	Event = require('../../structures/Event');

class GiveawayDeleted extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			child: 'giveawaysManager',
		});
	}

// Exec event
	async run(bot, giveaway) {
		if (bot.config.debug) bot.logger.debug(`Giveaway was deleted in ${giveaway.guild.id}.`);


	}
}

module.exports = GiveawayDeleted;