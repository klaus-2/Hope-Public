// Dependências
const { MessageEmbed, TextChannel } = require('discord.js'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');

module.exports = class SairServer extends Command {
  constructor(bot) {
    super(bot, {
      name: 'sair-server',
      ownerOnly: true,
      dirname: __dirname,
      aliases: ['fleave', 'forceleave', 'leaveguild', 'removeguild', 'leaveserver', 's-server', 'sairdoservidor'],
      description: 'Force Mai to leave a server',
      usage: 'sair-server <ID do servidor>',
      cooldown: 3000,
      examples: [
        'sair-server 815701887965069344'
      ],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    const guildId = message.args[0];

    if (!guildId) {
      return message.channel.send(`<:Skyedeterminada:823046656500039680> ${message.author}... cade o ID?`).then(m => m.timedDelete({ timeout: 10000 }));
    }

    const guild = bot.guilds.cache.find((g) => g.id === guildId);

    if (!guild) {
      return message.channel.send(`Desculpa, ${message.author}. Não encontrei o ID <:SkyeChoro2:823057602853863425>`).then(m => m.timedDelete({ timeout: 10000 }));
    }

    try {
      await guild.leave();
      message.channel.send(`Yeeay, eu sai do servidor **${guild.name}** com sucesso.`).then(m => m.timedDelete({ timeout: 10000 }));
    } catch (err) {
      bot.logger.error(`Comando: '${this.help.name}' ocorreu um error: ${err.message}.`);
      message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.timedDelete({ timeout: 5000 }));
    }
  }
};