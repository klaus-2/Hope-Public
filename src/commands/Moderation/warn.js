// Dependências
const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Warn extends Command {
	constructor(bot) {
		super(bot, {
			name: 'warn',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['aviso'],
			userPermissions: [Flags.KickMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.KickMembers],
			description: 'Warn a user.',
			usage: '<prefix><commandName> <user> [time] [reason]',
			examples: [
				'.warn @Klaus',
				'!warn @Hope 3m spam'
			],
			cooldown: 5000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to mute.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'time',
					description: 'The time till they are unmuted.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
				{
					name: 'reason',
					description: 'The time till they are unmuted.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('Moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		// Certifique-se de que o usuário não está tentando se punir
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.timedDelete({ timeout: 10000 }));

		// Certifique-se de que o usuário não tem permissões de ADMINISTRADOR ou tem uma função maior
		if (members[0].permissions.has(Flags.Administrator) || members[0].roles.highest.comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
			return message.channel.error('misc:TOO_POWERFUL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Obtem uma razão para o aviso
		const reason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// O Aviso é enviado ao gerenciador de avisos
		// bot, message, member, wReason, settings
		const res = await require('../../helpers/HopeWarningsModule').run(bot, message, members[0], reason);
		if (res.error) message.channel.error(res.error);
		else message.channel.send({ embeds: [res] });
	}
	/**
 * Function for receiving interaction.
 * @param {bot} bot The instantiating client
 * @param {interaction} interaction The interaction that ran the command
 * @param {guild} guild The guild the interaction ran in
 * @param {args} args The options provided in the command, if any
 * @readonly
*/
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user').value),
			channel = guild.channels.cache.get(interaction.channelId),
			reason = args.get('reason')?.value ?? guild.translate('misc:NO_REASON');

		// Make sure user isn't trying to punish themselves
		if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', {}, true)] });

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (member.permissions.has(Flags.Administrator) || member.roles.highest.comparePositionTo(guild.me.roles.highest) >= 0) {
			return interaction.reply({ embeds: [channel.error('Moderation/warn:TOO_POWERFUL', {}, true)] });
		}

		// Warning is sent to warning manager
		try {
			const res = await require('../../helpers/HopeWarningsModule').run(bot, interaction, member, reason);
			if (res.error) interaction.reply({ embeds: [channel.error(res.error, true)] });
			else interaction.reply({ embeds: [res] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)] });
		}
	}
};
