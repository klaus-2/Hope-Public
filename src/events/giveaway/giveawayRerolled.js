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
		if (bot.config.debug) bot.logger.log('giveaway has rerolled');

		// DM members that they have won
		winners.forEach(async (member) => {
			try {
				// Get server settings / if no settings then return
				const settings = member.guild.settings;
				if (Object.keys(settings).length == 0) return;

				const embed = new Embed(bot, member.guild)
					.setAuthor({ name: `${member.guild.translate('Events/giveawayRerolled:FIMSORTEIO')}`, iconURL: `${member.user.displayAvatarURL()}` })
					.setThumbnail(`${bot.guilds.cache.get(giveaway.guildID).iconURL()}`)
					.setColor(12118406)
					.setDescription([
						`${member.guild.translate('Events/giveawayEnded:FIMSORTEIO1')} \`${giveaway.prize}\`.`,
						`${member.guild.translate('Events/giveawayEnded:FIMSORTEIO2')} [link](https://discord.com/channels/${giveaway.guildID}/${giveaway.channelID}/${giveaway.messageID}).`,
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