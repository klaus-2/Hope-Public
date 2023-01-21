// Dependências
const fs = require('fs'),
	{ Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Fact extends Command {
	constructor(bot) {
		super(bot, {
			name: 'fact',
			dirname: __dirname,
			aliases: ['fato'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get a random fact about anything.',
			usage: '<prefix><commandName>',
			cooldown: 3000,
			examples: [
				'.fact',
				'!fato'
			]
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Pega dados do arquivo json de fatos
		fs.readFile(message.translate('Fun/fact:FFATO_DESC'), (err, data) => {
			const { facts } = JSON.parse(data);
			const num = Math.floor((Math.random() * facts.length));
			const embed = new Embed(bot, message.guild)
				.setTitle('Fun/fact:FACT_TITLE')
				.setThumbnail("https://i.imgur.com/ktiK03I.png")
				.setColor(16279836)
				.setTimestamp()
				.setDescription(facts[num])
				.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
			message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		});
	}
};
