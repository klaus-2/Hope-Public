// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class roleDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, role) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: role.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: role.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: role.guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`O Cargo: ${role.name} foi deletado no servidor: ${role.guild.name} [${role.guild.id}].`);

		// Get server settings / if no settings then return
		const settings = role.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event roleDelete is for logging
		if (logDB.ServerEvents.RoleCreateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = '#fd003a';

			const embed = new Embed(bot, role.guild)
				.setDescription(`${role.guild.translate('Events/roleDelete:ROLE_DELETE')} ${role.name}\n ${role.guild.translate('Events/roleDelete:ROLE_DELETE1')} ${role}**`)
				.setColor(color)
				.setFooter({ text: `ID: ${role.id}` })
				.setAuthor({ name: `${role.guild.translate('Events/roleDelete:ROLE_DELETE2')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == role.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${role.guild.name} [${role.guild.id}]: ${err.message}.`);
			}
		}
	}
};
