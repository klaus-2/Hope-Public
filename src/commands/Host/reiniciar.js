// Dependências
const { promisify } = require('util'),
	{ PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
	readdir = promisify(require('fs').readdir),
	path = require('path'),
	Command = require('../../structures/Command.js');

module.exports = class Reiniciar extends Command {
	constructor(bot) {
		super(bot, {
			name: 'reiniciar',
			aliases: ['rr'],
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Reinicia um comando.',
			usage: 'reiniciar <comando / evento>',
			cooldown: 3000,
			examples: ['rr ajuda ou rr channelCreate'],
			slash: false,
			options: [{
				name: 'name',
				description: 'command or event to reload',
				type: ApplicationCommandOptionType.String,
				// choices: [...[...bot.commands.keys()].map(i => ({ name: i, value: i })), ...Object.keys(bot._events).map(i => ({ name: i, value: i }))],
				required: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (message.deletable) message.delete();

		// Verifica se foi especificado um comando
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('Host/reiniciar:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// verifica se o comando existe
		const commandName = message.args[0].toLowerCase();
		if (bot.commands.has(commandName) || bot.commands.get(bot.aliases.get(commandName))) {
			// Encontra o comando
			const cmd = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

			// reinicia o comando
			try {
				await bot.unloadCommand(cmd.conf.location, cmd.help.name);
				await bot.loadCommand(cmd.conf.location, cmd.help.name);
				return message.channel.success('Host/reiniciar:SUCCESS', { NAME: commandName }).then(m => m.timedDelete({ timeout: 10000 }));
			} catch (err) {
				bot.logger.error(`Comando: '${this.help.name}' ocorreu um error: ${err.message}.`);
				if (message.deletable) message.delete();
				return message.channel.error('misc:ERROR_MESSAGE', { err: err.message });
			}
		} else if (Object.keys(bot._events).includes(message.args[0])) {
			try {
				// localiza o arquivo
				let fileDirectory;
				const evtFolder = await readdir('./src/events/');
				evtFolder.forEach(async folder => {
					const folders = await readdir('./src/events/' + folder + '/');
					folders.forEach(async file => {
						const { name } = path.parse(file);
						if (name == message.args[0]) {
							fileDirectory = `../../events/${folder}/${file}`;
							delete require.cache[require.resolve(fileDirectory)];
							bot.removeAllListeners(message.args[0]);
							const event = new (require(fileDirectory))(bot, message.args[0]);
							bot.logger.log(`Loading Event: ${message.args[0]}`);
							// eslint-disable-next-line no-shadow
							bot.on(message.args[0], (...args) => event.run(bot, ...args));
							return message.channel.success('Host/reiniciar:SUCCESS_EVENT', { NAME: message.args[0] }).then(m => m.timedDelete({ timeout: 8000 }));
						}
					});
				});
			} catch (err) {
				bot.logger.error(`Comando: '${this.help.name}' ocorreu um error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			return message.channel.error('Host/reiniciar:INCORRECT_DETAILS', { NAME: commandName }).then(m => m.timedDelete({ timeout: 10000 }));
		}
	}
	// EXEC - SLASH
	async callback(bot, interaction) {
		interaction.reply({ content: 'This is currently unavailable.' });
	}
};
