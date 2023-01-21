// Dependências
const Command = require('../../structures/Command.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js');

module.exports = class Undeafen extends Command {
	constructor(bot) {
		super(bot, {
			name: 'undeafen',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['reaudio'],
			userPermissions: [Flags.DeafenMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.DeafenMembers],
			description: 'Undeafen a user.',
			usage: '<prefix><commandName> <user>',
			examples: [
				'.undeafen @Klaus',
				'!reaudio @Hope'
			],
			cooldown: 3000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to undeafen.',
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

		// Verifica se o usuário está no servidor
		const members = await message.getMember();

		// Verifique se o bot tem permissão para banir o usuário
		const channel = message.guild.channels.cache.get(members[0].voice.channelID);
		if (!channel) return message.channel.send(message.translate('Moderation/undeafen:REAUDIO'));

		if (!channel.permissionsFor(bot.user).has(Flags.DeafenMembers)) {
			bot.logger.error(`Faltando permissões: \`DEAFEN_MEMBERS\` em [${message.guild.id}].`);
			return message.channel.error('misc:USER_PERMISSION', { PERMISSIONS: message.translate('permissions:DEAFEN_MEMBERS') }).then(m => m.timedDelete({ timeout: 10000 }));
		}

		// reative o audio do usuario
		await members[0].voice.setDeaf(false);
		message.channel.success('misc:SUCCESSFULL_UNDEAFEN', members[0].user).then(m => m.timedDelete({ timeout: 3000 }));
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
			channel = guild.channels.cache.get(interaction.channelId);

		// Make sure that the user is in a voice channel
		if (member.voice.channel) {
			// Make sure bot can deafen members
			if (!member.voice.channel.permissionsFor(bot.user).has(Flags.DeafenMembers)) {
				bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:DEAFEN_MEMBERS') }, true)] });
			}

			// Make sure user isn't trying to punish themselves
			if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', null, true)] });

			try {
				await member.voice.setDeaf(false);
				interaction.reply({ embeds: [channel.success('moderation/undeafen:SUCCESS', { USER: member.user }, true)] });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
			}
		} else {
			interaction.reply({ embeds: [channel.error('moderation/undeafen:NOT_VC', null, true)] });
		}
	}
};
