// Dependências
const { Embed } = require('../../utils'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Help extends Command {
	constructor(bot) {
		super(bot, {
			name: 'devhelp',
			dirname: __dirname,
            ownerOnly: true,
			botPermissions: [ Flags.SendMessages, Flags.EmbedLinks],
			description: 'Sends information about all the commands that I can do.',
			usage: 'help [command]',
			cooldown: 3000,
			examples: ['help play'],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (!message.args[0]) {
			// Show default help page
			const embed = new Embed(bot, message.guild)
				.setAuthor({ name: message.translate('misc/help:AUTHOR'), iconURL: bot.user.displayAvatarURL({ format: 'png' }) })
                .setColor('#36393f')
				.setDescription([
					message.translate('misc/dev:PREFIX_DESC', { PREFIX: settings.prefix, ID: bot.user.id }),
					message.translate('misc/dev:INFO_DESC', { PREFIX: settings.prefix, USAGE: message.translate('misc/help:USAGE') }),
				].join('\n'));
				//const categories = bot.commands.map(c => c.help.category).filter((v, i, a) => settings.plugins.includes(v) && a.indexOf(v) === i);
				//if (bot.config.ownerID.includes(message.author.id)) categories.push('Host');
				//categories
				//.sort((a, b) => a.category - b.category)
					const commands = bot.commands
						.filter(c => c.help.category === 'Dono') //NOME DOS COMANDOS
						//.sort((a, b) => a.help.name - b.help.name)
						.map(c => `\`${settings.prefix}\`**${c.help.name}**`).join('\n'); //FORMATO DA ESCRITA DOS COMANDOS

					const length = bot.commands
						.filter(c => c.help.category === 'Dono').size; //QUANTIDADE DE COMANDOS
					embed.addField(`Comandos do Desenvolvedor [**${length}**]`, commands, true);
			message.channel.send({ embeds: [embed] });
		} else if (message.args.length == 1) {
			// Check if arg is command
			if (bot.commands.get(message.args[0]) || bot.commands.get(bot.aliases.get(message.args[0]))) {
				// arg was a command
				const cmd = bot.commands.get(message.args[0]) || bot.commands.get(bot.aliases.get(message.args[0]));
				// Check if the command is allowed on the server
				if (settings.plugins.includes(cmd.help.category) || bot.config.ownerID.includes(message.author.id)) {
					const embed = new Embed(bot, message.guild)
						.setTitle('misc/help:TITLE', { COMMAND: `${settings.prefix}${cmd.help.name}` })
						.setDescription([
							message.translate('misc/help:DESC', { DESC: cmd.help.description }),
							message.translate('misc/help:ALIAS', { ALIAS: (cmd.help.aliases.length >= 1) ? cmd.help.aliases.join(', ') : 'None' }),
							message.translate('misc/help:COOLDOWN', { CD: cmd.conf.cooldown / 1000 }),
							message.translate('misc/help:USE', { USAGE: settings.prefix.concat(message.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:USAGE`)) }),
							message.translate('misc/help:EXAMPLE', { EX: `${settings.prefix}${cmd.help.examples.join(`,\n ${settings.prefix}`)}` }),
							message.translate('misc/help:LAYOUT'),
						].join('\n'));
					message.channel.send({ embeds: [embed] });
				} else {
					message.channel.error('misc/help:NO_COMMAND');
				}
			} else {
				message.channel.error('misc/help:NO_COMMAND');
			}
		} else {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-start:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
};