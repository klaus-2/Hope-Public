// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class roleUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, oldRole, newRole) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: newRole.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: newRole.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: newRole.guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`O Cargo: ${newRole.name} foi atualizado no servidor: ${newRole.guild.name} [${newRole.guild.id}].`);

		// Get server settings / if no settings then return
		const settings = newRole.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event roleUpdate is for logging
		if (logDB.ServerEvents.RoleUpdateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 16086051;

			let embed, updated = false;

			// role name change
			if (oldRole.name != newRole.name) {
				embed = new Embed(bot, newRole.guild)
					.setDescription(`**${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE')} ${newRole} (${newRole.name}) ${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE1')}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE2')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE3')}`, value: `${oldRole.name}`, inline: false },
						{ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE4')}`, value: `${newRole.name}`, inline: false })
					.setTimestamp();

				updated = true;
			}

			// role colour change
			if (oldRole.color != newRole.color) {
				embed = new Embed(bot, newRole.guild)
					.setDescription(`**${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE5')} ${newRole} (${newRole.name}) ${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE6')}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE7')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE8')}`, value: `${oldRole.color} ([${oldRole.hexColor}](https://www.color-hex.com/color/${oldRole.hexColor.slice(1)}))`, inline: false },
						{ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE9')}`, value: `${newRole.color} ([${newRole.hexColor}](https://www.color-hex.com/color/${newRole.hexColor.slice(1)}))`, inline: false })
					.setTimestamp();

				updated = true;
			}

			// role permission change
			if (oldRole.permissions.bitfield != newRole.permissions.bitfield) {
				embed = new Embed(bot, newRole.guild)
					.setDescription(`**${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE10')} ${newRole} (${newRole.name}) ${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE11')}**\n[${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE12')}](https://discordapi.com/permissions.html#${oldRole.permissions.bitfield}) ${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE13')}`)
					.setColor(color)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE14')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE15')}`, value: `${oldRole.permissions.bitfield}`, inline: false },
						{ name: `${newRole.guild.translate('Events/roleUpdate:ROLE_UPDATE16')}`, value: `${newRole.permissions.bitfield}`, inline: false })
					.setTimestamp();
					
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newRole.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newRole.guild.name} [${newRole.guild.id}]: ${err.message}.`);
				}
			}
		}
	}
};
