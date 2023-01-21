// Dependências
const { Embed } = require(`../../utils`),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class guildUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event	
	async run(bot, oldGuild, newGuild) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: newGuild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: newGuild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: newGuild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Servidor: ${newGuild.name} [${newGuild.id}] foi atualizado.`);

		// Get server settings / if no settings then return
		const settings = newGuild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildUpdate is for logging
		if (logDB.ServerEvents.GuildUpdateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 16086051;

			let embed, updated = false;

			// Guild name change
			if (oldGuild.name != newGuild.name) {
				embed = new Embed(bot, newGuild)
					.setDescription(`${newGuild.translate('Events/guildUpdate:GUILD_UPDATE')}`)
					.setColor(color)
					.setAuthor({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE1')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE2')}`, value: `${oldGuild.name}`, inline: false },
						{ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE3')}`, value: `${newGuild.name}`, inline: false })
					.setTimestamp();

				if (newGuild.icon) embed.setThumbnail(`${newGuild.iconURL()}`)

				await newGuild.updateGuild({ guildName: newGuild.name });

				updated = true;
			}

			// region change
			/*if (oldGuild.region != newGuild.region) {
				embed = new Embed(bot, newGuild)
					.setDescription(newGuild.translate('Events/guildUpdate:GUILD_UPDATE4',{}, newGuild.settings.Language))
					.setColor(color)
					.setAuthor(newGuild.translate('Events/guildUpdate:GUILD_UPDATE5',{}, newGuild.settings.Language), `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif`)
					.addField(newGuild.translate('Events/guildUpdate:GUILD_UPDATE6',{}, newGuild.settings.Language), oldGuild.region)
					.addField(newGuild.translate('Events/guildUpdate:GUILD_UPDATE7',{}, newGuild.settings.Language), newGuild.region)
					.setTimestamp();
					updated = true;
			}*/

			// add aqui oldGuild.icon != newGuild.icon

			// Server's boost level has changed
			if (oldGuild.premiumTier != newGuild.premiumTier) {
				embed = new Embed(bot, newGuild)
					.setDescription(`**${newGuild.translate('Events/guildUpdate:GUILD_UPDATE8')} ${oldGuild.premiumTier < newGuild.premiumTier ? newGuild.translate('Events/guildUpdate:GUILD_UPDATE9') : newGuild.translate('Events/guildUpdate:GUILD_UPDATE10')}**`)
					.setColor(color)
					.setAuthor({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE11')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE12')}`, value: `${oldGuild.premiumTier}`, inline: false },
						{ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE13')}`, value: `${newGuild.premiumTier}`, inline: false })
					.setTimestamp();

				updated = true;
			}

			// Server has got a new banner
			if (!oldGuild.banner && newGuild.banner) {
				embed = new Embed(bot, newGuild)
					.setDescription(`${newGuild.translate('Events/guildUpdate:GUILD_UPDATE14')}`)
					.setColor(color)
					.setAuthor({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE15')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE16')}`, value: `${oldGuild.banner}`, inline: false },
						{ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE17')}`, value: `${newGuild.banner}`, inline: false })
					.setTimestamp();

				updated = true;
			}

			// Server has made a AFK channel
			if (!oldGuild.afkChannel && newGuild.afkChannel) {
				embed = new Embed(bot, newGuild)
					.setDescription(`${newGuild.translate('Events/guildUpdate:GUILD_UPDATE18')}`)
					.setColor(color)
					.setAuthor({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE19')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE20')}`, value: `${oldGuild.afkChannel}`, inline: false },
						{ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE21')}`, value: `${newGuild.afkChannel}`, inline: false })
					.setTimestamp();

				updated = true;
			}

			// Server now has a vanity URL
			if (!oldGuild.vanityURLCode && newGuild.vanityURLCode) {
				embed = new Embed(bot, newGuild)
					.setDescription(`${newGuild.translate('Events/guildUpdate:GUILD_UPDATE22')}`)
					.setColor(color)
					.setAuthor({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE23')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields({ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE24')}`, value: `${oldGuild.vanityURLCode}`, inline: false },
						{ name: `${newGuild.translate('Events/guildUpdate:GUILD_UPDATE25')}`, value: `${newGuild.vanityURLCode}`, inline: false })
					.setTimestamp();

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newGuild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newGuild.guild.name} [${newGuild.guild.id}]: ${err.message}.`);
				}
			}
		}
	}
};
