// Dependências
const Command = require('../../structures/Command.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js');

module.exports = class Unmute extends Command {
	constructor(bot) {
		super(bot, {
			name: 'unmute',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['un-mute', 'desmutar'],
			userPermissions: [Flags.MuteMembers, Flags.ManageRoles],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.MuteMembers, Flags.ManageRoles],
			description: 'Unmute a user.',
			usage: '<prefix><commandName> <user>',
			examples: [
				'.unmute @Klaus'
			],
			cooldown: 3000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to mute.',
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

		// Find user
		const members = await message.getMember();
		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(members[0].voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has('MUTE_MEMBERS')) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:MUTE_MEMBERS') }).then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// Remove o cargo de mutado do usuário		
		await members[0].timeout(null, `${message.author.id} put user out of timeout`);
		return message.channel.success('misc:SUCCESSFULL_UNMUTE', { user: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
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
		const member = guild.members.cache.get(args.get('user').value);

		// Get the channel the member is in
		const channel = guild.channels.cache.get(member.voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has('MUTE_MEMBERS')) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:MUTE_MEMBERS') }, true)] });
			}
		}

		// Remove mutedRole from user
		try {
			await member.timeout(null, `${interaction.user.id} put user out of timeout`);
			interaction.reply({ embeds: [channel.error('Moderation/unmute:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
};
