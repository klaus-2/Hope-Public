// Dependências
const fetch = require('node-fetch'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Gifs extends Command {
	constructor(bot) {
		super(bot, {
			name: 'gifs',
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Generate a gif of your choice.',
			usage: '<prefix><commandName> <query>',
			examples: [
				'.gifs goku',
				'!gifs moon',
				'?gifs sun'
			],
			examples: ['gifs goku'],
			cooldown: 5000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		if (!message.args[0]) {
			return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Image/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Image/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}
		fetch(`https://api.tenor.com/v1/random?key=${bot.config.api_keys.tenor}&q=${message.args.join(' ')}&limit=1`)
			.then(res => res.json())
			.then(json => message.channel.send(json.results[0].url));
	};
};