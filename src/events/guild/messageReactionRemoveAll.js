// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class messageReactionRemoveAll extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, message) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: message.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: message.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: message.guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Todas reações foram removidas de uma mensagem ${!message.guild ? '' : ` no servidor: ${message.guild.name} [${message.guild.id}]`}`);

		// If message needs to be fetched
		try {
			if (message.partial) await message.fetch();
		} catch (err) {
			return bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${message.guild.name} [${message.guild.id}]: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageReactionRemove is for logging
		if (logDB.MessageEvents.ReactionToggle == true && logDB.MessageEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MessageEvents.EmbedColor;
			if (color == "#000000") color = '#fd003a';

			const embed = new Embed(bot, message.guild)
				.setDescription(`**${message.guild.translate('Events/messageReactionRemoveAll:MESSAGE_REACTION_REMOVEALL')}(${message.url})** `)
				.setColor(color)
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.MessageEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == message.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${message.guild.name} [${message.guild.id}]: ${err.message}.`);
			}
		}
	}
};
