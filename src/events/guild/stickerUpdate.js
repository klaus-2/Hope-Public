// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class stickerUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, oldSticker, newSticker) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: newSticker.guildId });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: newSticker.guildId
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: newSticker.guildId });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Sticker: ${newSticker.name} has been updated in guild: ${newSticker.guildId}. (${newSticker.type})`);

		// Get server settings / if no settings then return
		const settings = newSticker.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (logDB.ServerEvents.StickerUpdateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 15105570;

			let embed, updated = false;

			// sticker name change
			if (oldSticker.name != newSticker.name) {
				embed = new Embed(bot, newSticker.guild)
					.setDescription(`Sticker name changed of ${newSticker.name}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newSticker.id}` })
					.setAuthor({ name: `${newSticker.guild.name}`, iconURL: `${newSticker.guild.iconURL()}` })
					.setImage(`https://cdn.discordapp.com/stickers/${newSticker.id}.png`)
					.addFields(
						{ name: 'Old:', value: `${oldSticker.name}`, inline: true },
						{ name: 'New:', value: `${newSticker.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// sticker description change
			if (oldSticker.description != newSticker.description) {
				embed = new Embed(bot, newSticker.guild)
					.setDescription(`Sticker description changed of **${newSticker.name}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newSticker.id}` })
					.setAuthor({ name: `${newSticker.guild.name}`, iconURL: `${newSticker.guild.iconURL()}` })
					.setImage(`https://cdn.discordapp.com/stickers/${newSticker.id}.png`)
					.addFields(
						{ name: 'Old:', value: `${oldSticker.description}`, inline: true },
						{ name: 'New:', value: `${newSticker.description}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// Find channel and send message
			if (updated) {
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newSticker.guildId) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
};
