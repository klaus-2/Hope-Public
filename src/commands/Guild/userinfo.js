// Dependências
const { Embed } = require(`../../utils`),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Nickname = require(`../../database/models/nicknames`),
	Usernames = require(`../../database/models/usernames`),
	Command = require('../../structures/Command.js');

module.exports = class UserInfo extends Command {
	constructor(bot) {
		super(bot, {
			name: 'userinfo',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['infouser', 'whois'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get detailed information of a user.',
			usage: '<prefix><commandName> [user]',
			examples: [
				'.userinfo @Klaus',
				'!infouser 622812963572809771',
				'?whois Klaus'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'user',
				description: 'The user you want to get information of',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// obtem um usuario
		const member = message.mentions.members.last() || message.member;

		// Calculate Join Position
		let joinPosition;
		const members = [...message.guild.members.cache.values()];
		members.sort((a, b) => a.joinedAt - b.joinedAt);
		for (let i = 0; i < members.length; i++) {
			if (members[i].id == member) joinPosition = i;
		}

		const phrase = () => {
			const p = [
				message.translate('misc:BUSCAR_DADOS'),
				message.translate('misc:BUSCAR_DADOS1'),
				message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
			];
			return p[Math.floor(Math.random() * p.length)];
		};

		const msg = await message.channel.send(phrase());

		const userFlags = (await member.user.fetchFlags()).toArray();

		const flags = {
			Staff: message.translate('Guild/userinfo:INFO_USER4'),
			Partner: message.translate('Guild/userinfo:INFO_USER5'),
			Hypesquad: message.translate('Guild/userinfo:INFO_USER8'),
			BugHunterLevel1: message.translate('Guild/userinfo:INFO_USER6'),
			HypeSquadOnlineHouse1: message.translate('Guild/userinfo:INFO_USER9'),
			HypeSquadOnlineHouse2: message.translate('Guild/userinfo:INFO_USER10'),
			HypeSquadOnlineHouse3: message.translate('Guild/userinfo:INFO_USER11'),
			PremiumEarlySupporter: message.translate('Guild/userinfo:INFO_USER12'),
			TeamPseudoUser: message.translate('Guild/userinfo:INFO_USER13'),
			BugHunterLevel2: message.translate('Guild/userinfo:INFO_USER7'),
			VerifiedBot: message.translate('Guild/userinfo:INFO_USER15'),
			VerifiedDeveloper: message.translate('Guild/userinfo:INFO_USER16'),
			CertifiedModerator: '<:certified_moderator:864765437018767371>',
			BotHTTPInteractions: '<:bot_http_interactions:729455298917564467>',
			Spammer: 'Spammer'
		};

		let usernames = []
		// user  tags
		let userName = await Usernames.findOne({
			discordId: member.id
		})

		if (!userName) {
			const newUser = new Usernames({
				discordId: member.id
			})

			newUser.save()

			usernames = message.translate('Guild/userinfo:INFO_USER36');
		} else {
			usernames = userName.usernames.join(' - ')
			if (!userName.usernames.length) usernames = message.translate('Guild/userinfo:INFO_USER36')
		}

		let nickname = []
		// user nicknames
		const nicknames = await Nickname.findOne({
			discordId: member.id,
			guildId: message.guild.id
		})

		if (!nicknames) {
			const newUser = new Nickname({
				discordId: member.id,
				guildId: message.guild.id
			})

			newUser.save()

			nickname = message.translate('Guild/userinfo:INFO_USER37')
		} else {
			nickname = nicknames.nicknames.join(" - ")
			if (!nicknames.nicknames.length) nickname = message.translate('Guild/userinfo:INFO_USER37')
		}

		// send user info
		const embed = new Embed(bot, message.guild)
			.setColor(1)
			.setTitle('Guild/userinfo:INFO_USER17')
			.setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true }))
			.addFields(
				{ name: message.translate('Guild/userinfo:INFO_USER18'), value: `${member.user.username}`, inline: true },
				{ name: message.translate('Guild/userinfo:INFO_USER19'), value: `${member.user.discriminator}`, inline: true },
				{ name: message.translate('Guild/userinfo:INFO_USER20'), value: `${member.id}`, inline: true },
				{ name: message.translate('Guild/userinfo:INFO_USER21'), value: `${member.nickname != null ? member.nickname : message.translate('Guild/userinfo:INFO_USER22')}`, inline: true },
				{ name: message.translate('Guild/userinfo:INFO_USER34'), value: `${usernames ?? message.translate('Guild/userinfo:INFO_USER36')}`, inline: true },
				{ name: message.translate('Guild/userinfo:INFO_USER24'), value: `[${message.translate('Guild/userinfo:INFO_USER25')}](${member.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })})`, inline: true },
				{ name: message.translate('Guild/userinfo:INFO_USER35'), value: `${nickname ?? message.translate('Guild/userinfo:INFO_USER37')}`, inline: true },
				{ name: message.translate('Guild/userinfo:INFO_USER23'), value: `${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : message.translate('Guild/userinfo:INFO_USER22')}`, inline: true },
				{ name: message.translate('Guild/userinfo:INFO_USER26'), value: `<t:${ISOtoUnix(member.user.createdAt)}:f> ${message.translate('Guild/userinfo:INFO_USER27')} <t:${ISOtoUnix(member.user.createdAt)}:R> \`(${Math.round((new Date() - member.user.createdAt) / 86400000)} ${message.translate('Guild/userinfo:INFO_USER28')})\``, inline: false },
				{ name: message.translate('Guild/userinfo:INFO_USER29'), value: `<t:${ISOtoUnix(member.joinedAt)}:f> ${message.translate('Guild/userinfo:INFO_USER27')} <t:${ISOtoUnix(member.joinedAt)}:R> \`(${Math.round((new Date() - member.joinedAt) / 86400000)} ${message.translate('Guild/userinfo:INFO_USER28')})\``, inline: false },
				{ name: message.translate('Guild/userinfo:INFO_USER42'), value: `${message.translate('Guild/userinfo:INFO_USER43', { member: member.displayName, joinPosition: joinPosition || 1 })}`, inline: false },
				{ name: "🌎 Mutual Servers:", value: `${bot.guilds.cache.filter(a => a.members.cache.get(member.user.id)).map(a => a.name).join(', ') ?? message.translate('Guild/userinfo:INFO_USER37') }`, inline: true },
				{ name: `${message.translate('Guild/userinfo:USER_ROLES', { number: member.roles.cache.size })}${message.translate('Guild/userinfo:USER_ROLESS', { number: message.guild.roles.cache.size })}`, value: `${member.roles.cache.sort((a, b) => b.rawPosition - a.rawPosition).reduce((a, b) => `${a}, ${b}`)}`, inline: false },
				{ name: message.translate('Guild/userinfo:USER_PERMISSIONS', { number: member.permissions.toArray().length }), value: member.permissions.toArray().toString().toLowerCase().replace(/_/g, ' ').replace(/,/g, ' » '), inline: false })
			//{ name: `\u200b`, `\u200b`)
			.setTimestamp(new Date())
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })

		msg.delete()
		message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}
};

function ISOtoUnix(iso) {
	const dateStr = iso;
	const date = new Date(dateStr);
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	return unixTimestamp;
}