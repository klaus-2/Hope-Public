// Dependências
const Command = require('../../structures/Command.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js');

module.exports = class Deafen extends Command {
	constructor(bot) {
		super(bot, {
			name: 'deafen',
			aliases: ['daudio'],
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.DeafenMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.DeafenMembers],
			description: 'Deafen a user.',
			usage: '<prefix><commandName> <user> [time]',
			examples: [
				'.deafen @Klaus',
				'!deafen @Hope 5m'
			],
			cooldown: 3000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to deafen.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('Moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		// Pegue o canal em que o user está
		const channel = message.guild.channels.cache.get(members[0].voice.channelID);
		if (!channel) return message.channel.error(message.translate('Moderation/deafen:DAUDIO')).then(m => m.timedDelete({ timeout: 10000 }));

		// Certifique-se de que o usuário não está tentando se punir
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISHMENT').then(m => m.timedDelete({ timeout: 10000 }));

		// Certifique-se de que o usuário está em um canal de voz
		if (members[0].voice.channelID) {
			await members[0].voice.setDeaf(true);
			message.channel.success('misc:SUCCESSFULL_DEAFEN', { user: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
		} else {
			message.channel.error('misc:NOT_INVOICE', { user: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
		}
	}
	// EXEC - SLASH
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('').value),
			channel = guild.channels.cache.get(interaction.channelId);

		// Make sure that the user is in a voice channel
		if (member.voice.channel) {
			// Make sure bot can deafen members
			if (!member.voice.channel.permissionsFor(bot.user).has(Flags.DeafenMembers)) {
				bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:DEAFEN_MEMBERS') }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 10000 }));
			}

			// Make sure user isn't trying to punish themselves
			if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', {}, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 10000 }));

			try {
				await member.voice.setDeaf(true);
				interaction.reply({ embeds: [channel.success('misc:SUCCESSFULL_DEAFEN', { user: member.user }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 3000 }));
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			interaction.reply({ embeds: [channel.error('misc:NOT_INVOICE', { user: member.user }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 10000 }));
		}
	}
};
