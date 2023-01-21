const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, GuildEmoji } = require('discord.js'),
  { Embed, HopePaginator } = require(`../../utils`),
  { HAnimeAPI } = require('hanime'),
  { decode } = require('he'),
  moment = require('moment'),
  hanime = new HAnimeAPI(),
  Pages = require('../../structures/Paginate'),
  text = require('../../utils/string'),
  Command = require('../../structures/Command.js');

module.exports = class Hanisearch extends Command {
  constructor(bot) {
    super(bot, {
      name: 'hanisearch',
      nsfw: true,
      dirname: __dirname,
      aliases: ['hanime', 'searchhentai', 'buscar-hentai', 'b-hentai', 'buscarhentai', 'pesquisar-hentai', 'ph'],
      description: 'Consult hanime.tv for a specific hentai. Returns a maximum of 10 results',
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      usage: '<prefix><commandName> <query>',
      cooldown: 10000,
      examples: [
        '/hanisearch mankitsu',
        '.hanisearch dropout',
        '!hanime mankitsu happening',
        '!searchhentai tamashii insert'
      ],
      slash: true,
      options: [{
        name: 'anime',
        description: 'Search Query',
        type: ApplicationCommandOptionType.String,
        required: true,
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    const query = message.args.join(' ');

    if (!query) {
      return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Animes/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Animes/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    };

    const res = await hanime.search(query);

    if (!res.hits) {
      return message.channel.error(`**${message.author}**, ${message.translate('Animes/hanisearch:AHENTAI_DESC')} **${query}**!`);
    };

    const pages = new Pages(res.videos.splice(0, 10).map((entry, i, a) =>
      new Embed(bot, message.guild)
        .setColor(65475)
        .setTitle(entry.name)
        .setURL(`https://hanime.tv/videos/hentai/${entry.slug}`)
        .setImage(reviseURL(entry.poster_url))
        .setThumbnail(reviseURL(entry.cover_url))
        .setAuthor({ name: 'hanime.tv', iconURL: 'https://i.imgur.com/fl2V0QV.png', url: 'https://hanime.tv/' })
        .setDescription([
          `[**${entry.brand}**](https://hanime.tv/browse/brands/${entry.brand.toLowerCase().replace(/ +/gi, '\-')})`,
          entry.tags.sort().map(x => `[\`${x.toUpperCase()}\`](https://hanime.tv/browse/tags/${encodeURI(x)})`).join(' ')
        ].join('\n\n'))
        .setFooter({
          text: [
            `${message.translate('Animes/hanisearch:AHENTAI_DESC1')} ${i + 1} ${message.translate('Animes/hanisearch:AHENTAI_DESC2')} ${a.length}`,
            `${message.translate('Animes/hanisearch:AHENTAI_DESC3')} ${settings.prefix}${message.translate(`Animes/${this.help.name}:USAGEE`)}`,
            `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })}`
          ].join('\u2000\u2000•\u2000\u2000')
        })
        .addFields([
          { name: `${message.translate('Animes/hanisearch:AHENTAI_DESC4')}`, value: `${moment(new Date(entry.released_at * 1000)).format('dddd, do MMMM YYYY')}`, inline: true },
          { name: `${message.translate('Animes/hanisearch:AHENTAI_DESC5')}`, value: `${text.ordinalize(entry.monthly_rank).replace('0th', 'Unranked')}`, inline: true },
          { name: `${message.translate('Animes/hanisearch:AHENTAI_DESC6')}`, value: `${text.commatize(entry.downloads)}`, inline: true },
          {
            name: `${message.translate('Animes/hanisearch:AHENTAI_DESC7')} (${Math.round((entry.likes / (entry.likes + entry.dislikes)) * 100)}%)`,
            value: `${text.commatize(entry.likes)}`, inline: true
          },
          { name: `${message.translate('Animes/hanisearch:AHENTAI_DESC8')}`, value: `${text.commatize(entry.interests)}`, inline: true },
          { name: `${message.translate('Animes/hanisearch:AHENTAI_DESC9')}`, value: `${text.commatize(entry.views)}`, inline: true },
          {
            name: '\u200b',
            value: [
              text.truncate(decode(entry.description).replace(/\<\/?(p|br)\>/gi, ''), 500),
              `[**\\▶ ${message.translate('Animes/hanisearch:AHENTAI_DESC10')}** \`${entry.is_censored ? message.translate('Animes/hanisearch:AHENTAI_DESC11') : message.translate('Animes/hanisearch:AHENTAI_DESC12')}\` ${message.translate('Animes/hanisearch:AHENTAI_DESC13')} **hanime.tv**](https://hanime.tv/videos/hentai/${entry.slug})`
            ].join('\n\n')
          }
        ])
    ));

    const msg = await message.channel.send({ embeds: [pages.firstPage] });

    if (pages.size === 1) {
      return;
    };

    const prev = bot.emojis.cache.get('855513155366813746') || '◀';
    const next = bot.emojis.cache.get('855513155332472832') || '▶';
    const terminate = bot.emojis.cache.get('855513440537935932') || '❌';

    const filter = (_, user) => user.id === message.author.id;
    const collector = msg.createReactionCollector({ filter: filter });
    const navigators = [prev, next, terminate];
    let timeout = setTimeout(() => collector.stop(), 90000);

    for (let i = 0; i < navigators.length; i++) {
      await msg.react(navigators[i]);
    };

    collector.on('collect', async reaction => {

      switch (reaction.emoji.name) {
        case prev instanceof GuildEmoji ? prev.name : prev:
          msg.edit({ embeds: [pages.previous()] });
          break;
        case next instanceof GuildEmoji ? next.name : next:
          msg.edit({ embeds: [pages.next()] });
          break;
        case terminate instanceof GuildEmoji ? terminate.name : terminate:
          collector.stop();
          break;
      };

      await reaction.users.remove(message.author.id);
      timeout.refresh();
    });

    collector.on('end', async () => await msg.reactions.removeAll());

  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const channel = guild.channels.cache.get(interaction.channelId);
    const query = args.get('anime')?.value;

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      const res = await hanime.search(query);

      if (!res.hits) {
        return interaction.editReply(`**${member}**, ${guild.translate('Animes/hanisearch:AHENTAI_DESC')} **${query}**!`);
      };

      // get total page number
      let pagesNum = Math.ceil(res.videos.length / 10);
      if (pagesNum === 0) pagesNum = 1;

      // create pages for pageinator
      const pages = [];
      let i = 0;
      let totalPage = res.videos.length;
      for (const entry of res.videos.splice(0, 10)) {
        i++
        const embed = new Embed(bot, guild)
          .setColor(65475)
          .setTitle(entry.name)
          .setURL(`https://hanime.tv/videos/hentai/${entry.slug}`)
          .setImage(reviseURL(entry.poster_url))
          .setThumbnail(reviseURL(entry.cover_url))
          .setAuthor({ name: 'hanime.tv', iconURL: 'https://i.imgur.com/fl2V0QV.png', url: 'https://hanime.tv/' })
          .setDescription([
            `[**${entry.brand}**](https://hanime.tv/browse/brands/${entry.brand.toLowerCase().replace(/ +/gi, '\-')})`,
            entry.tags.sort().map(x => `[\`${x.toUpperCase()}\`](https://hanime.tv/browse/tags/${encodeURI(x)})`).join(' ')
          ].join('\n\n'))
          .setFooter({
            text: [
              `${guild.translate('Animes/hanisearch:AHENTAI_DESC1')} ${i} ${guild.translate('Animes/hanisearch:AHENTAI_DESC2')} ${totalPage}`,
              `${guild.translate('Animes/hanisearch:AHENTAI_DESC3')} ${guild.settings.prefix}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`,
              `${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })}`
            ].join('\u2000\u2000•\u2000\u2000')
          })
          .addFields([
            { name: `${guild.translate('Animes/hanisearch:AHENTAI_DESC4')}`, value: `${moment(new Date(entry.released_at * 1000)).format('dddd, do MMMM YYYY')}`, inline: true },
            { name: `${guild.translate('Animes/hanisearch:AHENTAI_DESC5')}`, value: `${text.ordinalize(entry.monthly_rank).replace('0th', 'Unranked')}`, inline: true },
            { name: `${guild.translate('Animes/hanisearch:AHENTAI_DESC6')}`, value: `${text.commatize(entry.downloads)}`, inline: true },
            {
              name: `${guild.translate('Animes/hanisearch:AHENTAI_DESC7')} (${Math.round((entry.likes / (entry.likes + entry.dislikes)) * 100)}%)`,
              value: `${text.commatize(entry.likes)}`, inline: true
            },
            { name: `${guild.translate('Animes/hanisearch:AHENTAI_DESC8')}`, value: `${text.commatize(entry.interests)}`, inline: true },
            { name: `${guild.translate('Animes/hanisearch:AHENTAI_DESC9')}`, value: `${text.commatize(entry.views)}`, inline: true },
            {
              name: '\u200b',
              value: [
                text.truncate(decode(entry.description).replace(/\<\/?(p|br)\>/gi, ''), 500),
                `[**\\▶ ${guild.translate('Animes/hanisearch:AHENTAI_DESC10')}** \`${entry.is_censored ? guild.translate('Animes/hanisearch:AHENTAI_DESC11') : guild.translate('Animes/hanisearch:AHENTAI_DESC12')}\` ${guild.translate('Animes/hanisearch:AHENTAI_DESC13')} **hanime.tv**](https://hanime.tv/videos/hentai/${entry.slug})`
              ].join('\n\n')
            }
          ])
        pages.push(embed);
      }

      // If a user specified a page number then show page if not show pagintor.
      return HopePaginator(bot, interaction, pages, member.id);
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};

function reviseURL(url) {
  const baseurl = 'https://i1.wp.com/static-assets.droidbuzz.top/';
  const ext = String(url).match(/images\/(covers|posters)\/[\-\w]{1,}\.(jpe?g|png|gif)/i);
  return ext ? baseurl + ext[0] : null;
};;