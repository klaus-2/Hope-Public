// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class emojiUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, oldEmoji, newEmoji) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: newEmoji.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: newEmoji.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: newEmoji.guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Emoji: ${newEmoji.name} foi atualizado no servidor: ${newEmoji.guild.name} [${newEmoji.guild.id}].`);

		// Get server settings / if no settings then return
		const settings = newEmoji.guild.settings;
		if (Object.keys(settings).length == 0) return;

		const si = {
			true: newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE'),
			false: newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE1')
		}

		// Check if event emojiUpdate is for logging
		if (logDB.ServerEvents.EmojiUpdateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 16086051;

			let embed, updated = false;

			// emoji name change
			if (oldEmoji.name != newEmoji.name) {
				embed = new Embed(bot, newEmoji.guild)
					.setColor(color)
					.setAuthor({ name: `${newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE2')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE3')}`, value: `${newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE4')} ~~${oldEmoji.name}~~ ➔ ${newEmoji.name}`, inline: false },
						//.addField('ID do Emoji', newEmoji.id, true)
						{ name: `${newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE5')}`, value: si[newEmoji.animated], inline: false },
						{ name: `${newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE6')}`, value: `<:${newEmoji.name}:${newEmoji.id}>`, inline: false })
					.setFooter({ text: `ID: ${newEmoji.id}` })
					.setTimestamp();
				updated = true;
			}

			// emoji role update
			if (oldEmoji.roles.cache.size != newEmoji.roles.cache.size) {
				const rolesAdded = newEmoji.roles.cache.filter(x => !oldEmoji.roles.cache.get(x.id));
				const rolesRemoved = oldEmoji.roles.cache.filter(x => !newEmoji.roles.cache.get(x.id));
				if (rolesAdded.size != 0 || rolesRemoved.size != 0) {
					const roleAddedString = [];
					for (const role of [...rolesAdded.values()]) {
						roleAddedString.push(role.toString());
					}
					const roleRemovedString = [];
					for (const role of [...rolesRemoved.values()]) {
						roleRemovedString.push(role.toString());
					}
					embed = new Embed(bot, newEmoji.guild)
						.setDescription(`${newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE7')}`)
						.setColor(color)
						.setFooter({ text: `ID: ${newEmoji.id}` })
						.setAuthor({ name: newEmoji.guild.name, iconURL: newEmoji.guild.iconURL() })
						.addFields(
							{ name: `${newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE8')} [${rolesAdded.size}]:`, value: `${roleAddedString.length == 0 ? newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE10') : roleAddedString.join('\n ')}`, inline: true },
							{ name: `${newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE9')} [${rolesRemoved.size}]:`, value: `${roleRemovedString.length == 0 ? newEmoji.guild.translate('Events/emojiUpdate:EMOJI_UPDATE10') : roleRemovedString.join('\n ')}`, inline: true })
						.setTimestamp();
					updated = true;
				}
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => { });
					if (modChannel && modChannel.guild.id == newEmoji.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newEmoji.guild.name} [${newEmoji.guild.id}]: ${err.message}.`);
				}
			}
		}
	}
};
