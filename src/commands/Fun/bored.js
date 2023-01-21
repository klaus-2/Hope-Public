// Dependências
const { Embed } = require(`../../utils`),
	{ fetch } = require('undici'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Bored extends Command {
	constructor(bot) {
		super(bot, {
			name: 'bored',
			dirname: __dirname,
			aliases: ['tedio', 'entediado'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get a hint from Hope to get rid of the boredom.',
			usage: '<prefix><commandName>',
			cooldown: 5000,
			examples: [
				'.bored',
				'!tedio',
				'?entediado'
			]
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		const tedio = await fetch(`https://www.boredapi.com/api/activity`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

		let price;
		if (tedio.price > 0) price = 'requires only $' + tedio.price + ' dollars.';
		if (tedio.price === 0) price = 'and there will be no expenditure of money for this.';

		const answerEmbed = new Embed(bot, message.guild)
			.setColor(16279836)
			.setThumbnail("https://i.imgur.com/13tK1ri.png")
			.setAuthor({ name: message.translate('Fun/bored:FTEDIO_DESC1'), iconURL: 'https://i.imgur.com/HCirrgY.png', url: 'https://discord.com/oauth2/authorize?client_id=808100514729951262&permissions=8&scope=bot' })
			.setDescription(`How about trying something related to **${tedio.type}**?\nHm...\nTry **${tedio.activity}**, it only requires **${tedio.participants}** person and **${price}**.`)
			.setTimestamp()
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
		return message.channel.send({ embeds: [answerEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}
};