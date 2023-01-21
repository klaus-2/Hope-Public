// Dependências
const { exec } = require('child_process'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Exec extends Command {
	constructor(bot) {
		super(bot, {
			name: 'exec',
			aliases: ['terminal'],
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ Flags.SendMessages, Flags.EmbedLinks],
			description: 'Isso é para os desenvolvedores.',
			usage: '<thing-to-exec>',
			cooldown: 3000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
        if (message.content.includes('config.js')) return message.channel.send('<:false:823007583496306708> Devido a razões de privacidade, não podemos mostrar o arquivo config.js.');

        if (message.args.length < 1) return message.channel.send('<:false:823007583496306708> Você tem que me dar algum texto para executar!')
        
        exec(message.args.join(' '), (error, stdout) => {
          const response = stdout || error;
          message.channel.send({ content: `\`\`\`bash\n${response}\`\`\`` });
        });
      }
    };