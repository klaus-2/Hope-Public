// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, WebhookClient } = require('discord.js'),
  Premium = require(`../../database/models/GuildPremium`),
  moment = require("moment"),
  webhookClient = new WebhookClient({ id: 'hookID', token: 'hookTOKEN' }),
  logpremium = new WebhookClient({ id: 'hookID', token: 'hookTOKEN' }),
  uniqid = require('uniqid'),
  Command = require('../../structures/Command');
moment.locale('pt-br');

module.exports = class RedeemCode extends Command {
  constructor(bot) {
    super(bot, {
      name: 'redeemcode',
      dirname: __dirname,
      aliases: ['resgatarcodigo'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Redeem a premium code.',
      cooldown: 3000,
      usage: '<prefix><commandName> <code>',
      examples: [
        '.redeemcode XXXX-XXXX-XXXX'
      ],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {

    let code = message.args[0];
    const embed = new Embed(bot, message.guild)
      .setDescription(message.translate('Moderation/redeemcode:RESGATAR_PREMIUM'))
    if (!code) return message.channel.send({ embeds: [embed] });

    if (settings.isPremium === true) {
      const embed = new Embed(bot, message.guild)
        .setDescription(message.translate('Moderation/redeemcode:RESGATAR_PREMIUM1'))
      return message.channel.send({ embeds: [embed] });
    }

    const premium = await Premium.findOne({ code: code });

    if (premium) {
      const expires = moment(Number(premium.expiresAt)).format("dddd, Do MMMM YYYY HH:mm:ss");

      settings.isPremium = "true";
      settings.premium.redeemedBy.id = message.author.id;
      settings.premium.redeemedBy.tag = message.author.tag;
      settings.premium.redeemedAt = Date.now()
      settings.premium.expiresAt = premium.expiresAt;
      settings.premium.plan = premium.plan;
      settings.premium.code = premium.code;

      await message.guild.fetchSettings();

      await premium.deleteOne().catch(() => { });

      let ID = uniqid(undefined, `-${code}`);
      const date = require('date-and-time');
      const now = new Date();
      let DDate = date.format(now, 'DD/MM/YYYY HH:mm:ss');

      try {
        const embed = new Embed(bot, message.guild)
          .setDescription(`**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM2')}**\n\n${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM3')} **${message.guild.name}** ${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM4')}\n\n **${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM5')}** ${ID}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM6')}** ${DDate}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM7')}** ${message.guild.name}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM8')}** ${message.guild.id}`)
          .setColor('#f47fff')
          .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Moderation/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
        await message.author.send({ embeds: [embed] })
      } catch (err) {
        console.log(err)
        const embed = new Embed(bot, message.guild)
          .setDescription(`**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM9')}**\n\n**${message.guild.name}** ${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM10', { config: bot.config.SupportServer.link })})\n\n${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM11')} ${ID}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM12')}** ${DDate}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM13')}** ${message.guild.name}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM14')}** ${message.guild.id}\n\n${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM15')} ${expires}`)
          .setColor('#f47fff')
          .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Moderation/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
        return message.author.send({ embeds: [embed] });
      }

      const embed = new Embed(bot, message.guild)
        .setDescription(`**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM9')}**\n\n**${message.guild.name}** ${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM10', { config: bot.config.SupportServer.link })})\n${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM16')} ${expires}`)
        .setColor('#f47fff')
        .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Moderation/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
      message.channel.send({ embeds: [embed] });

      const embedPremium = new Embed(bot, message.guild)
        .setDescription(`**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM2')}**\n\n**${message.author.tag}** ${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM17')} **${message.guild.name}**\n\n **${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM18')}** ${ID}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM19')}** ${DDate}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM20')}** ${message.guild.name}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM21')}** ${message.guild.id}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM22')}** ${message.author.tag}\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM23')}** ${message.author.id}\n\n**${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM24')}** ${expires}`)
        .setColor('#f47fff')

      logpremium.send({
        username: 'Hope [PREMIUM]',
        //avatarURL: `${message.client.domain}/logo.png`,
        embeds: [embedPremium],
      });

      const embedPremium1 = new Embed(bot, message.guild)
        .setDescription(`${message.author.username} ${message.translate('Moderation/redeemcode:RESGATAR_PREMIUM26')}`)
        .setColor('#f47fff')

      webhookClient.send({
        username: 'Hope [PREMIUM]',
        //avatarURL: `${message.client.domain}/logo.png`,
        embeds: [embedPremium1],
      });

      //bot.channels.cache.get('837015290273071174').send(`${message.author.username} <:Skyeapaixonada:823046654479433728> está ajudando o servidor e se tornou **PREMIUM**.`)    

    } else {
      const embed = new Embed(bot, message.guild).setColor('#f47fff').setDescription(message.translate('Moderation/redeemcode:RESGATAR_PREMIUM25'))
      return message.channel.send({ embeds: [embed] })
    }
  }
};