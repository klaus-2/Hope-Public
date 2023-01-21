const { GuildSchema, muteModel } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class Ready extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			once: true,
		});
	}

	// Exec event
	async run(bot) {
		// set up api server for website/dashboard
		try {
			await require('../../Api')(bot);
		} catch (err) {
			console.log(err.message);
		}

		// webhook manager (loop every 10secs)
		setInterval(async () => {
			await require('../../helpers/HopeWebhooks')(bot);
		}, 10000);

		for (const guild of [...bot.guilds.cache.values()]) {
			// Sort out guild settings
			await guild.fetchSettings();
			if (guild.settings == null) return bot.emit('guildCreate', guild);
			if (guild.settings.plugins.includes('Level')) await guild.fetchLevels();
		}

		// Delete server settings on servers that removed the bot while it was offline
		const data = await GuildSchema.find({});
		if (data.length > bot.guilds.cache.size) {
			// A server kicked the bot when it was offline
			const guildCount = [];
			// Get bot guild ID's
			for (let i = 0; i < bot.guilds.cache.size; i++) {
				guildCount.push([...bot.guilds.cache.values()][i].id);
			}
			// Now check database for bot guild ID's
			for (const guild of data) {
				if (!guildCount.includes(guild.guildID)) {
					bot.emit('guildDelete', { id: guild.guildID, name: guild.guildName });
				}
			}
		}

		bot.logger.ready('All guilds have been initialized.');

		// Every 1 minutes fetch new guild data
		setInterval(async () => {
			if (bot.config.debug) bot.logger.debug('Fetching guild settings (Interval: 1 minutes)');
			bot.guilds.cache.forEach(async guild => {
				await guild.fetchSettings();
			});
		}, 60000);

		// FUNÇÃO MUTE
		setInterval(async () => {
			for (const guild of [...bot.guilds.cache.values()]) {
				const muteArray = await muteModel.find({
					guildID: guild[0],
				});

				for (const muteDoc of muteArray) {
					if (Date.now() >= Number(muteDoc.length)) {
						const guildfind = bot.guilds.cache.get(muteDoc.guildID);
						const member = guildfind ? guildfind.members.cache.get(muteDoc.memberID) : null;
						// bot.translate(bot.guilds.cache.get(config), 'MODERATION/MUTAR11')
						const muteRole = guildfind ? guildfind.roles.cache.find(r => r.name == bot.translate('Events/ready:MUTAR11', {}, bot.guilds.cache.get(muteArray).settings.Language)) : null;

						if (member) {
							await member.roles.remove(muteRole ? muteRole.id : '').catch(err => console.log(err));

							for (const role of muteDoc.memberRoles) {
								await member.roles.add(role).catch(err => console.log(err));
							}
						}

						await muteDoc.deleteOne().catch(err => console.log(err));
					}
				}
			}
		}, 60000);

		// check for premium users
		/* const users = await userSchema.find({});
		for (const { userID, premium, premiumSince, cmdBanned, rankImage } of users) {
			const user = await bot.users.fetch(userID);
			user.premium = premium;
			user.premiumSince = premiumSince ?? 0;
			user.cmdBanned = cmdBanned;
			user.rankImage = rankImage ? Buffer.from(rankImage ?? '', 'base64') : '';
		} */

		// enable time event handler (in case of bot restart)
		try {
			await require('../../helpers/HopeAutoModule')(bot);
		} catch (err) {
			console.log(err);
		}

		// LOG ready event
		bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');
		bot.logger.log(`${bot.user.tag}, ready to serve [${bot.users.cache.size}] users in [${bot.guilds.cache.size}] servers.`, 'ready');
		bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');
	}
};
