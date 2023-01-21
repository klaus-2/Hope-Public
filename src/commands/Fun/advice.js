// Dependências
const { EmbedBuilder, PermissionsBitField: { Flags } } = require('discord.js'),
	{ fetch } = require('undici'),
	Command = require('../../structures/Command.js');

class Advice extends Command {
	constructor(bot) {
		super(bot, {
			name: 'advice',
			aliases: ['conselho', 'board'],
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get random advice from Hope.',
			usage: '<prefix><commandName>',
			cooldown: 3000,
			examples: [
				'.advice',
				'!board',
				'?conselho'
			]
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		const phrase = () => {
			const p = [
				message.translate('misc:BUSCAR_DADOS'),
				message.translate('misc:BUSCAR_DADOS1'),
				message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
			];
			return p[Math.floor(Math.random() * p.length)];
		};

		const msg = await message.channel.send(phrase());

		try {
			const conselho = await fetch(`https://api.adviceslip.com/advice`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

			msg.delete();
			const answerEmbed = new EmbedBuilder()
				.setAuthor({ name: message.translate('Fun/advice:FCONSELHO', { bot: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
				.setThumbnail('https://i.imgur.com/KXsgUyy.png')
				.setColor(16279836)
				.setDescription(conselho.slip.advice)
				.setTimestamp()
				.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

			return message.channel.send({ embeds: [answerEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Advice;