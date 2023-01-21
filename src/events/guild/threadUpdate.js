// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class threadUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, oldThread, newThread) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: newThread.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: newThread.guild.id,
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: newThread.guild.id });
		}

		const inf = {
			0: newThread.guild.translate('Events/channelCreate:CHANNEL_CREATE'),
			2: newThread.guild.translate('Events/channelCreate:CHANNEL_CREATE1'),
			4: newThread.guild.translate('Events/channelCreate:CHANNEL_CREATE2'),
			13: 'Stage channel',
			5: 'Announcement channel',
			14: 'Directory channel',
			15: 'Forum channel',
			12: 'Private Thread channel',
			11: 'Public Thread channel',
			10: 'News Thread channel',
			5: 'News channel'
		};

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Thread: ${newThread.name} has been updated in guild: ${newThread.guildId}. (${inf[newThread.type]})`);

		// Get server settings / if no settings then return
		const settings = newThread.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (logDB.ServerEvents.ThreadUpdateToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 15105570;

			let embed, updated = false;

			// thread name change
			if (oldThread.name != newThread.name) {
				embed = new Embed(bot, newThread.guild)
					.setDescription(`**Thread name changed of ${newThread.toString()}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newThread.id}` })
					.setAuthor({ name: `${newThread.guild.name}`, iconURL: `${newThread.guild.iconURL()}` })
					.addFields(
						{ name: 'Old:', value: `${oldThread.name}`, inline: true },
						{ name: 'New:', value: `${newThread.name}`, inline: true },
					)
					.setTimestamp();
					
				updated = true;
			}

			// thread archive state change
			if (oldThread.archived != newThread.archived) {
				embed = new Embed(bot, newThread.guild)
					.setDescription(`**Thread archive state changed of ${newThread.toString()}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newThread.id}` })
					.setAuthor({ name: `${newThread.guild.name}`, iconURL: `${newThread.guild.iconURL()}` })
					.addFields(
						{ name: 'Old:', value: `${oldThread.archived}`, inline: true },
						{ name: 'New:', value: `${newThread.archived}`, inline: true },
					)
					.setTimestamp();

				updated = true;
			}

			// Find channel and send message
			if (updated) {
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newThread.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
};
