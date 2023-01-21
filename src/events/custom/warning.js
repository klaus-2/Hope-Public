// Dependencies
const { Embed } = require(`../../utils`),
	{ WarningSchema, loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class Warning extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, member, warning) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: member.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: member.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: member.guild.id });
		}

		// get settings
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// fetch latest warning to get information
		if (logDB.ModerationEvents.WarnToggle == true && logDB.ModerationEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ModerationEvents.EmbedColor;
			if (color == "#000000") color = 15158332;

			const warns = await WarningSchema.find({
				userID: member.user.id,
				guildID: member.guild.id,
			});

			// For debugging
			const embed = new Embed(bot, member.guild)
				.setColor(color);
			if (warns.length == 3) {
				embed.setAuthor({ name: `${member.guild.translate('Events/warning:WARNING_SYSTEM8')} ${member.user.tag}`, iconURL: member.user.displayAvatarURL() });
			} else {
				embed.setAuthor({ name: `${member.guild.translate('Events/warning:WARNING_SYSTEM10')} ${member.user.tag}`, iconURL: member.user.displayAvatarURL() });
			}
			embed.addFields({ name: `${member.guild.translate('Events/warning:WARNING_SYSTEM11')}`, value: `${member}`, inline: true });
			embed.addFields({ name: `${member.guild.translate('Events/warning:WARNING_SYSTEM12')}`, value: `${member.guild.members.cache.get(warning.Moderater).user.tag}`, inline: true });
			if (warns.length != 3) {
				embed.addFields({ name: `${member.guild.translate('Events/warning:WARNING_SYSTEM13')}`, value: `${warns.length}`, inline: true });
			} else {
				embed.addFields({ name: `${member.guild.translate('Events/warning:WARNING_SYSTEM13')}`, value: '1', inline: true });
			}
			embed.addFields({ name: `${member.guild.translate('Events/warning:WARNING_SYSTEM3')}`, value: warning.Reason, inline: false });
			embed.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ModerationEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && member.guild.id == member.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
			}
		}
	}
};
