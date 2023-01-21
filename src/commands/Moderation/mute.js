// Dependências
const { time: { getTotalTime } } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Mute extends Command {
	constructor(bot) {
		super(bot, {
			name: 'mute',
			aliases: ['mutar'],
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.MuteMembers, Flags.ManageRoles],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.MuteMembers, Flags.ManageRoles, Flags.ManageChannels],
			description: 'Mute a user.',
			usage: '<prefix><commandName> <user> [time]',
			examples: [
				'.mute @Klaus',
				'!mute @Hope 5m'
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
				{
					name: 'time',
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

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('Moderation/ban:MISSING_USER').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

		// Certifica de que o usuário não esteja tentando se punir
		// if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISHMENT').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

		// put user in timeout
		const { error, success: time } = getTotalTime(message.args[1] ?? '1d');
		if (error) return message.channel.error(error);
		// default time is 28 days
		await members[0].timeout(time, `${message.author.id} put user in timeout`);
		message.channel.success('misc:SUCCESSFULL_MUTE', { user: members[0].user }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 3000 }) } });
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

		// Make sure user isn't trying to punish themselves
		if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', null, true)] });

		// put user in timeout
		try {
			// default time is 28 days
			const { error, success: time } = getTotalTime(args.get('time').value ?? (28 * 86400000));
			if (error) return interaction.reply({ embeds: [channel.error(error, null, true)] });

			await member.timeout(time, `${interaction.user.id} put user in timeout`);
			interaction.reply({ embeds: [channel.success('moderation/mute:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
};
