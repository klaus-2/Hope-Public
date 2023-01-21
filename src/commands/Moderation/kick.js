// Dependências
const { Embed } = require(`../../utils`),
	{ ApplicationCommandOptionType } = require('discord.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Kick extends Command {
	constructor(bot) {
		super(bot, {
			name: 'kick',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.KickMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.KickMembers],
			description: 'Kick a user.',
			usage: '<prefix><commandName> <user> [reason]',
			examples: [
				'.kick @Klaus',
				'.kick @Hope spam'
			],
			cooldown: 5000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to kick.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason to kick user.',
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

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('Moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		const reason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// Certifique-se de que o usuário não está tentando se punir
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISHMENT').then(m => m.timedDelete({ timeout: 10000 }));

		// Certifique-se de que o usuário não tem permissões de ADMINISTRADOR ou tem uma cargo maior
		if (members[0].permissions.has(Flags.Administrator) || members[0].roles.highest.comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
			return message.channel.error('misc:TOO_POWERFUL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Expulsa com um motivo
		// envia dm para o usuario
		const embed = new Embed(bot, message.guild)
			.setTitle('Moderation/kick:KICK')
			.setColor(16711709)
			.setThumbnail(message.guild.iconURL())
			.setDescription(`${message.translate('Moderation/kick:KICK1')} ${message.guild.name}.`)
			.addFields({ name: message.translate('Moderation/kick:KICK2'), value: message.author.tag, inline: true },
				{ name: message.translate('Moderation/kick:KICK3'), value: reason, inline: true });
		await members[0].send({ embeds: [embed] });

		// expulsa do servidor
		await members[0].kick({ reason: reason });
		message.channel.success('misc:SUCCESSFULL_KICK', { user: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
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
			reason = args.get('reason')?.value;

		// Make sure user isn't trying to punish themselves
		if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', null, true)] });

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (members[0].permissions.has(Flags.Administrator) || members[0].roles.highest.comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
			return interaction.reply({ embeds: [channel.error('misc:TOO_POWERFUL', null, true)] });
		}

		// Kick user with reason
		try {
			// send DM to user
			try {
				const embed = new Embed(bot, guild)
					.setTitle('Moderation/kick:KICK')
					.setColor(16711709)
					.setThumbnail(guild.iconURL())
					.setDescription(`${guild.translate('Moderation/kick:KICK1')} ${guild.name}.`)
					.addField(guild.translate('Moderation/kick:KICK2'), interaction.user.tag, true)
					.addField(guild.translate('Moderation/kick:KICK3'), reason, true);
				await member.send({ embeds: [embed] });
				// eslint-disable-next-line no-empty
			} catch (e) { }

			// kick user from guild
			await member.kick({ reason: reason });
			interaction.reply({ embeds: [channel.success('misc:SUCCESSFULL_KICK', { user: member.user }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)] });
		}
	}
};
