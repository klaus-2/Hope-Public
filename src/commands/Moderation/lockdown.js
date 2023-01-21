// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  ms = require("ms"),
  Command = require('../../structures/Command.js');

module.exports = class Lockdown extends Command {
  constructor(bot) {
    super(bot, {
      name: 'lockdown',
      dirname: __dirname,
      aliases: ['tcanal', 'confinamento'],
      userPermissions: [Flags.ManageGuild, Flags.ManageChannels],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Locks a channel for a specified time.',
      usage: '<prefix><commandName> <time>',
      examples: [
        '.lockdown 1m'
      ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    const time = message.args.join(" ");
    if (!time) {
      return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderação/lockdown:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderação/lockdown:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    }

    message.channel.permissionOverwrites.edit(message.guild.id, {
      SendMessages: false
    })
    const embed = new Embed(bot, message.guild)
      .setTitle('Moderation/lockdown:CONFINAMENTO')
      .setDescription(`<:SkyePolicial:823046653622747156> ${message.translate('Moderation/lockdown:CONFINAMENTO1')} ${message.channel} ${message.translate('Moderation/lockdown:CONFINAMENTO2')} ${time}.`)
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Moderação/lockdown:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
      .setColor(16711709);
    message.channel.send({ embeds: [embed] })

    let time1 = (`${time}`)
    setTimeout(function () {
      message.channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: null
      })
      const embed2 = new Embed(bot, message.guild)
        .setTitle('Moderation/lockdown:CONFINAMENTO')
        .setDescription(`${message.translate('Moderation/lockdown:CONFINAMENTO3')} ${message.channel} ${message.translate('Moderation/lockdown:CONFINAMENTO4')} <:SkyePolicial1:823272728043716618>`)
        .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Moderação/lockdown:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
        .setColor(16711709);
      message.channel.send({ embeds: [embed2] });
    }, ms(time1));
    message.delete();
  }
}