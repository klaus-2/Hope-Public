// Dependencies
const { Embed } = require('../../utils'),
	{ ChannelType } = require('discord-api-types/v10'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class channelCreate extends Event {
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
		if (bot.config.debug) bot.logger.debug(`Channel: ${type == ChannelType.DM ? channel.recipient.tag : name} has been created${type == ChannelType.DM ? '' : ` in guild: ${guild.id}`}. (${type})`);

		// Make sure the channel isn't a DM
		if (channel.type == ChannelType.DM) return;

		// Get server settings / if no settings then return
		const settings = guild.settings;
		if (Object.keys(settings).length == 0) return;

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

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELCREATE log
		const regEx = /^🟢｜ticket([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?$/i;
		if (regEx.test(name)) return bot.emit('ticketCreate', channel);

		// Check if event channelCreate is for logging
		if (logDB.ServerEvents.ChannelCreateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = '#4bd37b';

			const embed = new Embed(bot, channel.guild)
				.setDescription(`<:v_:855859391835799582> **${guild.translate('Events/channelCreate:CHANNEL_CREATE3')} ${inf[type]} ${guild.translate('Events/channelCreate:CHANNEL_CREATE4')} ${channel.toString()}**`)
				.setColor(color)
				.setFooter({ text: `ID: ${channel.id}` })
				.setAuthor({ name: `${guild.translate('Events/channelCreate:CHANNEL_CREATE5')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => { });
				// modChannel.send({ embeds: [embed] });
				if (modChannel && guild.id == guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${guild.name} [${guild.id}]: ${err.message}.`);
			}
		}
	}
};
