// Dependencies
const { ApplicationCommandOptionType } = require('discord.js'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

class Update extends Command {
	constructor(bot) {
		super(bot, {
			name: 'update',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Updates the bots username + avatar',
			usage: 'update <username | avatar> <input>',
			cooldown: 600000,
			examples: ['update username Hopezinha'],
			slash: false,
			options: [{
				name: 'option',
				description: 'What to edit.',
				type: ApplicationCommandOptionType.String,
				choices: [...['username', 'avatar'].map(i => ({ name: i, value: i }))],
				required: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Make sure something is entered to search on djs website
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/update:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		switch (message.args[0]) {
			case 'username':
				try {
					await bot.user.setUsername(message.args.join(''));
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
				break;
			case 'avatar': {
				try {
					const file = message.attachments.first();
					if (!file) return message.channel.send({ content: 'Please upload an image with the command!' }).then(m => m.timedDelete({ timeout: 5000 }));
					await bot.user.setAvatar(file);
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
				break;
			}
			default:
				message.channel.send({ content: 'incorrect input' });
		}
	}

	// EXEC - SLASH
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			option = args.get('option').value,
			input = args.get('input').value;

		switch (option) {
			case 'username':
				try {
					await bot.user.setUsername(input);
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
				}
				break;
			case 'avatar': {
				try {
					const file = message.attachments.first();
					if (!file) return message.channel.send({ content: 'Please upload an image with the command!' }).then(m => m.timedDelete({ timeout: 5000 }));
					await bot.user.setAvatar(file);
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
				break;
			}
			default:
				message.channel.send({ content: 'incorrect input' });
		}
	}
}

module.exports = Update;