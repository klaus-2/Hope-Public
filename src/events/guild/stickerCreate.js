// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class stickerCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, sticker) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: sticker.guildId });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: sticker.guildId
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: sticker.guildId });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Sticker: ${sticker.name} has been created in guild: ${sticker.guildId}. (${sticker.type})`);

		// fetch the user who made the sticker
		let user;
		try {
			user = await sticker.fetchUser();
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = sticker.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (logDB.ServerEvents.StickerCreateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 3066993;

			const embed = new Embed(bot, sticker.guild)
				.setDescription([
					`**Sticker created: ${sticker.name}**`, `${user ? ['', `Created by: ${user?.tag}`].join('\n') : []}`,
				].join('\n'))
				.setColor(color)
				.setImage(`https://cdn.discordapp.com/stickers/${sticker.id}.png`)
				.setFooter({ text: sticker.guild.translate('misc:ID', { ID: sticker.id }) })
				.setAuthor({ name: `${bot.user.username}`, iconURL: `${bot.user.displayAvatarURL()}` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == sticker.guildId) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
