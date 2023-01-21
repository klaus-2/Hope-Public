// Dependências
const { WarningSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Clearwarnings extends Command {
	constructor(bot) {
		super(bot, {
			name: 'clearwarnings',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['ap-avisos', 'avisosapagar', 'clear-warnings', 'clear-warning', 'apagar-avisos'],
			userPermissions: [Flags.KickMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Remove warnings from a user.',
			usage: '<prefix><commandName> <user>',
			examples: [
				'.clearwarnings @Klaus',
				'!clear-warnings @Hope'
			],
			cooldown: 5000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to clear warning from.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'warn-num',
					description: 'The warning number.',
					type: ApplicationCommandOptionType.Integer,
					required: false,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		//SE DIGITAR ERRADO
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('Moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		// obtem os dados da db
		// encontra os dados
		const warns = await WarningSchema.find({
			userID: members[0].user.id,
			guildID: message.guild.id,
		});

		// verificar se foi introduzido um numero de avisos
		if (message.args[1] - 1 <= warns.length) {
			// deleta da db
			await WarningSchema.findByIdAndRemove(warns[message.args[1] - 1]._id);
		} else {
			await WarningSchema.deleteMany({ userID: members[0].user.id, guildID: message.guild.id });
		}
		message.channel.success('Moderation/clearwarnings:CLEARED_WARNINGS', members[0]).then(m => m.timedDelete({ timeout: 10000 }));
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
			num = args.get('warn-num').value;

		// get warnings of user
		try {
			// find data
			const warns = await WarningSchema.find({
				userID: member.user.id,
				guildID: guild.id,
			});

			// check if a warning number was entered
			if (num - 1 <= warns.length) {
				// Delete item from database as bot didn't crash
				await WarningSchema.findByIdAndRemove(warns[num - 1]._id);
			} else {
				await WarningSchema.deleteMany({ userID: member.user.id, guildID: guild.id });
			}
			interaction.reply(guild.translate('Moderation/clearwarnings:CLEARED_WARNINGS', { user: member }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true });
		}
	}
};