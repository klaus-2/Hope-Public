// Dependências
const Command = require('../../structures/Command.js'),
{ PermissionsBitField: { Flags } } = require('discord.js');

	module.exports = class SimJoin extends Command {
		constructor(bot) {
			super(bot, {
				name: 'simjoin',
				aliases: ['simentrar'],
				guildOnly: true,
				dirname: __dirname,
				botPermissions: [ Flags.SendMessages, Flags.EmbedLinks,Flags.AttachFiles],
				description: 'Mostra sua classificação/nível.',
				usage: 'exp [user]',
				cooldown: 3000,
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
        bot.emit('guildMemberAdd', message.member);
    }
  }