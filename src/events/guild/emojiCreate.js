// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class emojiCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, emoji) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: emoji.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: emoji.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: emoji.guild.id });
		}
		
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Emoji: ${emoji.name} foi adicionado no servidor: ${emoji.guild.name} [${emoji.guild.id}].`);

		// Get server settings / if no settings then return
		const settings = emoji.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event emojiCreate is for logging
		if (logDB.ServerEvents.EmojiUpdateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = '#4bd37b';

			const embed = new Embed(bot, emoji.guild)
				.setDescription(`<:v_:855859391835799582> **${emoji.guild.translate('Events/emojiCreate:EMOJI_CREATE')} ${emoji} (${emoji.name}) ${emoji.guild.translate('Events/emojiCreate:EMOJI_CREATE1')}**`)
				.setColor(color)
				.setFooter({ text: `ID: ${emoji.id}` })
				.setAuthor({ name: `${emoji.guild.translate('Events/emojiCreate:EMOJI_CREATE2')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => { });
				if (modChannel && modChannel.guild.id == emoji.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${emoji.guild.name} [${emoji.guild.id}]: ${err.message}.`);
			}
		}
	}
};
