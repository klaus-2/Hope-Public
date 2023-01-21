// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');

module.exports = class Prefix extends Command {
  constructor(bot) {
    super(bot, {
      name: 'prefix',
      aliases: ['prefixo'],
      dirname: __dirname,
      userPermissions: [Flags.ManageGuild],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Change the Hope prefix on this server.',
      usage: '<prefix><commandName> <new prefix>',
      examples: [
        '.prefix !',
        '!prefix ?',
        '?prefix h!',
        'h!prefix .'
      ],
      cooldown: 10000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) { //new Embed(bot, message.guild) 
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const oldPrefix = settings.prefix,
      prefix = message.args[0];

    if (!prefix) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Guild/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Guild/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    else if (prefix.length > 3) return message.channel.send(message.translate('Guild/prefix:PREFIXO')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
    
    await message.guild.updateGuild({ prefix: message.args[0] });

    const embed = new Embed(bot, message.guild)
      .setTitle('Guild/prefix:PREFIXO1')
      .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true }))
      .setDescription(message.translate('Guild/prefix:PREFIXO2'))
      .addFields({name: message.translate('Guild/prefix:PREFIXO3'), value: `${message.translate('Guild/prefix:PREFIXO4')} \`${oldPrefix}\` ➔ \`${prefix}\``, inline: false })
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
      .setTimestamp()
      .setColor(1);

    message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
}; 