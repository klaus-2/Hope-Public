// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

const filterLevels = {
	DISABLED: 'Off',
	MEMBERS_WITHOUT_ROLES: 'No Role',
	ALL_MEMBERS: 'Everyone'
};

const tiers = {
	TIER_1: '1',
	TIER_2: '2',
	TIER_3: '3',
	TIER_4: '4'
}

module.exports = class GuildInfo extends Command {
	constructor(bot) {
		super(bot, {
			name: 'guildinfo',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['serverinfo', 'infoserver', 'infoservidor'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get information on the server.',
			usage: '<prefix><commandName>',
			examples: [
				'.guildinfo',
				'!infoserver',
				'?serverinfo'
			],
			cooldown: 10000,
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
		const members = message.guild.members.cache;
		//const members = await message.getMember();
		const owner = await message.guild.fetchOwner();
		const channels = message.guild.channels.cache;
		const emojis = message.guild.emojis.cache;
		//const guild = bot.guilds.cache.get(message.guild.id);

		const verificationLevels = {
			NONE: message.translate('Guild/guildinfo:INFO_SERVER'),
			LOW: message.translate('Guild/guildinfo:INFO_SERVER1'),
			MEDIUM: message.translate('Guild/guildinfo:INFO_SERVER2'),
			HIGH: '(╯°□°）╯︵ ┻━┻',
			VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
		};


		const phrase = () => {
			const p = [
				message.translate('misc:BUSCAR_DADOS'),
				message.translate('misc:BUSCAR_DADOS1'),
				message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
			];
			return p[Math.floor(Math.random() * p.length)];
		};

		const msg = await message.channel.send(phrase());

		const embed = new Embed(bot, message.guild)
			.setColor(1)
			.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true }))
			.setAuthor({ name: message.translate('Guild/guildinfo:INFO_SERVER3'), iconURL: message.guild.iconURL({ extension: 'png', forceStatic: false, size: 1024 }) })
			.addFields(
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER4')}`, value: `${message.guild.name}`, inline: false },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER5')}`, value: `${message.guild.id}`, inline: false },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER6')}`, value: `[${owner.user.tag}](https://discordapp.com/users/${owner.user.id}) | ID (${message.guild.ownerId})`, inline: false },
				//{ name: `${message.translate('Guild/guildinfo:INFO_SERVER7')}`, value: `${regions[message.guild.region]}`, inline: true },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER8')}`, value: `${tiers[message.guild.premiumTier] ? `${message.translate('Guild/guildinfo:INFO_SERVER9')} ${tiers[message.guild.premiumTier]}` : message.translate('Guild/guildinfo:INFO_SERVER')}`, inline: true },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER10')}`, value: `${message.guild.premiumSubscriptionCount || '0'} ${message.translate('Guild/guildinfo:INFO_SERVER11')}`, inline: true },
				//{ name: `${message.translate('Guild/guildinfo:INFO_SERVER12')}`, value:  message.guild.premiumTier || '0', inline: true },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER13')}`, value: `${verificationLevels[message.guild.verificationLevel]}`, inline: true },
				{ name: `${message.translate('Guild/guildinfo:GUILD_CREATED')}`, value: `<t:${ISOtoUnix(message.guild.createdAt)}:f> ${message.translate('Guild/guildinfo:INFO_SERVER14')} <t:${ISOtoUnix(message.guild.createdAt)}:R>`, inline: true },// \`exatamente ${moment(message.guild.createdAt).fromNow()} (${Math.round((new Date() - message.guild.createdAt) / 86400000)} dia(s) atrás)\`
				//{ name: `\u200b`, `\u200b`)
				// { name: `${message.translate('Guild/guildinfo:INFO_SERVER16')}`, `**❯** ${message.translate('Guild/guildinfo:INFO_SERVER17')} **${roles.length} ${message.translate('Guild/guildinfo:INFO_SERVER18')} **${emojis.size} ${message.translate('Guild/guildinfo:INFO_SERVER19')} **${emojis.filter(emoji => !emoji.animated).size}** ${message.translate('Guild/guildinfo:INFO_SERVER20')} **${emojis.filter(emoji => emoji.animated).size}** ${message.translate('Guild/guildinfo:INFO_SERVER21')} **${message.guild.members.memberCount} ${message.translate('Guild/guildinfo:INFO_SERVER22')} **${members.filter(member => !member.user.bot).size} ${message.translate('Guild/guildinfo:INFO_SERVER23')} **${members.filter(member => member.user.bot).size} ${message.translate('Guild/guildinfo:INFO_SERVER24')}**.`)
				//{ name: `Atualmente este servidor possui um total de ${roles.length} cargos, com ${emojis.size} emojis, entre eles ${emojis.filter(emoji => !emoji.animated).size} são emojis normais e ${emojis.filter(emoji => emoji.animated).size} são emojis animados.\nEste servidor possui ${message.guild.members.memberCount} membros, com ${members.filter(member => !member.user.bot).size} humanos e ${members.filter(member => member.user.bot).size} bots.`)
				/*{ name: `Role Count`, `${roles.length}`, inline: true },
				{ name: `Emoji Count`, `${emojis.size}`, inline: true },
				{ name: `Regular Emoji Count`, `${emojis.filter(emoji => !emoji.animated).size}`, inline: true },
				{ name: `Animated Emoji Count`, `${emojis.filter(emoji => emoji.animated).size}`, inline: true },
				{ name: `Member Count`, `${message.guild.members.memberCount}`, inline: true },
				{ name: `Humans`, `${members.filter(member => !member.user.bot).size}`, inline: true },
				{ name: `Bots`, `${members.filter(member => member.user.bot).size}`, inline: true },*/
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER25')}`, value: `${channels.filter(channel => channel.type === 0).size} ${message.translate('Guild/guildinfo:INFO_SERVER26')}`, inline: true },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER27')}`, value: `${channels.filter(channel => channel.type === 2).size} ${message.translate('Guild/guildinfo:INFO_SERVER26')}`, inline: true },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER28')}`, value: `${message.guild.afkTimeout / 60} ${message.translate('Guild/guildinfo:INFO_SERVER29')}`, inline: true },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER12')}`, value: tiers[message.guild.premiumTier] ? `${message.translate('Guild/guildinfo:INFO_SERVER9')} ${tiers[message.guild.premiumTier]}` : '0', inline: true },
				{ name: `${message.translate('Guild/guildinfo:INFO_SERVER30')}`, value: `${message.guild.afkChannelId === null ? 'None' : '<#' + message.guild.afkChannelId + '>'} ${message.guild.afkChannelId === null ? '\u200b' : '(' + message.guild.afkChannelId + ')'}`, inline: true },
				// { name: message.translate('Guild/guildinfo:INFO_SERVER32'), `**❯** ${message.translate('Guild/guildinfo:INFO_SERVER33')} **${members.filter(m => m.presence?.status === 'online').size.toLocaleString(settings.Language)} ${message.translate('Guild/guildinfo:INFO_SERVER34')}**, **${members.filter(m => m.presence?.status === 'idle').size.toLocaleString(settings.Language)}** ${message.translate('Guild/guildinfo:INFO_SERVER35')} **${members.filter(m => m.presence?.status === 'dnd').size.toLocaleString(settings.Language)}** ${message.translate('Guild/guildinfo:INFO_SERVER36')} **${members.filter(m => m.presence?.status === 'offline').size.toLocaleString(settings.Language)}** ${message.translate('Guild/guildinfo:INFO_SERVER37')}`)
				/*{ name: `Membros Online`, `${members.filter(member => member.presence.status === 'online').size}`, inline: true },
				{ name: `Membros Ausentes`, `${members.filter(member => member.presence.status === 'idle').size}`, inline: true },
				{ name: `Membros Ocupados`, `${members.filter(member => member.presence.status === 'dnd').size}`, inline: true },
				{ name: `Membros Offline`, `${members.filter(member => member.presence.status === 'offline').size}`, inline: true },*/
				//{ name: `Funções`, `\u200b`)
				{ name: message.translate('Guild/guildinfo:GUILD_ROLES', { number: message.guild.roles.cache.size }), value: `${roles.join(', ')}${(roles.length != [...message.guild.roles.cache.sort((a, b) => b.position - a.position).values()].length) ? '...' : '.'}`, inline: true })
			/*.setDescription(`**Guild information for __${message.guild.name}__**`)
			{ name: 'General', [
				`**❯ Name:** ${message.guild.name}`,
				`**❯ ID:** ${message.guild.id}`,
				`**❯ Owner:** ${message.guild.owner.user.tag} (${message.guild.ownerID})`,
				`**❯ Region:** ${regions[message.guild.region]}`,
				`**❯ Boost Tier:** ${message.guild.premiumTier ? `Tier ${message.guild.premiumTier}` : 'None'}`,
				`**❯ Explicit Filter:** ${filterLevels[message.guild.explicitContentFilter]}`,
				`**❯ Verification Level:** ${verificationLevels[message.guild.verificationLevel]}`,
				`**❯ Time Created:** ${moment(message.guild.createdTimestamp).format('LT')} ${moment(message.guild.createdTimestamp).format('LL')} ${moment(message.guild.createdTimestamp).fromNow()}`,
				'\u200b'
			])
			{ name: 'Statistics', [
				`**❯ Role Count:** ${roles.length}`,
				`**❯ Emoji Count:** ${emojis.size}`,
				`**❯ Regular Emoji Count:** ${emojis.filter(emoji => !emoji.animated).size}`,
				`**❯ Animated Emoji Count:** ${emojis.filter(emoji => emoji.animated).size}`,
				`**❯ Member Count:** ${message.guild.members.memberCount}`,
				`**❯ Humans:** ${members.filter(member => !member.user.bot).size}`,
				`**❯ Bots:** ${members.filter(member => member.user.bot).size}`,
				`**❯ Text Channels:** ${channels.filter(channel => channel.type === 'text').size}`,
				`**❯ Voice Channels:** ${channels.filter(channel => channel.type === 'voice').size}`,
				`**❯ Boost Count:** ${message.guild.premiumSubscriptionCount || '0'}`,
				'\u200b'
			])
			{ name: 'Presence', [
				`**❯ Online:** ${members.filter(member => member.presence.status === 'online').size}`,
				`**❯ Idle:** ${members.filter(member => member.presence.status === 'idle').size}`,
				`**❯ Do Not Disturb:** ${members.filter(member => member.presence.status === 'dnd').size}`,
				`**❯ Offline:** ${members.filter(member => member.presence.status === 'offline').size}`,
				'\u200b'
			])
			{ name: `Roles ${roles.join(', ')}${(roles.length != message.guild.roles.cache.sort((a, b) => b.position - a.position).array().length) ? '...' : '.'}`)*/
			.setTimestamp(new Date())
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Guild/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

		if (message.guild.banner) embed.setImage(`https://cdn.discordapp.com/splashes/${message.guild.id}/${message.guild.banner}.png?size=1024`)

		msg.delete()
		message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}

};

function ISOtoUnix(iso) {
	const dateStr = iso;

	const date = new Date(dateStr);
	// console.log(date); // 👉️ Wed Jun 22 2022

	// const timestampInMs = date.getTime();

	const unixTimestamp = Math.floor(date.getTime() / 1000);
	return unixTimestamp;
}
