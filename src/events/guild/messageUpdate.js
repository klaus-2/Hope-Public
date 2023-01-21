// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class messageUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, oldMessage, newMessage) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Uma mensagem foi atualizada${!newMessage.guild ? '' : ` no servidor: ${newMessage.guild.name} [${newMessage.guild.id}]`}`);

		// make sure its not a DM
		if (!newMessage.guild) return;

		// Se o usuario for um bot, não registrará o log
		if (newMessage.id == bot.user.id) return;
		if (newMessage.bot == true) return;

		// Check if message is a partial
		try {
			if (oldMessage.partial) await oldMessage.fetch();
			if (newMessage.partial) await newMessage.fetch();
		} catch (err) {
			if (err.message == 'Missing Access') return;
			return bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newMessage.guild.name} [${newMessage.guild.id}]: ${err.message}. [PARTE DE CIMA]`);
		}

		// only check for message content is different
		if (oldMessage.content == newMessage.content || !newMessage.content || !oldMessage.content) return;

		// Get server settings / if no settings then return
		const settings = newMessage.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: newMessage.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: newMessage.guild.id,
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: newMessage.guild.id });
		}

		// Check if event channelDelete is for logging
		if (logDB.MessageEvents.EditedToggle == true && logDB.MessageEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MessageEvents.EmbedColor;
			if (color == "#000000") color = 16086051;

			// shorten both messages when the content is larger then 1024 chars
			let oldShortened = false;
			let oldContent = oldMessage.content;
			if (oldContent.length > 1024) {
				oldContent = oldContent.slice(0, 1020) + '...';
				oldShortened = true;
			}
			let newShortened = false;
			let newContent = newMessage.content;
			if (newContent.length > 1024) {
				newContent = newContent.slice(0, 1020) + '...';
				newShortened = true;
			}
			const embed = new Embed(bot, newMessage.guild)
				.setDescription(`**${newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE')} ${newMessage.author.toString()} ${newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE1')} ${newMessage.channel.toString()}** [${newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE2')}](${newMessage.url})`)
				.setFooter({ text: `${newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE3')} ${newMessage.author.id} | ${newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE4')} ${newMessage.id}` })
				.setColor(color)
				.setAuthor({ name: `${newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE5')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.addFields(
					{ name: `${newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE6')} ${(oldShortened ? newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE7') : '')}:`, value: `${oldMessage.content.length > 0 ? oldContent : newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE8')}`, inline: true },
					{ name: `${newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE9')} ${(newShortened ? newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE7') : '')}:`, value: `${newMessage.content.length > 0 ? newContent : newMessage.guild.translate('Events/messageUpdate:MESSAGE_UPDATE8')}`, inline: true })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.MessageEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == newMessage.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newMessage.guild.name} [${newMessage.guild.id}]: ${err.message}. [PARTE DE BAIXO]`);
			}
		}
	}
};
