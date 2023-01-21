// Dependências
const Command = require('../../structures/Command.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js');

module.exports = class Unban extends Command {
	constructor(bot) {
		super(bot, {
			name: 'unban',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['desbanir'],
			userPermissions: [Flags.BanMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.BanMembers],
			description: 'Unban a user.',
			usage: '<prefix><commandName> <user> [reason]',
			examples: [
				'.unban @Klaus',
				'!unban @Hope oops'
			],
			cooldown: 5000,
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

		// Desbani um usuario
		const user = message.args[0];
		if (!user) {
			return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}
		await message.guild.bans.fetch().then(async bans => {
			if (bans.size == 0) return;
			const bUser = bans.find(ban => ban.user.id == user);
			if (!bUser) return;
			message.guild.bans.remove(bUser.user);
			message.channel.success('misc:SUCCESSFULL_UNBAN', { user: bUser.user }).then(m => m.timedDelete({ timeout: 3000 }));
		});
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
		const userID = args.get('user').value,
			channel = guild.channels.cache.get(interaction.channelId);

		// Unban user
		try {
			await guild.bans.fetch().then(async bans => {
				if (bans.size == 0) return interaction.reply({ embeds: [channel.error('Moderation/unban:NO_ONE', null, true)] });
				const bUser = bans.get(userID);
				if (bUser) {
					await guild.bans.remove(bUser.user);
					interaction.reply({ embeds: [channel.error('Moderation/unban:SUCCESS', { USER: bUser.user }, true)] });
				} else {
					interaction.reply({ embeds: [channel.error('Moderation/unban:MISSING', { ID: userID }, true)] });
				}
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
};