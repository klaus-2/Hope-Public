// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');
moment.locale('pt-br');

module.exports = class RoleInfo extends Command {
	constructor(bot) {
		super(bot, {
			name: 'roleinfo',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['infocargo'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get information about a role.',
			usage: '<prefix><commandName> <role>',
			examples: [
				'.roleinfo @role',
				'!roleinfo roleID',
				'?roleinfo roleName'
			],
			cooldown: 3000,
			slash: false,
			options: [{
				name: 'role',
				description: 'Get information of the role.',
				type: ApplicationCommandOptionType.Role,
				required: true,
			}],
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// Check to see if a role was mentioned
		const roles = message.getRole();
		// Make sure it's a role on the server
		if (!roles[0]) {
			return message.channel.error('misc:MISSING_ROLE').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}

		const embed = this.createEmbed(bot, message.guild, roles[0], message.author);
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
		const role = guild.roles.cache.get(args.get('role').value);
		const user = interaction.member.user;
		// send embed
		const embed = this.createEmbed(bot, guild, role, user);
		interaction.reply({ embeds: [embed] });
	}
	/**
	 * Function for creating embed of role information.
	 * @param {bot} bot The instantiating client
	 * @param {guild} Guild The guild the command was ran in
	 * @param {role} Role The role to get information from
	 * @param {user} User The user for embed#footer
	 * @returns {embed}
	*/
	createEmbed(bot, guild, role, user) {
		// translate permissions
		const permissions = role.permissions.toArray().map((p) => guild.translate(`permissions:${p}`)).join(' » ');
		// Send information to channel
		return new Embed(bot, guild)
			.setColor(role.color)
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
			.setDescription(guild.translate('Guild/roleinfo:ROLE_NAME', { roleName: role.name }))
			.addFields(
				{ name: guild.translate('Guild/roleinfo:ROLE_MEMBERS'), value: role.members.size.toLocaleString(guild.settings.Language), inline: true },
				{ name: guild.translate('Guild/roleinfo:ROLE_COLOR'), value: role.hexColor, inline: true },
				{ name: guild.translate('Guild/roleinfo:ROLE_POSITION'), value: `${role.position}`, inline: true },
				{ name: guild.translate('Guild/roleinfo:ROLE_MENTION'), value: `<@&${role.id}>`, inline: true },
				{ name: guild.translate('Guild/roleinfo:ROLE_HOISTED'), value: `${role.hoist}`, inline: true },
				{ name: guild.translate('Guild/roleinfo:ROLE_MENTIONABLE'), value: `${role.mentionable}`, inline: true },
				{ name: guild.translate('Guild/roleinfo:ROLE_PERMISSION'), value: permissions },
				{ name: guild.translate('Guild/roleinfo:ROLE_CREATED'), value: moment(role.createdAt).format('lll') },
			)
			.setTimestamp()
			.setFooter({ text: guild.translate('Guild/roleinfo:ROLE_FOOTER', { MEMBER: user.tag, ID: role.id }) });
	}
};
