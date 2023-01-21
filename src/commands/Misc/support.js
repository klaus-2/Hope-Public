// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Support extends Command {
	constructor(bot) {
		super(bot, {
			name: 'support',
			dirname: __dirname,
			aliases: ['supp', 'suporte'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Shows the invitation to the Hope Support Server.',
			usage: '<prefix><commandName>',
			examples: [
				'.support',
				'!supp',
				'?suporte'
			],
			cooldown: 3000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		const embed = new Embed(bot, message.guild)
			.setTitle('Misc/support:ESUP_DESC')
			.setColor(16775424)
			.setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
			.setDescription(message.translate('Misc/support:ESUP_DESC1'))
			.addFields({ name: message.translate('Misc/support:ESUP_DESC2'), value: message.translate('Misc/support:ESUP_DESC3') + message.translate('Misc/support:ESUP_DESC4'), inline: false })
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
			.setTimestamp();
		message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}
};

