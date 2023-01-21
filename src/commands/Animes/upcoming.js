// Dependências
const { GuildEmoji } = require('discord.js'),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  { Embed, HopePaginator } = require(`../../utils`),
  _ = require('lodash'),
  fetch = require('node-fetch'),
  Paginate = require('../../structures/Paginate'),
  text = require('../../utils/string'),
  types = ['TV', 'ONA', 'OVA', 'Movie', 'Special', '-'],
  Command = require('../../structures/Command.js');

module.exports = class Upcoming extends Command {
  constructor(bot) {
    super(bot, {
      name: 'upcoming',
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.UseExternalEmojis, Flags.AddReactions],
      usage: '<prefix><commandName> <query>',
      aliases: ['proximos-animes', 'pa', 'p-animes', 'nextani'],
      description: 'Displays the list of upcoming anime.',
      examples: [
        '/upcoming',
        '.upcoming tv',
        '!upcoming ona',
        '?upcoming ova',
        '>upcoming movie',
        '*upcoming special',
        '$upcoming -'
      ],
      cooldown: 10000,
      slash: true,
      options: [{
        name: 'type',
        description: 'Anime Media Type',
        type: ApplicationCommandOptionType.String,
        choices: [...types.map(type => ({ name: type, value: type }))].slice(0, 24),
        required: true,
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    let type = message.args[0] || 'tv';
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    if (types.some(x => x.toLowerCase() === type.toLowerCase())) {
      type = types[types.findIndex(c => c.toLowerCase() === type.toLowerCase())];
    } else {
      type = null;
    };

    const embed = new Embed(bot, message.guild)
      .setColor(65475)
      .setThumbnail('https://i.imgur.com/UH1StAo.png')
      .setDescription(`\u200B\n ${message.translate('Animes/upcoming:APROX_DESC')} **${type || ' '}** ${message.translate('Animes/upcoming:APROX_DESC1')} <:MyAnimeList:827773575112425472> [MyAnimeList](https://myanimelist.net 'MyAnimeList Site').\n\u200B`)
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

    let msg = await message.channel.send({ embeds: [embed] });

    let res = await fetch(`https://api.jikan.moe/v4/seasons/upcoming`).then(res => res.json());

    if (!res.data || res.data.error) {
      res = res ? res : {};

      embed.setColor(65475)
        .setAuthor({ name: message.translate('Animes/upcoming:APROX_DESC2'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          message.translate('Animes/upcoming:APROX_DESC3', { member: message.member.displayName }),
          message.translate('Animes/upcoming:APROX_DESC4', { status: res.status })
        ].join(''))
        .setThumbnail('https://i.imgur.com/UH1StAo.png');

      return await msg.edit({ embeds: [embed] }).catch(() => null) || await message.channel.send({ embeds: [embed] });
    };

    if (types.includes(type)) {
      res.data = res.data.filter(f => f.type === type);
    };

    if (res.data.length <= 1) {
      msg.delete()
      return message.channel.error(`Uh-oh! No data was found for type **${type}**. Please try again!`);
    }

    const chunks = 8;
    const descriptions = _.chunk(res.data.map(anime => {
      return text.truncate([
        `[**${anime.title}**](https://myanimelist.net/anime/${anime.mal_id})`,
        `\`${[!type ? ' ' + anime.type : null, text.joinArray(anime.genres.map(x => x.name))].filter(Boolean).join('\u2000\u2000|\u2000\u2000')} \``,
        anime.synopsis?.replace(/\r\n/g, ' ').replace(`(${message.translate('Animes/upcoming:APROX_DESC11')})` || '\u2000', '')
      ].filter(Boolean).join('\n'), Math.floor(2000 / chunks))
    }), chunks);

    const pages = new Paginate();
    let index = 0;

    for (const anime of descriptions) {
      pages.add(
        new Embed(bot, message.guild)
          .setColor(65475)
          .setAuthor({ name: `${message.translate('Animes/upcoming:APROX_DESC5')}\u2000|\u2000${message.translate('Animes/upcoming:APROX_DESC6')} ${type || `${message.translate('Animes/upcoming:APROX_DESC7')}`}` })
          .setDescription(anime.join('\n\n'))
          .setFooter({
            text: [
              `${message.translate('Animes/upcoming:APROX_DESC8')} ${settings.prefix}proximos-animes`,
              `${message.translate('Animes/upcoming:APROX_DESC9')} ${index + 1} ${message.translate('Animes/upcoming:APROX_DESC10')} ${descriptions.length}`,
              `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })}`
            ].join('\u2000|\u2000')
          })
      );
      index++;
    };

    msg = await msg.edit({ embeds: [pages.firstPage] }).catch(() => null) || await message.channel.send({ embeds: [pages.firstPage] });

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
    let type = args.get('type')?.value ?? weekdays[new Date().getDay()];

    await interaction.deferReply();

    if (types.some(x => x.toLowerCase() === type.toLowerCase())) {
      type = types[types.findIndex(c => c.toLowerCase() === type.toLowerCase())];
    } else {
      type = null;
    };

    const embed = new Embed(bot, guild)
      .setColor(65475)
      .setThumbnail('https://i.imgur.com/UH1StAo.png')
      .setDescription(`\u200B\n ${guild.translate('Animes/upcoming:APROX_DESC')} **${type || ' '}** ${guild.translate('Animes/upcoming:APROX_DESC1')} <:MyAnimeList:827773575112425472> [MyAnimeList](https://myanimelist.net 'MyAnimeList Site').\n\u200B`)
      .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

    const message = await interaction.editReply({ embeds: [embed] });

    let res = await fetch(`https://api.jikan.moe/v4/seasons/upcoming`).then(res => res.json());

    if (!res.data || res.data.error) {
      res = res ? res : {};

      embed.setColor(65475)
        .setAuthor({ name: guild.translate('Animes/upcoming:APROX_DESC2'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          guild.translate('Animes/upcoming:APROX_DESC3', { member: member.displayName }),
          guild.translate('Animes/upcoming:APROX_DESC4', { status: res.status })
        ].join(''))
        .setThumbnail('https://i.imgur.com/UH1StAo.png');

      interaction.editReply({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 }));
    };

    if (types.includes(type)) {
      res.data = res.data.filter(f => f.type === type);
    };

    if (res.data.length <= 1) {
      message.delete();
      interaction.editReply({ embeds: [channel.error(`Uh-oh! No data was found for type **${type}**. Please try again!`, true)] });
    }

    const chunks = 8;
    const descriptions = _.chunk(res.data.map(anime => {
      return text.truncate([
        `[**${anime.title}**](https://myanimelist.net/anime/${anime.mal_id})`,
        `\`${[!type ? ' ' + anime.type : null, text.joinArray(anime.genres.map(x => x.name))].filter(Boolean).join('\u2000\u2000|\u2000\u2000')} \``,
        anime.synopsis?.replace(/\r\n/g, ' ').replace(`(${guild.translate('Animes/upcoming:APROX_DESC11')})` || '\u2000', '')
      ].filter(Boolean).join('\n'), Math.floor(2000 / chunks))
    }), chunks);

    // get total page number
    let pagesNum = Math.ceil(res.data.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    // create pages for pageinator
    const pages = [];
    let index = 0;
    for (const anime of descriptions) {
      const embed = new Embed(bot, guild)
        .setColor(65475)
        .setAuthor({ name: `${guild.translate('Animes/upcoming:APROX_DESC5')}\u2000|\u2000${guild.translate('Animes/upcoming:APROX_DESC6')} ${type || `${guild.translate('Animes/upcoming:APROX_DESC7')}`}` })
        .setDescription(anime.join('\n\n'))
        .setFooter({
          text: [
            `${guild.translate('Animes/upcoming:APROX_DESC8')} ${guild.settings.prefix}proximos-animes`,
            `${guild.translate('Animes/upcoming:APROX_DESC9')} ${index + 1} ${guild.translate('Animes/upcoming:APROX_DESC10')} ${descriptions.length}`,
            `${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })}`
          ].join('\u2000|\u2000')
        })
      index++;
      pages.push(embed);
    };

    // If a user specified a page number then show page if not show pagintor.
    return HopePaginator(bot, interaction, pages, member.id);
  }
};