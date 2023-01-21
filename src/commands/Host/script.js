// Dependencies
const { EmbedBuilder } = require('discord.js'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ promisify, inspect } = require('util'),
	readdir = promisify(require('fs').readdir),
	Command = require('../../structures/Command.js');

module.exports = class Script extends Command {
	constructor(bot) {
		super(bot, {
			name: 'script',
			ownerOnly: true,
			dirname: __dirname,
			aliases: ['scripts'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Runs a script file.',
			usage: 'script <file name> [...params]',
			cooldown: 3000,
			examples: ['script updateGuildSlashCommands bot'],
		});
	}

	// Run command
	async run(bot, message) {
		const scripts = (await readdir('./src/scripts')).filter((v, i, a) => a.indexOf(v) === i);

		// No script was entered
		if (!message.args[0]) {
			const embed = new EmbedBuilder()
				.setTitle('Available scripts:')
				.setDescription(scripts.map((c, i) => `${i + 1}.) ${c.replace('.js', '')}`).join('\n'));
			return message.channel.send({ embeds: [embed] });
		}

		// script found
		if (scripts.includes(`${message.args[0]}.js`)) {
			const resp = await require(`../../scripts/${message.args[0]}.js`).run(eval(message.args[1], { depth: 0 }), eval(message.args[2], { depth: 0 }), eval(message.args[3], { depth: 0 }));
			message.channel.send('```js\n' + `${inspect(resp).substring(0, 1990)}` + '```');
		} else {
			message.channel.error('Invalid script name.');
		}
	}
};