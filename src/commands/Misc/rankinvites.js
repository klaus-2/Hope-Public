// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js'),
  arraySort = require('array-sort');

module.exports = class Rankinvites extends Command {
  constructor(bot) {
    super(bot, {
      name: 'rankinvites',
      dirname: __dirname,
      aliases: ['rc', 'rankconvites'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ViewAuditLog],
      description: 'Shows the invitation rank of the server.',
      usage: '<prefix><commandName>',
      examples: [
        '.rankinvites'
      ],
      cooldown: 3000,
      slash: true,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    let invites = await message.guild.invites.fetch().catch(error => {
      return message.channel.send(message.translate('Misc/rankinvites:ERANKC_DESC')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    })

    invites = [...invites.values()];

    arraySort(invites, 'uses', { reverse: true });

    let possibleinvites = [];
    let index = 0;
    invites.forEach(function (invites) {
      possibleinvites.push(`**${++index}**.  **${invites.inviter.tag}** 》 \`${invites.uses}\` **${message.translate('Misc/rankinvites:ERANKC_DESC1')}**`)
    })

    const embed = new Embed(bot, message.guild)
      .setTitle('Misc/rankinvites:ERANKC_DESC2')
      .setColor(16775424)
      .setDescription(`${possibleinvites.join('\n')}`)
      .setTimestamp()
      .setThumbnail(message.guild.iconURL({ extension: 'png', forceStatic: false, size: 1024 }))
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

    message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const channel = guild.channels.cache.get(interaction.channelId);

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      let invites = await guild.invites.fetch().catch(error => {
        return interaction.editReply({ content: guild.translate('Misc/rankinvites:ERANKC_DESC') }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      })

      invites = [...invites.values()];

      arraySort(invites, 'uses', { reverse: true });

      let possibleinvites = [];
      let index = 0;
      invites.forEach(function (invites) {
        possibleinvites.push(`**${++index}**.  **${invites.inviter.tag}** 》 \`${invites.uses}\` **${guild.translate('Misc/rankinvites:ERANKC_DESC1')}**`)
      })

      const embed = new Embed(bot, guild)
        .setTitle('Misc/rankinvites:ERANKC_DESC2')
        .setColor(16775424)
        .setDescription(`${possibleinvites.join('\n')}`)
        .setTimestamp()
        .setThumbnail(guild.iconURL({ extension: 'png', forceStatic: false, size: 1024 }))
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

      interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
}