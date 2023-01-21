// Dependências
const { Embed } = require('../../utils'),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  wiki = require("wikijs").default,
  Command = require('../../structures/Command.js');

module.exports = class Wikipedia extends Command {
  constructor(bot) {
    super(bot, {
      name: 'wikipedia',
      aliases: ['wiki'],
      dirname: __dirname,
      nsfw: true,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: "Search Wikipedia for the specified term.",
      usage: '<prefix><commandName> <query>',
        examples: [
            '.wikipedia moon',
            '!wiki rain',
            '?wiki sun'
        ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    const query = message.content.split(/\s+/g).slice(1).join(" ");

    if (!query) {
      return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    }

    const data = await wiki({ apiUrl: `https://${message.translate('Pesquisas/wikipedia:WIKIPEDIA3')}.wikipedia.org/w/api.php` }).search(query, 1);
    if (!data.results || !data.results.length) {
      return message.channel.error('Pesquisas/wikipedia:WIKIPEDIA').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    }

    const page = await wiki({ apiUrl: `https://${message.translate('Pesquisas/wikipedia:WIKIPEDIA3')}.wikipedia.org/w/api.php` }).page(data.results[0]);
    const summary = await page.summary();
    const paragraphs = summary.split("\n");

    if (!query.options) {
      paragraphs.length = Math.min(1, paragraphs.length);
    }
    try {
      const embed = new Embed(bot, message.guild)
        .setAuthor({ name: page.raw.title })
        .setDescription(paragraphs.join("\n\n"))
        .addFields({ name: message.translate('Pesquisas/wikipedia:WIKIPEDIA1'), value: `**${page.raw.fullurl}**`, inline: false })
        .setFooter({
          text: "Wikipedia",
          iconURL: "https://media.discordapp.net/attachments/739051913651159071/739186784923025549/1200px-Wikipedia-logo-v2.svg.png?width=495&height=452"
        })
        .setColor(message.guild.members.me.displayHexColor)
      return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
    } catch (err) {
      const embed = new Embed(bot, message.guild)
        .setAuthor({ name: page.raw.title })
        .setDescription(
          message.translate('Pesquisas/wikipedia:WIKIPEDIA2')
        )
        .addFields({ name: message.translate('Pesquisas/wikipedia:WIKIPEDIA1'), value: `**${page.raw.fullurl}**`, inline: false })
        .setFooter({
          text: "Wikipedia",
          iconURL: "https://media.discordapp.net/attachments/739051913651159071/739186784923025549/1200px-Wikipedia-logo-v2.svg.png?width=495&height=452"
        })
        .setColor(message.guild.members.me.displayHexColor)
      return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
    }
  }
};