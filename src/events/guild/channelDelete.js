// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	{ ChannelType } = require('discord-api-types/v10'),
	Event = require('../../structures/Event');

module.exports = class channelDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, channel) {
		const { type, guild, name } = channel;
		
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Channel: ${channel.type == ChannelType.DM ? channel.recipient.tag : channel.name} has been deleted${channel.type == ChannelType.DM ? '' : ` in guild: ${channel.guild.id}`}. (${ChannelType[channel.type]})`);

		// Don't really know but a check for DM must be made
		if (channel.type == ChannelType.DM) return;

		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELDELETE log
		const regEx = /^🟢｜ticket([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?$/i;
		if (regEx.test(name)) return bot.emit('ticketClose', channel);

		const inf = {
			0: guild.translate('Events/channelCreate:CHANNEL_CREATE'),
			2: guild.translate('Events/channelCreate:CHANNEL_CREATE1'),
			4: guild.translate('Events/channelCreate:CHANNEL_CREATE2'),
			13: 'Stage channel',
			5: 'Announcement channel',
			14: 'Directory channel',
			15: 'Forum channel',
			12: 'Private Thread channel',
			11: 'Public Thread channel',
			10: 'News Thread channel',
			5: 'News channel'			
		};

		// Check if event channelDelete is for logging
		if (logDB.ServerEvents.ChannelDeleteToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = '#fd003a';

			const embed = new Embed(bot, channel.guild.settings.guildID)
				.setDescription(`<:cancel:855859391709577266> **${channel.guild.translate('Events/channelDelete:CHANNEL_DELETE')} ${inf[type]}: ~~${'#' + channel.name}~~ ${channel.guild.translate('Events/channelDelete:CHANNEL_DELETE1')}**`)
				.setColor(color)
				.setFooter({ text: `ID: ${channel.id}` })
				.setAuthor({ name: `${channel.guild.translate('Events/channelDelete:CHANNEL_DELETE2')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => { });
				if (modChannel && modChannel.guild.id == channel.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${channel.guild.name} [${channel.guild.id}]: ${err.message}.`);
			}
		}
	}
};
