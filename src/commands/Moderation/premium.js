// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');
const { GuildSchema } = require(`../../database/models`);
const premium = require(`../../database/models/GuildPremium`);
const moment = require("moment")

module.exports = class Premium extends Command {
  constructor(bot) {
    super(bot, {
      name: 'premium',
      dirname: __dirname,
      aliases: ['premium-status', 'status-premium'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Displays the user/guild status.',
      usage: '<prefix><commandName>',
      examples: [
        '.premium'
      ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    if (!settings.premium) return message.channel.error(`This server currently does not have a premium subscription! Visit https://hopebot.top/premium and get one now to unlock amazing features and benefits on this server.`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    if (settings.isPremium === "true") {
      const expires = moment(Number(premium.expiresAt)).format("dddd, Do MMMM YYYY HH:mm:ss")

      settings.isPremium = "true";
      settings.premium.redeemedBy.id = message.author.id;
      settings.premium.redeemedBy.tag = message.author.tag;
      settings.premium.redeemedAt = Date.now()
      settings.premium.expiresAt = premium.expiresAt;
      settings.premium.plan = premium.plan;

      const code = settings.premium.code;
      console.log(code)
      const date = require('date-and-time');
      const now = new Date();
      let DDate = moment(Number(settings.premium.expiresAt)).format("dddd, Do MMMM YYYY HH:mm:ss");
      let DDatee = moment(Number(settings.premium.redeemedAt)).format("dddd, Do MMMM YYYY HH:mm:ss");
      const us = bot.users.cache.get(settings.premium.redeemedBy.id)

      let premStatus = new Embed(bot, message.guild)
        .setAuthor({ name: message.translate('Misc/premium:PREMIUM_AUTHOR', { author: message.author.username }), iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
        .setDescription(`${message.translate('Misc/premium:PREMIUM_DESC', { guild: message.guild.name })}\n\n${message.translate('Misc/premium:PREMIUM_DESC1', { plan: settings.premium.plan })}\n${message.translate('Misc/premium:PREMIUM_DESC2', { code: settings.premium.code })}\n${message.translate('Misc/premium:PREMIUM_DESC3', { date: DDatee })}\n${message.translate('Misc/premium:PREMIUM_DESC4', { user: us })}\n${message.translate('Misc/premium:PREMIUM_DESC5', { guild: message.guild.id })}\n${message.translate('Misc/premium:PREMIUM_DESC6', { expires: DDate })}`)
        .setColor('#f47fff')
        .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true }))
        .setFooter({ text: message.translate('Misc/premium:PREMIUM_FOOTER') });
      message.channel.send({ embeds: [premStatus] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }

    if (settings.isPremium === "false") {
      const expires = moment(Number(premium.expiresAt)).format("dddd, Do MMMM YYYY HH:mm:ss")

      const codee = await premium.findOne({
        code: premium.code
      })

      settings.isPremium = "true";
      settings.premium.redeemedBy.id = message.author.id;
      settings.premium.redeemedBy.tag = message.author.tag;
      settings.premium.redeemedAt = Date.now()
      settings.premium.expiresAt = premium.expiresAt;
      settings.premium.plan = premium.plan;
      settings.premium.code = premium.code;
      const date = require('date-and-time');
      const now = new Date();
      let DDate = date.format(now, 'DD/MM/YYYY HH:mm:ss');
      const us = bot.users.cache.get(settings.premium.redeemedBy.id)

      let premStatus = new Embed(bot, message.guild)
        .setAuthor({ name: message.translate('Misc/premium:PREMIUM_TITULO', { author: message.author.username }), iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
        .setDescription(message.translate('Misc/premium:PREMIUM_DESC7', { SupportServer: bot.config.SupportServer.link, prefix: settings.prefix }))
        .setColor('#f47fff')
        .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true }))
        .setFooter({ text: message.translate('Misc/premium:PREMIUM_FOOTER1') })
      message.channel.send({ embeds: [premStatus] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
  }
}