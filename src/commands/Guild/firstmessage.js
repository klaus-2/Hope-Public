// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

module.exports = class Firstmessage extends Command {
	constructor(bot) {
		super(bot, {
			name: 'firstmessage',
			guildOnly: true,
			aliases: ['primeiramensagem', 'firstmsg', 'first-msg'],
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Gets the first message from the channel.',
			usage: '<prefix><commandName> [channel]',
			examples: [
				'.firstmessage',
				'firstmsg #channel'
			],
			cooldown: 3000,
			slash: false,
			options: [{
				name: 'channel',
				description: 'The specified channel to grab the first message of.',
				type: ApplicationCommandOptionType.Channel,
				channelTypes: [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNews],
				required: false,
			}],
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// obtem o canal
		const channel = message.getChannel();

		// obtem a primeira mensagem no canal
		const fMessage = await channel[0].messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
		const embed = new Embed(bot, message.guild)
			.setColor(1)
			.setThumbnail(fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
			.setAuthor({ name: fMessage.author.tag, iconURL: fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }) })
			.setDescription(fMessage?.content || 'No content or [Embed].')
			.setTimestamp(fMessage.createdAt)
			.setFooter({ text: `ID: ${fMessage.id}` })
			.addFields(
				{ name: message.translate('Guild/firstmessage:PRIMEIRA_MENSAGEM'), value: fMessage.url },
			)
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
		const channel = guild.channels.cache.get(args.get('channel')?.value ?? interaction.channelId);

		try {
			// get first message in channel
			const fMessage = await channel.messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
			const embed = this.createEmbed(bot, guild, fMessage);
			// send embed
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
	/**
	 * Function for creating first message embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @param {fMessage} Message The first message of the channel
	 * @returns {embed}
	*/
	createEmbed(bot, guild, fMessage) {
		return new Embed(bot, guild)
			.setColor(fMessage.member ? fMessage.member.displayHexColor : 0x00AE86)
			.setThumbnail(fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
			.setAuthor({ name: fMessage.author.tag, iconURL: fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }) })
			.setDescription(fMessage?.content || 'No content or [Embed].')
			.addField(bot.translate('Guild/firstmessage:PRIMEIRA_MENSAGEM'), fMessage.url)
			.setFooter({ text: `ID: ${fMessage.id}` })
			.setTimestamp(fMessage.createdAt);
	}
};
