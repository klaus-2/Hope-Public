// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');
const PlayStore = require("google-play-scraper"); //tem q atualizar manualmente o modulo para traduzir pt

module.exports = class Playstore extends Command {
  constructor(bot) {
    super(bot, {
      name: 'playstore',
      dirname: __dirname,
      aliases: ["pstore", "googleplaystore", "ps"],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Shows information of a game/app in Playstore.',
      nsfw: true,
      usage: '<prefix><commandName> <game | app>',
      examples: [
        '.playstore free fire',
        '!pstore clash of clans',
        '?ps clash royale'
      ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

    PlayStore.search({ term: message.args.join(" "), num: 1 }).then(Data => {
      let App;

      App = JSON.parse(JSON.stringify(Data[0]));

      const embed = new Embed(bot, message.guild)
        .setColor(12317183)
        .setThumbnail(App.icon)
        .setURL(App.url)
        .setTitle(`${App.title}`)
        .setDescription(App.summary)
        .addFields({ name: `${message.translate('Pesquisas/playstore:PLAYSTORE')}`, value: `${App.priceText}`, inline: true },
          { name: `${message.translate('Pesquisas/playstore:PLAYSTORE1')}`, value: `${App.developer}`, inline: true },
          { name: `${message.translate('Pesquisas/playstore:PLAYSTORE2')}`, value: `${App.scoreText}`, inline: true })
        .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    });
  }
};