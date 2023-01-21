// Dependências
const { Embed } = require(`../../utils`),
	Event = require('../../structures/Event');

module.exports = class ticketClose extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			child: 'giveawaysManager',
		});
	}

	// Exec event
	async run(bot, giveaway, winners) {
		if (bot.config.debug) bot.logger.debug(`Giveaway just ended in guild: ${giveaway.guildID} with winners: ${winners.map(m => m.user.id)}.`);

		// DM members that they have wona
		winners.forEach(async (member) => {
			try {
				// Get server settings / if no settings then return
				const settings = member.guild.settings;
				if (Object.keys(settings).length == 0) return;

				const embed = new Embed(bot, member.guild)
					.setAuthor({ name: `${member.guild.translate('Events/giveawayEnded:FIMSORTEIO', { guild: member.guild.name })}`, iconURL: member.user.displayAvatarURL() })
					.setThumbnail(bot.guilds.cache.get(giveaway.guildId).iconURL())
					.setColor('#4bd37b')
					.setDescription([
						`${member.guild.translate('Events/giveawayEnded:FIMSORTEIO1')} \`${giveaway.prize}\`.`,
						`${member.guild.translate('Events/giveawayEnded:FIMSORTEIO2')} [link](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}).`,
						`${member.guild.translate('Events/giveawayEnded:FIMSORTEIO3', { hostedBy: giveaway.hostedBy })}`,
					].join('\n'))
					.setFooter({ text: `${member.guild.translate('Events/giveawayEnded:FIMSORTEIO4')}` });
				await member.send({ embeds: [embed] });
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
			}
		});
	}
};