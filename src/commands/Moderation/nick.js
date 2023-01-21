// Dependências
const Command = require('../../structures/Command.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js');

module.exports = class Nick extends Command {
	constructor(bot) {
		super(bot, {
			name: 'nick',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['nickname', 'setnick'],
			userPermissions: [Flags.ChangeNickname, Flags.ManageNicknames],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageNicknames],
			description: 'Change the name of a user.',
			usage: '<prefix><commandName> <user> <new nickname>',
			examples: [
				'.nick @Klaus Test'
			],
			cooldown: 3000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to change nickname.',
					type: ApplicationCommandOptionType.User,
					required: false,
				},
				{
					name: 'name',
					description: 'The nickname to give the user.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('Moderation/ban:MISSING_USER').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

		// Certifique-se de que o usuário não tem permissões de ADMINISTRADOR ou tem um cargo mais alto
		if (members[0].permissions.has(Flags.Administrator) || (members[0].roles.highest.comparePositionTo(message.guild.members.me.roles.highest) > 0)) {
			return message.channel.error('misc:TOO_POWERFUL').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
		}

		// Certifique-se de que um novo nick foi fornecido no comando
		if (message.args.length == 0) return message.channel.error('Moderation/nick:ENTER_NICKNAME').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

		// obtem o nick
		const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);

		// determina o limite do tamanho do nick
		if (nickname.length >= 32) return message.channel.error('Moderation/nick:LONG_NICKNAME').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 5000 }) } });

		// Altera o nick e envia msg de sucesso ao usuario (enviara uma mensagem de erro se não funcionar)
		await members[0].setNickname(nickname);
		message.channel.success('misc:SUCCESSFULL_NICK', { user: members[0].user }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 5000 }) } });
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
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			nickname = args.get('nickname').value;

		// Make sure user user does not have ADMINISTRATOR permissions
		if (member.permissions.has(Flags.Administrator) || (member.roles.highest.comparePositionTo(guild.me.roles.highest) > 0)) {
			interaction.reply({ embeds: [channel.error('moderation/nick:TOO_POWERFUL', null, true)] });
		}

		// Make sure nickname is NOT longer than 32 characters
		if (nickname.length >= 32) return interaction.reply({ embeds: [channel.error('moderation/nick:LONG_NICKNAME', null, true)] });

		// Change nickname and tell user (send error message if dosen't work)
		try {
			await member.setNickname(nickname);
			interaction.reply({ embeds: [channel.error('moderation/nick:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
};
