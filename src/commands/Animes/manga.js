// Dependências
const { GuildEmoji } = require('discord.js'),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  { fetch } = require('undici'),
  { Embed, HopePaginator } = require(`../../utils`),
  moment = require('moment'),
  Pages = require('../../structures/Paginate'),
  text = require('../../utils/string'),
  Command = require('../../structures/Command.js');

module.exports = class Manga extends Command {
  constructor(bot) {
    super(bot, {
      name: 'manga',
      dirname: __dirname,
      aliases: ['animanga', 'searchmanga', 'comic', 'manhwa', 'manhua'],
      description: 'Searches for a Manga / Manhwa / Manhua in MyAnimeList.',
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.UseExternalEmojis, Flags.AddReactions],
      usage: '<prefix><commandName> <query>',
      cooldown: 10000,
      nsfw: true,
      examples: [
        '/manga solo leveling',
        '.comic rascal does not dream',
        '!manhwa solo leveling',
        '?manhua kings avatar'
      ],
      slash: true,
      options: [{
        name: 'manga',
        description: 'Search Query',
        type: ApplicationCommandOptionType.String,
        required: true,
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const query = message.args.join(' ') || 'Hellsing Ultimate';

    const embed = new Embed(bot, message.guild)
      .setColor(65475)
      .setDescription(message.translate('Animes/manga:AMANGA_DESC', { query: query }))
      .setThumbnail('https://i.imgur.com/UH1StAo.png')
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

    let msg = await message.channel.send({ embeds: [embed] });

    const manga = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURI(query)}&page=1`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

    embed.setColor(65475).setAuthor({
      name:
        !manga.data.error && !manga.data.length
          ? message.translate('Animes/manga:AMANGA_DESC1')
          : message.translate('Animes/manga:AMANGA_DESC2')
      , iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1'
    }).setDescription(
      !manga.data.error && !manga.data.length
        ? [
          `**${message.member.displayName}**, ${message.translate('Animes/manga:AMANGA_DESC3')} **${query}**!\n`,
          message.translate('Animes/manga:AMANGA_DESC4'),
          message.translate('Animes/manga:AMANGA_DESC5'),
          message.translate('Animes/manga:AMANGA_DESC6')
        ].join('\n')
        : message.translate('Animes/manga:AMANGA_DESC7', { status: manga.data.status })
    );

    if (!manga || manga.data.error || !manga.data.length) {
      return await msg.edit(embed).catch(() => null) || message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
    };

    const elapsed = Date.now() - message.createdAt;
    const pages = new Pages();

    for (const res of manga.data.slice(0, 10)) {
      pages.add(
        new Embed(bot, message.guild)
          .setAuthor({ name: res.title, iconURL: res.images.webp.small_image_url, url: res.url })
          .setColor(65475)
          .setThumbnail(res.images.webp.large_image_url ?? res.images.webp.image_url)
          .setFooter({
            text: [
              `${message.translate('Animes/manga:AMANGA_DESC8')} ${Math.abs(elapsed / 1000).toFixed(2)} ${message.translate('Animes/manga:AMANGA_DESC9')}`,
              `${message.translate('Animes/manga:AMANGA_DESC10')} ${pages.size + 1} ${message.translate('Animes/manga:AMANGA_DESC11')} ${manga.data.slice(0, 10).length}`,
              `${message.translate('Animes/manga:AMANGA_DESC12')} ${settings.prefix}manga`
            ].join('\u2000\u2000•\u2000\u2000')
          })
          .addFields(
            { name: `${message.translate('Animes/manga:AMANGA_DESC13')}`, value: `${res.type || 'Undefined'}`, inline: true },
            { name: `${message.translate('Animes/manga:AMANGA_DESC14')}`, value: `${res.publishing ? message.translate('Animes/manga:AMANGA_DESC15') : message.translate('Animes/manga:AMANGA_DESC16')}`, inline: true },
            { name: `${message.translate('Animes/manga:AMANGA_DESC17')}`, value: `${res.chapters}`, inline: true },
            { name: `${message.translate('Animes/manga:AMANGA_DESC18')}`, value: `${text.commatize(res.members)}`, inline: true },
            { name: `${message.translate('Animes/manga:AMANGA_DESC19')}`, value: `${res.score}`, inline: true },
            { name: `${message.translate('Animes/manga:AMANGA_DESC20')}`, value: `${res.volumes}`, inline: true },
            { name: `${message.translate('Animes/manga:AMANGA_DESC21')}`, value: `${moment(res.published.from).format('dddd, Do MMMM YYYY')}`, inline: true },
            { name: `${message.translate('Animes/manga:AMANGA_DESC22')}`, value: `${res.published.to ? moment(res.published.to).format('dddd, Do MMMM YYYY') : message.translate('Animes/manga:AMANGA_DESC23')}`, inline: true },
            { name: '\u200b', value: res.synopsis || '\u200b', inline: false }
          )
      );
    }

    msg = await msg.edit({ embeds: [pages.firstPage] }).catch(() => null) || await message.channel.send({ embeds: [pages.firstPage] }).then(m => m.timedDelete({ timeout: 90000 }));

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
    const query = args.get('manga')?.value;

    try {
      // Get Interaction Message Data
      // await interaction.deferReply();

      const embed = new Embed(bot, guild)
        .setColor(65475)
        .setDescription(guild.translate('Animes/manga:AMANGA_DESC', { query: query }))
        .setThumbnail('https://i.imgur.com/UH1StAo.png')
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

      let msg = await interaction.reply({ embeds: [embed] });

      const manga = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURI(query)}&page=1`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      embed.setColor(65475).setAuthor({
        name:
          !manga.data.error && !manga.data.length
            ? guild.translate('Animes/manga:AMANGA_DESC1')
            : guild.translate('Animes/manga:AMANGA_DESC2')
        , iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1'
      }).setDescription(
        !manga.data.error && !manga.data.length
          ? [
            `**${member.displayName}**, ${guild.translate('Animes/manga:AMANGA_DESC3')} **${query}**!\n`,
            guild.translate('Animes/manga:AMANGA_DESC4'),
            guild.translate('Animes/manga:AMANGA_DESC5'),
            guild.translate('Animes/manga:AMANGA_DESC6')
          ].join('\n')
          : guild.translate('Animes/manga:AMANGA_DESC7', { status: manga.data.status })
      );

      if (!manga || manga.data.error || !manga.data.length) {
        return await msg.edit(embed).catch(() => null) || interaction.editReply({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
      };

      const elapsed = Math.floor(Math.random() * 6000);

      // get total page number
      let pagesNum = Math.ceil(manga.data.length / 10);
      if (pagesNum === 0) pagesNum = 1;

      // create pages for pageinator
      const pages = [];
      let i = 0;
      let totalPage = manga.data.length;
      for (const res of manga.data.slice(0, 10)) {
        i++
        const embed = new Embed(bot, guild)
          .setAuthor({ name: res.title, iconURL: res.images.webp.small_image_url, url: res.url })
          .setColor(65475)
          .setThumbnail(res.images.webp.large_image_url ?? res.images.webp.image_url)
          .setFooter({
            text: [
              `${guild.translate('Animes/manga:AMANGA_DESC8')} ${Math.abs(elapsed / 1000).toFixed(2)} ${guild.translate('Animes/manga:AMANGA_DESC9')}`,
              `${guild.translate('Animes/manga:AMANGA_DESC10')} ${i} ${guild.translate('Animes/manga:AMANGA_DESC11')} ${manga.data.slice(0, 10).length}`,
              `${guild.translate('Animes/manga:AMANGA_DESC12')} ${guild.settings.prefix}manga`
            ].join('\u2000\u2000•\u2000\u2000')
          })
          .addFields(
            { name: `${guild.translate('Animes/manga:AMANGA_DESC13')}`, value: `${res.type || 'Undefined'}`, inline: true },
            { name: `${guild.translate('Animes/manga:AMANGA_DESC14')}`, value: `${res.publishing ? guild.translate('Animes/manga:AMANGA_DESC15') : guild.translate('Animes/manga:AMANGA_DESC16')}`, inline: true },
            { name: `${guild.translate('Animes/manga:AMANGA_DESC17')}`, value: `${res.chapters}`, inline: true },
            { name: `${guild.translate('Animes/manga:AMANGA_DESC18')}`, value: `${text.commatize(res.members)}`, inline: true },
            { name: `${guild.translate('Animes/manga:AMANGA_DESC19')}`, value: `${res.score}`, inline: true },
            { name: `${guild.translate('Animes/manga:AMANGA_DESC20')}`, value: `${res.volumes}`, inline: true },
            { name: `${guild.translate('Animes/manga:AMANGA_DESC21')}`, value: `${moment(res.published.from).format('dddd, Do MMMM YYYY')}`, inline: true },
            { name: `${guild.translate('Animes/manga:AMANGA_DESC22')}`, value: `${res.published.to ? moment(res.published.to).format('dddd, Do MMMM YYYY') : guild.translate('Animes/manga:AMANGA_DESC23')}`, inline: true },
            { name: '\u200b', value: res.synopsis || '\u200b', inline: false }
          )
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