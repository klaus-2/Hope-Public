// Dependencies
const Event = require('../../structures/Event'),
	{ EmbedBuilder } = require('discord.js');

module.exports = class RateLimit extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			child: 'rest',
		});
	}

	// Exec event
	async run(bot, { route, timeout, limit }) {
		bot.logger.error(`Rate limit: ${route} (Cooldown: ${timeout}ms)`);

		const embed = new EmbedBuilder()
			.setTitle('RateLimit hit')
			.addField('Path', route)
			.addField('Limit', `${limit}`, true)
			.addField('Cooldown', `${timeout}ms`, true)
			.setTimestamp();

		const modChannel = await bot.channels.fetch(bot.config.rateLimitChannelID).catch(() => bot.logger.error('Error fetching rate limit logging channel'));
		if (modChannel) bot.addEmbed(modChannel.id, [embed]);
	}
};
