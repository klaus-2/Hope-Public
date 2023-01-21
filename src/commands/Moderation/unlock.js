// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Unlock extends Command {
	constructor(bot) {
		super(bot, {
			name: 'unlock',
			aliases: ['destrancar'],
			dirname: __dirname,
			userPermissions: [Flags.ManageGuild, Flags.ManageChannels],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Unlock a channel.',
			usage: '<prefix><commandName>',
			examples: [
				'.unlock'
			],
			cooldown: 3000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The channel to lock.',
					type: ApplicationCommandOptionType.Channel,
					channelTypes: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD', 'GUILD_NEWS'],
					required: true,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
			SEND_MESSAGES: true
		})
		const embed = new Embed(bot, message.guild)
			.setTitle('Moderation/unlock:DESTRANCAR1')
			.setDescription(message.translate('Moderation/unlock:DESTRANCAR', { channel: message.channel }))
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Moderation/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
			.setColor(10147968);

		if (settings.ModerationClearToggle && message.deletable) message.delete();
		message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
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
		const channel = guild.channels.cache.get(args.get('channel').value),
			{ settings } = guild;

		// Get channel and update permissions
		try {
			await channel.permissionOverwrites.edit(guild.roles.everyone, {
				SEND_MESSAGES: true,
			});
			for (const role of (settings.welcomeRoleGive ?? [])) {
				await channel.permissionOverwrites.edit(role, {
					SEND_MESSAGES: true,
				});
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}