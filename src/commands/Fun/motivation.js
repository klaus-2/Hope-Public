// Dependências
const { Embed, func: { genInviteLink } } = require(`../../utils`),
	{ fetch } = require('undici'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Motivation extends Command {
	constructor(bot) {
		super(bot, {
			name: 'motivation',
			dirname: __dirname,
			aliases: ['mot', 'motivação'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get a motivational quote to enhance your day.',
			usage: '<prefix><commandName>',
			examples: [
				'/motivation',
				'.motivation',
				'!mot',
				'?motivação'
			],
			cooldown: 5000,
			slash: true,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		await fetch(`https://type.fit/api/quotes`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(mot => {
			var i = Math.floor(Math.random() * (mot.length - 1));

			const quoteEmbed = new Embed(bot, message.guild)
				.setAuthor({ name: message.translate('Fun/motivation:FMOT_DESC1'), iconURL: 'https://i.imgur.com/Cnr6cQb.png', url: genInviteLink(bot) })
				.setDescription(`*"${mot[i].text}*"\n\n-${mot[i].author ?? 'Unknown'}`)
				.setTimestamp()
				.setThumbnail("https://i.imgur.com/8TYdKGG.png")
				.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
				.setColor(16279836)

			return message.channel.send({ embeds: [quoteEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		});
	}
	// EXEC - SLASH
	async callback(bot, interaction, guild, args) {
		const member = interaction.user;
		const channel = guild.channels.cache.get(interaction.channelId);

		try {
			// Get Interaction Message Data
			await interaction.deferReply();

			await fetch(`https://type.fit/api/quotes`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(mot => {
				var i = Math.floor(Math.random() * (mot.length - 1));

				const quoteEmbed = new Embed(bot, guild)
					.setAuthor({ name: guild.translate('Fun/motivation:FMOT_DESC1'), iconURL: 'https://i.imgur.com/Cnr6cQb.png', url: genInviteLink(bot) })
					.setDescription(`*"${mot[i].text}*"\n\n-${mot[i].author ?? 'Unknown'}`)
					.setTimestamp()
					.setThumbnail("https://i.imgur.com/8TYdKGG.png")
					.setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
					.setColor(16279836)

				return interaction.editReply({ embeds: [quoteEmbed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
			});
		} catch (error) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
		}
	}
};