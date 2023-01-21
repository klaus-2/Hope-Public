// Dependências
const { find } = require('weather-js'),
	{ Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Weather extends Command {
	constructor(bot) {
		super(bot, {
			name: 'weather',
			dirname: __dirname,
			aliases: ['fort', 'fortnight', 'tempo'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Search for weather information of a city.',
			usage: '<prefix><commandName> <loc>',
			examples: [
				'.weather ny',
				'!weather new york',
				'?fort new york',
			],
			cooldown: 3000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Pesquisas/tempo:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Pesquisas/tempo:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		// pesquisa estatísticas meteorológicas
		find({ search: message.args.join(' '), degreeType: 'C' }, function (err, result) {
			// certifique-se de que a localização seja válida
			if (!result[0]) return message.channel.error(message.translate('Pesquisas/tempo:TEMPO5'));

			// envia resultados		
			const embed = new Embed(bot, message.guild)
				.setColor(12317183)
				.setTitle('Pesquisas/tempo:TEMPO_TITULO', { place: result[0].location.name })
				.setDescription(message.translate('Pesquisas/tempo:TEMPO_DESCRIÇÃO'))
				.addFields({ name: `${message.translate('Pesquisas/tempo:TEMPO6')}`, value: `${result[0].current.temperature}°C`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO7')}`, value: `${result[0].current.skytext}`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO8')}`, value: `${result[0].current.humidity}%`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO9')}`, value: `${result[0].current.windspeed}`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO10')}`, value: `${result[0].current.observationtime}`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO11')}`, value: `${result[0].current.winddisplay}`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO')}`, value: `${result[0].current.feelslike} ${message.translate('Pesquisas/tempo:TEMPO1')}`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO2')}`, value: `UTC${result[0].location.timezone}`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO3')}`, value: `${result[0].location.degreetype}`, inline: true },
					{ name: `${message.translate('Pesquisas/tempo:TEMPO4')}`, value: `${result[0].location.lat} ${result[0].location.long}`, inline: false })
				.setThumbnail(result[0].current.imageUrl)
				.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/weather:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` });
			message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		});
	}
};
