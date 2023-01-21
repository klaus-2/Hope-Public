// Dependências
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
  { Embed } = require(`../../utils`),
  { ChannelType } = require('discord-api-types/v10'),
  Command = require('../../structures/Command.js');

module.exports = class Lock extends Command {
  constructor(bot) {
    super(bot, {
      name: 'lock',
      aliases: ['trancar'],
      dirname: __dirname,
      userPermissions: [Flags.ManageChannels],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
      description: 'Lock a channel.',
      usage: '<prefix><commandName>',
      examples: [
        '.lock'
      ],
      cooldown: 3000,
      slash: false,
      options: [
        {
          name: 'channel',
          description: 'The channel to lock.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.PrivateThread, ChannelType.GuildNews],
          required: true,
        },
      ],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SEND_MESSAGES: false
    })
    const embed = new Embed(bot, message.guild)
      .setTitle('Moderation/lock:TRANCAR1')
      .setDescription(message.translate('Moderation/lock:TRANCAR', { channel: message.channel }))
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Moderation/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
      .setColor(16741245);
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }

  /**
   * Function for receiving interaction.
   * @param {bot} bot The instantiating client
   * @param {interaction} interaction The interaction that ran the command
   * @param {guild} guild The guild the interaction ran in
   * @param {args} args The options provided in the command, if any
   * @readonly
  */
  async callback(bot, interaction, guild, args) {
    const channel = guild.channels.cache.get(args.get('channel').value);

    // Get channel and update permissions
    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
      });
      for (const role of (guild.settings.welcomeRoleGive ?? [])) {
        await channel.permissionOverwrites.edit(role, {
          SendMessages: false,
        });
      }
      const embed = new Embed(bot, guild)
        .setTitle('Moderation/lock:TRANCAR1')
        .setDescription(guild.translate('Moderation/lock:TRANCAR', { channel: guild.channel }))
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Moderation/${this.help.name}:USAGEE`)}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', dynamic: true })}` })
        .setColor(16741245);
      if (guild.settings.ModerationClearToggle && interaction.message.deletable) interaction.message.delete();
      interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } catch (err) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
      interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)] });
    }
  }
}