// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class ticketCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, channel, ticket) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: channel.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: channel.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: channel.guild.id });
		}

		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// send ticket log (goes in ModLog channel)
		if (logDB.ServerEvents?.TicketingToggle == true && logDB.ServerEvents?.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MemberEvents?.EmbedColor;
			if (color == "#000000") color = '#4bd37b';

			const embed = new Embed(bot, channel.guild)
				.setTitle('Events/ticketCreate:TICKET_CRIAR8')
				.setColor(color)
				.addFields({ name: `${channel.guild.translate('Events/ticketCreate:TICKET_CRIAR9')}`, value: `${channel}`, inline: false },
					{ name: `${channel.guild.translate('Events/ticketCreate:TICKET_CRIAR12')}`, value: `${bot.users.cache.get(channel.name.split('-')[1])}`, inline: true })
				//.addField(channel.guild.translate('ticket/ticket-create:FIELD2'), ticket.fields[1].value, true)
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents?.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == channel.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${channel.guild.name} [${channel.guild.id}]: ${err.message}.`);
			}
		}
	}
};
