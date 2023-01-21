// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class S_Prefixo extends Command {
  constructor(bot) {
    super(bot, {
      name: 's-prefix',
      aliases: ['s-prefixo'],
      dirname: __dirname,
      ownerOnly: true,
      botPermissions: [ Flags.SendMessages, Flags.EmbedLinks],
      description: 'configurar o prefixo da Hope para este servidor.',
      usage: 'prefixo <novo prefixo>',
      cooldown: 3000,
      examples: ['prefixo !']
    });
  }

// EXEC - PREFIX
async run(bot, message, settings) {
    const oldPrefix = settings.prefix;
    const prefix = message.args[0];
    if (!prefix) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Servidor/prefixo:USAGE`, {EXAMPLE: settings.prefix.concat(message.translate(`Servidor/prefixo:EXAMPLE`) )})) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});
    else if (prefix.length > 3) 
      return message.channel.send(message.translate('Guild/prefixo:PREFIXO'));
      await message.guild.updateGuild({ prefix: message.args[0] })
    const embed = new Embed(bot, message.guild)
      .setTitle('Guild/prefixo:PREFIXO1')
      .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true }))
      .setDescription(message.translate('Guild/prefixo:PREFIXO2'))
      .addField(message.translate('Guild/prefixo:PREFIXO3'), `${message.translate('Guild/prefixo:PREFIXO4')} \`${oldPrefix}\` ➔ \`${prefix}\``)
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Servidor/prefixo:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
      .setTimestamp()
      .setColor(1);
      if (settings.ModerationClearToggle && message.deletable) message.delete();
    message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 })}});
  }
}; 