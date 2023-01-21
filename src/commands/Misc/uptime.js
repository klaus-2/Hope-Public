// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');
const moment = require('moment');

module.exports = class Uptime extends Command {
	constructor(bot) {
		super(bot, {
			name: 'uptime',
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get Hope\'s uptime.',
			usage: '<prefix><commandName>',
			examples: [
				'.uptime'
			],
			cooldown: 3000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		const d = moment.duration(message.client.uptime);
		const days = (d.days() == 1) ? `${d.days()} ${message.translate('time:dia')}` : `${d.days()} ${message.translate('time:dias')}`;
		const hours = (d.hours() == 1) ? `${d.hours()} ${message.translate('time:hora')}` : `${d.hours()} ${message.translate('time:horas')}`;
		const minutes = (d.minutes() == 1) ? `${d.minutes()} ${message.translate('time:minuto')}` : `${d.minutes()} ${message.translate('time:minutos')}`;
		const seconds = (d.seconds() == 1) ? `${d.seconds()} ${message.translate('time:segundo')}` : `${d.seconds()} ${message.translate('time:segundos')}`;
		const date = moment().subtract(d, 'ms').format('lll');
		const embed = new Embed(bot, message.guild)
			.setTitle('Misc/uptime:EUP_DESC')
			.setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
			.setDescription(`\`\`\`prolog\n${days}, ${hours}, ${minutes}, ${message.translate('time:e')} ${seconds}\`\`\``)
			.addFields({ name: message.translate('Misc/uptime:EUP_DESC1'), value: date, inline: false })
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
			.setTimestamp()
			.setColor(16775424);

		message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}
};
