// Dependências
const { Embed } = require(`../../utils`),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags }, GuildMember } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

module.exports = class Avatar extends Command {
	constructor(bot) {
		super(bot, {
			name: 'avatar',
			aliases: ['foto'],
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Displays the user\'s profile picture.',
			usage: '<prefix><commandName> [user]',
			examples: [
				'.avatar @Klaus',
				'!avatar Klaus',
				'?avatar userID'
			],
			cooldown: 3000,
			slash: false,
			options: [{
				name: 'user',
				description: 'The user you want the avatar of',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// obtem um usuario
		const members = await message.getMember();

		/* let avatares = []

		// user nicknames
		const avatar = await Avatares.findOne({
			userID: members[0].id
		})
		if (!avatar) {

			const newUser = new Avatares({
				userID: members[0].id
			})

			newUser.save()


			avatares = message.translate('Guild/infouser:INFO_USER38')
		} else {

			avatares = avatar.avatares.join(" - ")
			if (!avatar.avatares.length) avatares = message.translate('Guild/infouser:INFO_USER38')

		} */

		// envia a msg
		const embed = new Embed(bot, message.guild)
			.setAuthor({ name: message.translate('Guild/avatar:FOTO') })
			.setColor(1)
			.setDescription(`${message.translate('Guild/avatar:AVATAR_DESCRIPTION')}\n[png](${members[0].user.displayAvatarURL({ format: 'png', size: 1024 })}) | [jpg](${members[0].user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [gif](${members[0].user.displayAvatarURL({ format: 'gif', size: 1024, dynamic: true })}) | [webp](${members[0].user.displayAvatarURL({ format: 'webp', size: 1024 })})`) // \n\n${message.translate('Guild/avatar:FOTO1')}\n${avatares || message.translate('Guild/infouser:INFO_USER38')}
			.setTimestamp()
			.setImage(`${members[0].user.displayAvatarURL({ dynamic: true, size: 1024 })}`)
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Servidor/avatar:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
		message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}

	/**
   * Function for recieving slash command.
   * @param {bot} bot The instantiating client
   * @param {interaction} interaction The interaction that ran the command
   * @param {guild} guild The guild the interaction ran in
 * @param {args} args The options provided in the command, if any
   * @readonly
*/
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
		const embed = this.avatarEmbed(bot, guild, member);

		// send embed
		return interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for recieving context menu
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	reply(bot, interaction, channel, userID) {
		let member;
		if (channel.type == ChannelType.DM) {
			member = new GuildMember(bot, bot.users.cache.get(userID));
			member._patch({ user: bot.users.cache.get(userID) });
		} else {
			member = channel.guild.members.cache.get(userID);
		}

		// send embed
		const embed = this.avatarEmbed(bot, false, member);
		return interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating avatar embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @param {member} GuildMember The guildMember to get the avatar from
	 * @returns {embed}
	*/
	avatarEmbed(bot, guild, member) {

		return new Embed(bot, guild)
			.setAuthor({ name: bot.translate('Guild/avatar:FOTO') })
			.setColor(1)
			.setDescription(`${bot.translate('Guild/avatar:AVATAR_DESCRIPTION')}\n[png](${member.user.displayAvatarURL({ format: 'png', size: 1024 })}) | [jpg](${member.user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [gif](${member.user.displayAvatarURL({ format: 'gif', size: 1024, dynamic: true })}) | [webp](${member.user.displayAvatarURL({ format: 'webp', size: 1024 })})`)
			.setImage(`${member.user.displayAvatarURL({ dynamic: true, size: 1024 })}`);
	}
};
