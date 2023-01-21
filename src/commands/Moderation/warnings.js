// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
	{ WarningSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class Warnings extends Command {
	constructor(bot) {
		super(bot, {
			name: 'warnings',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['avisos'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Display number of warnings a user has.',
			usage: '<prefix><commandName> [user]',
			examples: [
				'.warnings',
				'!warnings @Klaus'
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
		// obtem um usuario
		const members = await message.getMember();

		// obtem os avisos de um usuario
		const warnings = await await WarningSchema.find({
			userID: members[0].id,
			guildID: message.guild.id,
		});

		if (!warnings[0]) {
			// There are no warnings with this user
			message.channel.error('Moderation/avisos:NO_WARNINGS').then(m => m.timedDelete({ timeout: 3500 }));
		} else {
			// Warnings have been found
			let list = `${message.translate('Moderation/avisos:AVISOS')} (${warnings.length}):\n`;
			for (let i = 0; i < warnings.length; i++) {
				list += `${i + 1}.) ${warnings[i].Reason} | ${(message.guild.members.cache.get(warnings[i].Moderater)) ? message.guild.members.cache.get(warnings[i].Moderater) : 'User left'} (Issue date: ${warnings[i].IssueDate})\n`;
			}

			const embed = new Embed(bot, message.guild)
				.setTitle('Moderation/avisos:WARNS_TITLE', { user: members[0].user.username })
				.setDescription(list)
				.setColor(16711709)
				.setTimestamp();
			message.channel.send({ embeds: [embed] });
		}
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

		// get warnings of user
		try {
			const warnings = await await WarningSchema.find({
				userID: member.id,
				guildID: guild.id,
			});

			if (!warnings[0]) {
				// There are no warnings with this user
				interaction.reply({ embeds: [channel.error('Moderation/avisos:NO_WARNINGS', {}, true)] });
			} else {
				// Warnings have been found
				let list = `${guild.translate('Moderation/avisos:AVISOS')} (${warnings.length}):\n`;
				for (let i = 0; i < warnings.length; i++) {
					list += `${i + 1}.) ${warnings[i].Reason} | ${(guild.members.cache.get(warnings[i].Moderater)) ? guild.members.cache.get(warnings[i].Moderater) : 'User left'} (Issue date: ${warnings[i].IssueDate})\n`;
				}

				const embed = new Embed(bot, guild)
					.setTitle('Moderation/avisos:WARNS_TITLE', { user: member.user.username })
					.setDescription(list)
					.setColor(16711709)
					.setTimestamp();
				interaction.reply({ embeds: [embed] });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)] });
		}
	}
};