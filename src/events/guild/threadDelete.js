// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class threadDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, thread) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: thread.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: thread.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: thread.guild.id });
		}

		const inf = {
			0: thread.guild.translate('Events/channelCreate:CHANNEL_CREATE'),
			2: thread.guild.translate('Events/channelCreate:CHANNEL_CREATE1'),
			4: thread.guild.translate('Events/channelCreate:CHANNEL_CREATE2'),
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
		if (bot.config.debug) bot.logger.debug(`Thread: ${thread.name} has been deleted in guild: ${thread.guildId}. (${inf[thread.type]})`);

		// Get server settings / if no settings then return
		const settings = thread.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (logDB.ServerEvents.ThreadDeleteToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 15158332;

			const embed = new Embed(bot, thread.guild)
				.setDescription([
					`**${inf[thread.type]} deleted: ${thread.toString()}**`,
					'',
					`Owner: ${bot.users.cache.get(thread.ownerId)?.tag}`,
				].join('\n'))
				.setColor(color)
				.setFooter({ text: thread.guild.translate('misc:ID', { ID: thread.id }) })
				.setAuthor({ name: `${bot.user.username}`, iconURL: `${bot.user.displayAvatarURL()}` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == thread.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
