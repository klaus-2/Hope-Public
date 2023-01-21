// Dependencies
const { ApplicationCommandType } = require('discord-api-types/v10'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

class Refresh extends Command {
	constructor(bot) {
		super(bot, {
			name: 'refresh',
			ownerOnly: true,
			dirname: __dirname,
			aliases: ['refresh-interaction'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Update all the servers interaction',
			usage: 'refresh-interaction',
			cooldown: 3000,
			examples: ['refresh-interaction'],
			slash: false,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('Host/refresh:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		switch (message.args[0]) {
			case 'interactions': {
				message.channel.send(`=-=-=-=-=-=-=- Loading interactions for ${bot.guilds.cache.size} guilds -=-=-=-=-=-=-=`);
				let successCount = 0;
				// loop through each guild
				for (const guild of [...bot.guilds.cache.values()]) {
					const enabledPlugins = guild.settings.plugins;
					const cmdsToUpload = [];

					// get slash commands for category
					for (const plugin of enabledPlugins) {
						const g = await bot.loadInteractionGroup(plugin, guild);
						if (Array.isArray(g)) cmdsToUpload.push(...g);

					}

					// For the "Host" commands
					if (guild.id == bot.config.SupportServer.GuildID) {
						const cmds = await bot.loadInteractionGroup('Host', guild);
						for (const cmd of cmds) {
							cmd.defaultMemberPermissions = [Flags.Administrator];
						}
						if (Array.isArray(cmds)) cmdsToUpload.push(...cmds);
					}

					// get context menus
					try {
						await bot.guilds.cache.get(guild.id)?.commands.set(cmdsToUpload);
						bot.logger.log('Loaded interactions for guild: ' + guild.name);
						successCount++;
					} catch (err) {
						bot.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
					}
				}
				bot.application.commands.set([{ name: 'Add to Queue', type: ApplicationCommandType.Message },
					{ name: 'Translate', type: ApplicationCommandType.Message },
					{ name: 'OCR', type: ApplicationCommandType.Message },
					{ name: 'Avatar', type: ApplicationCommandType.User },
					{ name: 'Userinfo', type: ApplicationCommandType.User },
					{ name: 'Screenshot', type: ApplicationCommandType.Message },
				]);

				message.channel.send(`Successfully updated ${successCount}/${bot.guilds.cache.size} servers' interactions.`);
				break;
			}
			case 'language':
				bot.translations = await require('../../helpers/HopeLanguageManager')();
				break;
			default:

		}
	}
}

module.exports = Refresh;