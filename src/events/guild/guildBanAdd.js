// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class guildBanAdd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, guildBan) {

		// Make sure all relevant data is fetched
		try {
			if (guildBan.partial) await guildBan.fetch();
			if (guildBan.user.partial) await guildBan.user.fetch();
		} catch (err) {
			if (['Missing Permissions', 'Missing Access'].includes(err.message)) return;
			return bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor: ${guildBan.name} [${guildBan.id}]\nDetalhes: ${err.message}.`);
		}

		const { guild, user } = guildBan;

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${user.tag} foi banido no servidor: ${guild.name} [${guild.id}].`);

		// Get server settings / if no settings then return
		const settings = guild.settings;
		if (Object.keys(settings).length == 0) return;

		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: guild.id });
		}

		// Check if event guildBanAdd is for logging
		if (logDB.ModerationEvents.BanToggle == true && logDB.ModerationEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ModerationEvents.EmbedColor;
			if (color == "#000000") color = '#4bd37b';

			const embed = new Embed(bot, guild)
				.setDescription(`User: ${user.toString()}`)
				.setColor(color)
				.setAuthor({ name: 'User banned:', iconURL: user.displayAvatarURL() })
				.setThumbnail(user.displayAvatarURL())
				.addFields({ name: 'Reason:', value: guildBan.reason ?? 'No reason given', inline: false })
				.setTimestamp()
				.setFooter({ text: `ID: ${user.id}` });

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ModerationEvents.LogChannel).catch(() => { });
				if (modChannel && modChannel.guild.id == guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${guild.name} [${guild.id}]: ${err.message}.`);
			}
		}
	}
};
