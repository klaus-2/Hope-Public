// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  Command = require('../../structures/Command.js');

module.exports = class Invite extends Command {
  constructor(bot) {
    super(bot, {
      name: 'invite',
      aliases: ['convite'],
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.CreateInstantInvite],
      description: 'Creates an fast invitation link for this server. Add the TEMP to generate a temporary invite.',
      usage: '<prefix><commandName> [temp]',
      examples: [
        '/invite',
        '/invite temp',
        '.invite',
        '!invite temp'
      ],
      cooldown: 3000,
      slash: true,
      options: [
        {
          name: 'parameter',
          description: 'type',
          type: ApplicationCommandOptionType.String,
          choices: [...["temp"].map(opt => ({ name: opt, value: opt }))].slice(0, 24),
          required: false,
        }]
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const channels = message.mentions.channels.first() || message.guild.channels.cache.get(`${message.args[0]}`) || message.guild.channels.cache.find(x => x.name === `${message.args.join(" ")}`) || message.channel;

    let check;
    if (message.args[0] === "temp") {
      check = "true";
    } else {
      check = "false";
    }

    let check2;
    if (message.args[0] === "temp") {
      check2 = "1800";
    } else {
      check2 = "0";
    }

    channels.createInvite({
      temporary: `${check}`,
      maxAge: `${check2}`,
      maxUses: 0,
      reason: `${message.translate('Guild/invite:CONVITE')} ${message.author.username}`
    }).then(InviteCode =>
      message.channel.send({
        embeds: [
          new Embed(bot, message.guild)
            .setColor(1)
            .setAuthor({ name: message.translate('Guild/invite:CONVITE1'), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
            .setDescription(`Link:\n https://discord.gg/${InviteCode.code}`)
            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Guild/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            .setTimestamp()
        ]
      })).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user,
      channel = guild.channels.cache.get(interaction.channelId),
      parameter = args.get('parameter')?.value;

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      let check;
      if (parameter === "temp") {
        check = "true";
      } else {
        check = "false";
      }

      let check2;
      if (parameter === "temp") {
        check2 = "1800";
      } else {
        check2 = "0";
      }

      channel.createInvite({
        temporary: `${check}`,
        maxAge: `${check2}`,
        maxUses: 0,
        reason: `${guild.translate('Guild/invite:CONVITE')} ${member.username}`
      }).then(InviteCode =>
        interaction.editReply({
          embeds: [
            new Embed(bot, guild)
              .setColor(1)
              .setAuthor({ name: guild.translate('Guild/invite:CONVITE1'), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
              .setDescription(`Link:\n https://discord.gg/${InviteCode.code}`)
              .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
              .setTimestamp()
          ]
        })).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};