// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  { getInfoFromName } = require('mal-scraper'),
  moment = require('moment'),
  malProducers = require(`${process.cwd()}/assets/json/MAL_Producers.json`),
  { malGenres } = require('../../utils/constants'),
  text = require('../../utils/string')
Command = require('../../structures/Command.js');

module.exports = class Anime extends Command {
  constructor(bot) {
    super(bot, {
      name: 'anime',
      dirname: __dirname,
      aliases: ['ani', 'as', 'animelist', 'anisearch'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      nsfw: true,
      description: 'Search for a specific anime on MyAnimeList.net',
      usage: '<prefix><commandName> <anime name>',
      cooldown: 10000,
      examples: ['/anime aobuta', '.ani Helsing Ultimate', '!as Code Geass', '?anisearch one punch man'],
      slash: true,
      options: [{
        name: 'query',
        description: 'Search Query',
        type: ApplicationCommandOptionType.String,
        required: true,
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const query = message.args.join(' ') || 'Helsing Ultimate';

    const data = await new Promise((resolve, reject) => {
      setTimeout(() => reject('TIMEOUT'), 10000);

      return getInfoFromName(query)
        .then(res => resolve(res))
        .catch(err => reject(err));
    }).catch((err) => err !== 'TIMEOUT' ? null : err)

    if (!data) {
      return message.channel.error([
        `**${message.author}**, ${message.translate('Animes/anime:ALIST_DESC')} **${query}**`,
        message.translate('Animes/anime:ALIST_DESC1'),
        message.translate('Animes/anime:ALIST_DESC2'),
        message.translate('Animes/anime:ALIST_DESC3'),
        message.translate('Animes/anime:ALIST_DESC4')
      ].join('\n')).then(() => message.channel.stopTyping());
    } else if (data === 'TIMEOUT') {
      return message.channel.send([
        message.translate('Animes/anime:ALIST_DESC5', { author: message.author.tag }),
        message.translate('Animes/anime:ALIST_DESC6')
      ].join('\n')).then(() => message.channel.stopTyping());
    };

    const isHentai = data.genres.some(x => x === 'Hentai');
    const nsfwch = message.guild.channels.cache.filter(x => x.nsfw).map(x => x.toString());

    if (isHentai && message.channel.nsfw === false) {
      return message.channel.error(`**${message.author}**, ${message.translate('Animes/anime:ALIST_DESC7')} **${query
        }**, ${message.translate('Animes/anime:ALIST_DESC8')} **${data.studios?.[0]}**. ${message.translate('Animes/anime:ALIST_DESC9')}${nsfwch.length ? ` ${message.translate('Animes/anime:ALIST_DESC10')} ${text.joinArray(nsfwch)}` : ''
        }. ${message.translate('Animes/anime:ALIST_DESC11')} \`${settings.prefix}buscarhentai\` ${message.translate('Animes/anime:ALIST_DESC12')}`)
    };

    const embed = new Embed(bot, message.guild)
      .setColor(isHentai ? 65475 : 65475)
      .setURL(data.url)
      .setThumbnail(data.picture || null)
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
      .setTitle(text.truncate(data.englishTitle || data.title, 200))
      .setDescription([
        [
          `[\\⭐](https://myanimelist.net/anime/${data.id}/stats '${message.translate('Animes/anime:ALIST_DESC13')}'): ${data.score}`,
          `[\\🏅](https://myanimelist.net/info.php?go=topanime '${message.translate('Animes/anime:ALIST_DESC14')}'): ${isNaN(data.ranked.slice(1)) ? `${message.translate('Animes/anime:ALIST_DESC16')}` : text.ordinalize((data.ranked).slice(1))}`,
          `[\\✨](https://myanimelist.net/info.php?go=topanime '${message.translate('Animes/anime:ALIST_DESC15')}'): ${data.popularity || '~'}`,
          `[\` ▶ \`](${data.trailer} '${message.translate('Animes/anime:ALIST_DESC17')}')`
        ].join('\u2000\u2000•\u2000\u2000'),
        `\n${text.joinArray(data.genres.map(g =>
          `[${g}](https://myanimelist.net/anime/genre/${malGenres[g.toLowerCase()]})`
        ) || [])}`,
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      ].filter(Boolean).join('\n'))
      .addFields([
        {
          name: 'Source', inline: true,
          value: `${data.source ? [data.source].map(x => {
            const valid_sources = {
              'Light novel': 'lightnovels',
              'Manga': 'manga',
              'Web manga': 'manhwa',
              'One-shot': 'oneshots',
              'Doujinshi': 'doujin',
              'Novel': 'novels',
              'Manhwa': 'manhwa',
              'Manhua': 'manhua'
            };
            return x ? `[**${x}**](https://myanimelist.net/topmanga.php?type=${valid_sources[x] || 'manga'})` : x;
          }) : message.translate('Animes/anime:ALIST_DESC18')}`
        }, {
          name: `${message.translate('Animes/anime:ALIST_DESC19')}`, inline: true,
          value: `[**${data.episodes}**](https://myanimelist.net/anime/${data.id}/_/episode)`,
        }, {
          name: `${message.translate('Animes/anime:ALIST_DESC20')}`, inline: true,
          value: `${data.duration || message.translate('Animes/anime:ALIST_DESC18')}`,
        }, {
          name: `${message.translate('Animes/anime:ALIST_DESC21')}`, inline: true,
          value: `${data.type ? `[**${data.type}**](https://myanimelist.net/topanime.php?type=${encodeURI(data.type.toLowerCase())})` : 'showType Unavailable'}`
        }, {
          name: `${message.translate('Animes/anime:ALIST_DESC22')}`, inline: true,
          value: `${data.premiered && data.premiered !== '?' ? `[**${data.premiered}**](https://myanimelist.net/anime/season/${data.premiered.split(' ')[1]}/${data.premiered.split(' ')[0]?.toLowerCase()})` : message.translate('Animes/anime:ALIST_DESC18')}`
        }, {
          name: `${message.translate('Animes/anime:ALIST_DESC23')}`, inline: true,
          value: `[**${data.studios?.[0]}**](https://myanimelist.net/anime/producer/${malProducers[data.studios?.[0]]}/)` || message.translate('Animes/anime:ALIST_DESC18')
        }, {
          name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          value: `${text.truncate(data.synopsis || message.translate('Animes/anime:ALIST_DESC24'), 500, `...\n\n[${message.translate('Animes/anime:ALIST_DESC25')}](${data.url} '${message.translate('Animes/anime:ALIST_DESC26')}')`)}`,
        }, {
          name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          value: [
            `**${data.status === message.translate('Animes/anime:ALIST_DESC27') ? message.translate('Animes/anime:ALIST_DESC28') : data.status === message.translate('Animes/anime:ALIST_DESC29') ? message.translate('Animes/anime:ALIST_DESC30') : message.translate('Animes/anime:ALIST_DESC31')} (*${moment(data.aired.split('to')[0], 'll').fromNow()}*):** ${data.aired || message.translate('Animes/anime:ALIST_DESC18')}`,
            '',
            `**${message.translate('Animes/anime:ALIST_DESC32')}**: ${text.truncate(text.joinArray(data.producers?.map(x => x === message.translate('Animes/anime:ALIST_DESC33') ? x : `[${x}](https://myanimelist.net/anime/producer/${malProducers[x]}/)`) || []) || message.translate('Animes/anime:ALIST_DESC18'), 900, '...')}`,
            '',
            `**${message.translate('Animes/anime:ALIST_DESC34')}**: *${data.rating.replace(`${message.translate('Animes/anime:ALIST_DESC35')}`, '') || message.translate('Animes/anime:ALIST_DESC36')}*`,
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          ].join('\n')
        }
      ])
    return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const channel = guild.channels.cache.get(interaction.channelId);

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      const query = args.get('query').value || 'Helsing Ultimate';

      const data = await new Promise((resolve, reject) => {
        setTimeout(() => reject('TIMEOUT'), 10000);

        return getInfoFromName(query)
          .then(res => resolve(res))
          .catch(err => reject(err));
      }).catch((err) => err !== 'TIMEOUT' ? null : err)

      if (!data) {
        return interaction.editReply({ embeds: [channel.error([`**${member}**, ${guild.translate('Animes/anime:ALIST_DESC')} **${query}**`, guild.translate('Animes/anime:ALIST_DESC1'), guild.translate('Animes/anime:ALIST_DESC2'), guild.translate('Animes/anime:ALIST_DESC3'), guild.translate('Animes/anime:ALIST_DESC4')], true)].join('\n'), ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      } else if (data === 'TIMEOUT') {
        return interaction.editReply([
          guild.translate('Animes/anime:ALIST_DESC5', { author: member.tag }),
          guild.translate('Animes/anime:ALIST_DESC6')
        ].join('\n')).then(() => channel.stopTyping());
      };

      const isHentai = data.genres.some(x => x === 'Hentai');
      const nsfwch = guild.channels.cache.filter(x => x.nsfw).map(x => x.toString());

      if (isHentai && channel.nsfw === false) {
        return interaction.editReply({ embeds: [channel.error([`**${member}**, ${guild.translate('Animes/anime:ALIST_DESC7')} **${query}**, ${guild.translate('Animes/anime:ALIST_DESC8')} **${data.studios?.[0]}**. ${guild.translate('Animes/anime:ALIST_DESC9')}${nsfwch.length ? ` ${guild.translate('Animes/anime:ALIST_DESC10')} ${text.joinArray(nsfwch)}` : ''}. ${guild.translate('Animes/anime:ALIST_DESC11')} \`${guild.settings.prefix}buscarhentai\` ${guild.translate('Animes/anime:ALIST_DESC12')}`], true)].join('\n'), ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      };

      const embed = new Embed(bot, guild)
        .setColor(isHentai ? 65475 : 65475)
        .setURL(data.url)
        .setThumbnail(data.picture || null)
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
        .setTitle(text.truncate(data.englishTitle || data.title, 200))
        .setDescription([
          [
            `[\\⭐](https://myanimelist.net/anime/${data.id}/stats '${guild.translate('Animes/anime:ALIST_DESC13')}'): ${data.score}`,
            `[\\🏅](https://myanimelist.net/info.php?go=topanime '${guild.translate('Animes/anime:ALIST_DESC14')}'): ${isNaN(data.ranked.slice(1)) ? `${guild.translate('Animes/anime:ALIST_DESC16')}` : text.ordinalize((data.ranked).slice(1))}`,
            `[\\✨](https://myanimelist.net/info.php?go=topanime '${guild.translate('Animes/anime:ALIST_DESC15')}'): ${data.popularity || '~'}`,
            `[\` ▶ \`](${data.trailer} '${guild.translate('Animes/anime:ALIST_DESC17')}')`
          ].join('\u2000\u2000•\u2000\u2000'),
          `\n${text.joinArray(data.genres.map(g =>
            `[${g}](https://myanimelist.net/anime/genre/${malGenres[g.toLowerCase()]})`
          ) || [])}`,
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        ].filter(Boolean).join('\n'))
        .addFields([
          {
            name: 'Source', inline: true,
            value: `${data.source ? [data.source].map(x => {
              const valid_sources = {
                'Light novel': 'lightnovels',
                'Manga': 'manga',
                'Web manga': 'manhwa',
                'One-shot': 'oneshots',
                'Doujinshi': 'doujin',
                'Novel': 'novels',
                'Manhwa': 'manhwa',
                'Manhua': 'manhua'
              };
              return x ? `[**${x}**](https://myanimelist.net/topmanga.php?type=${valid_sources[x] || 'manga'})` : x;
            }) : guild.translate('Animes/anime:ALIST_DESC18')}`
          }, {
            name: `${guild.translate('Animes/anime:ALIST_DESC19')}`, inline: true,
            value: `[**${data.episodes}**](https://myanimelist.net/anime/${data.id}/_/episode)`,
          }, {
            name: `${guild.translate('Animes/anime:ALIST_DESC20')}`, inline: true,
            value: `${data.duration || guild.translate('Animes/anime:ALIST_DESC18')}`,
          }, {
            name: `${guild.translate('Animes/anime:ALIST_DESC21')}`, inline: true,
            value: `${data.type ? `[**${data.type}**](https://myanimelist.net/topanime.php?type=${encodeURI(data.type.toLowerCase())})` : 'showType Unavailable'}`
          }, {
            name: `${guild.translate('Animes/anime:ALIST_DESC22')}`, inline: true,
            value: `${data.premiered && data.premiered !== '?' ? `[**${data.premiered}**](https://myanimelist.net/anime/season/${data.premiered.split(' ')[1]}/${data.premiered.split(' ')[0]?.toLowerCase()})` : guild.translate('Animes/anime:ALIST_DESC18')}`
          }, {
            name: `${guild.translate('Animes/anime:ALIST_DESC23')}`, inline: true,
            value: `[**${data.studios?.[0]}**](https://myanimelist.net/anime/producer/${malProducers[data.studios?.[0]]}/)` || guild.translate('Animes/anime:ALIST_DESC18')
          }, {
            name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            value: `${text.truncate(data.synopsis || guild.translate('Animes/anime:ALIST_DESC24'), 500, `...\n\n[${guild.translate('Animes/anime:ALIST_DESC25')}](${data.url} '${guild.translate('Animes/anime:ALIST_DESC26')}')`)}`,
          }, {
            name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            value: [
              `**${data.status === guild.translate('Animes/anime:ALIST_DESC27') ? guild.translate('Animes/anime:ALIST_DESC28') : data.status === guild.translate('Animes/anime:ALIST_DESC29') ? guild.translate('Animes/anime:ALIST_DESC30') : guild.translate('Animes/anime:ALIST_DESC31')} (*${moment(data.aired.split('to')[0], 'll').fromNow()}*):** ${data.aired || guild.translate('Animes/anime:ALIST_DESC18')}`,
              '',
              `**${guild.translate('Animes/anime:ALIST_DESC32')}**: ${text.truncate(text.joinArray(data.producers?.map(x => x === guild.translate('Animes/anime:ALIST_DESC33') ? x : `[${x}](https://myanimelist.net/anime/producer/${malProducers[x]}/)`) || []) || guild.translate('Animes/anime:ALIST_DESC18'), 900, '...')}`,
              '',
              `**${guild.translate('Animes/anime:ALIST_DESC34')}**: *${data.rating.replace(`${guild.translate('Animes/anime:ALIST_DESC35')}`, '') || guild.translate('Animes/anime:ALIST_DESC36')}*`,
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            ].join('\n')
          }
        ])
      return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};