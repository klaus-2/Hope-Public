// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

// Languages supported
const languages = {
	'english': 'en-US',
	'arabic': 'ar-EG',
	'portugues': 'pt-BR',
};

module.exports = class S_Idioma extends Command {
	constructor(bot) {
		super(bot, {
			name: 's-lang',
			dirname: __dirname,
            aliases: ['s-idioma'],
        	ownerOnly: true,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Escolha o idioma do bot.',
			usage: 'idioma <língua>',
			cooldown: 5000,
			examples: ['idioma portugues'],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// get language
		const language = bot.languages.find((l) => l.name === message.args[0] || l.aliases.includes(message.args[0]));
		if (!message.args[0] || !language) {
			const embed = new Embed(bot, message.guild)
			.setColor('#fd003a')
			.setDescription(message.translate('misc:MISSING_LANGUAGE', { config: bot.config.SupportServer.link }))
			return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 20000 }));
		}

		// update database
		try {
			await message.guild.updateGuild({ Language: language.name });
			settings.Language = language.name;
			return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName });
		} catch (err) {
			bot.logger.error(`Comando: '${this.help.name}' ocorreu um error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
};
