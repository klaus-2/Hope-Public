// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class HopeAnuncio extends Command {
	constructor(bot) {
		super(bot, {
			name: 'Hope-anuncio',
			dirname: __dirname,
			aliases: ['smsg'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Faça a Hope dizer algo.',
			usage: 'falar <mensagem>',
			cooldown: 3000,
			examples: ['falar Hope é a melhor bot do mundo <3']
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure a poll was provided
		if (!message.args[0]) {
			return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});
		}
		message.channel.send(message.args.join(' '));
	}
};