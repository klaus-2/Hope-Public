// Dependências
const { GuildEmoji } = require('discord.js'),
  { Embed, HopePaginator } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  fetch = require('node-fetch'),
  moment = require('moment'),
  Paginate = require('../../structures/Paginate'),
  text = require('../../utils/string'),
  weekdays = require('../../utils/constants').weeks,
  Command = require('../../structures/Command.js');

const semana = {
  sunday: 'Domigo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
};

module.exports = class Anitoday extends Command {
  constructor(bot) {
    super(bot, {
      name: 'anitoday',
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      usage: '<prefix><commandName> [weekday]',
      aliases: ["animetoday", 'airing', 'anime-hoje', 'anime-hoje', 'anihoje', 'anime-noar'],
      description: 'Displays the list of currently airing anime for today\'s date or given weekday.',
      examples: ['/anitoday', '.anime-hoje', '!anime-hoje sunday', '?anihoje monday', '/anime-noar tuesday'],
      cooldown: 60000,
      slash: true,
      options: [{
        name: 'weekday',
        description: 'Choose Weekday',
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [...weekdays.map(day => ({ name: day, value: day }))].slice(0, 24),
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date();
    let day = weekday[d.getDay()];

    if (!message.args[0] || !weekdays.includes(message.args[0].toLowerCase())) {
      message.args[0] = day;
    };

    const embed = new Embed(bot, message.guild)
      .setColor(65475)
      .setThumbnail('https://i.imgur.com/7HuMF3g.png')
      .setDescription(message.translate('Animes/anitoday:AHOJE_DESC', { day: message.args[0] }))
      .setFooter({ text: message.translate('Animes/anitoday:AHOJE_FOOTER', { author: message.author.username }), iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

    let msg = await message.channel.send({ embeds: [embed] })

    let res = await fetch(`https://api.jikan.moe/v4/schedules?&page=1&filter=${encodeURI(message.args[0])}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

    if (!res || res.error) {
      res = res ? res : {};

      embed.setColor('RED')
        .setAuthor({ name: res.error === message.translate('Animes/anitoday:AHOJE_ERROR') ? message.translate('Animes/anitoday:AHOJE_ERROR1') : message.translate('Animes/anitoday:AHOJE_ERROR2'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          `**${message.member.displayName}**, ${res.error === message.translate('Animes/anitoday:AHOJE_ERROR') ? message.translate('Animes/anitoday:AHOJE_DESC1') : message.translate('Animes/anitoday:AHOJE_DESC2')}\n\n`,
          `${res.error === message.translate('Animes/anitoday:AHOJE_ERROR') ? `**${message.args[0]}** ${message.translate('Animes/anitoday:AHOJE_DESC3')}` : jikanError(res.status)}`
        ].join(''))
        .setThumbnail('https://i.imgur.com/sbTZHbT.png');
      msg.delete()
      return await msg.edit(embed).catch(() => null) || await message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    };
    const elapsed = Date.now() - message.createdTimestamp
    const pages = new Paginate()

    for (const anime of res.data) {
      pages.add(
        new Embed(bot, message.guild)
          .setColor(65475)
          .setThumbnail(anime.image_url)
          .setDescription([
            `${anime.score ? `${message.translate('Animes/anitoday:AHOJE_DESC4')}\u2000${anime.score}\n` : ''}`,
            `${anime.genres.map(x => `[${x.name}](${x.url})`).join(' • ')}\n\n`,
            `${text.truncate(anime.synopsis?.replace(/\r\n/g, ' ').replace(`(${message.translate('Animes/proximos-animes:APROX_DESC11')})` || '\u2000'), 300, `${message.translate('Animes/anitoday:AHOJE_DESC5')}(${anime.url})`)}`
          ].join(''))
          .setAuthor({ name: anime.title, iconURL: null, url: anime.url })
          .setFooter({
            text: [
              `${message.translate('Animes/anitoday:AHOJE_DESC6')} ${Math.abs(elapsed / 1000).toFixed(2)} ${message.translate('Animes/anitoday:AHOJE_DESC7')}`,
              `${message.translate('Animes/anitoday:AHOJE_DESC8')} ${pages.size === null ? 1 : pages.size + 1} ${message.translate('Animes/anitoday:AHOJE_DESC9')} ${res.data.length}`,
              `${message.translate('Animes/anitoday:AHOJE_DESC10', { prefix: settings.prefix })} ${message.translate(`Animes/${this.help.name}:USAGEE`)}`
            ].join('\u2000\u2000•\u2000\u2000'), iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}`
          })
          .addFields([
            { name: `${message.translate('Animes/anitoday:AHOJE_DESC11')}`, value: anime.type || `${message.translate('Animes/anitoday:AHOJE_DESC12')}`, inline: true },
            { name: `${message.translate('Animes/anitoday:AHOJE_DESC13')}`, value: moment(anime.aired.from).format('dddd, do MMMM YYYY'), inline: true },
            { name: `Broadcast`, value: anime.broadcast.string, inline: true },
            { name: `${message.translate('Animes/anitoday:AHOJE_DESC14')}`, value: anime.source || `${message.translate('Animes/anitoday:AHOJE_DESC12')}`, inline: true },
            { name: `${message.translate('Animes/anitoday:AHOJE_DESC15')}`, value: anime.producers.map(x => `[${x.name}](${x.url})`).join(' • ') || `${message.translate('Animes/anitoday:AHOJE_DESC17')}`, inline: true },
            { name: `${message.translate('Animes/anitoday:AHOJE_DESC16')}`, value: anime.licensors.join(' • ') || `${message.translate('Animes/anitoday:AHOJE_DESC17')}`, inline: true },
            // { name: '\u200b', value: '\u200b', inline: true }
          ])
      );
    };
    msg.delete()
    msg = await message.channel.send({ embeds: [pages.currentPage] });

    if (pages.size === 1) {
      return;
    };

    const prev = bot.emojis.cache.get('855513155366813746') || '◀'
    const next = bot.emojis.cache.get('855513155332472832') || '▶'
    const terminate = bot.emojis.cache.get('855513440537935932') || '❌'

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
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date();
    let day = weekday[d.getDay()];
    const query = args.get('weekday')?.value ?? day;

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      let res = await fetch(`https://api.jikan.moe/v4/schedules?&page=1&filter=${encodeURI(query)}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      // Make sure queue is not empty
      if (!res || res.error || res.data.length == 0) {
        res = res ? res : {};
        const embed = new Embed(bot, guild)
          .setAuthor({ name: res.error === guild.translate('Animes/anitoday:AHOJE_ERROR') ? guild.translate('Animes/anitoday:AHOJE_ERROR1') : guild.translate('Animes/anitoday:AHOJE_ERROR2'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
          .setDescription([
            `**${member.displayName}**, ${res.error === guild.translate('Animes/anitoday:AHOJE_ERROR') ? guild.translate('Animes/anitoday:AHOJE_DESC1') : guild.translate('Animes/anitoday:AHOJE_DESC2')}\n\n`,
            `${res.error === guild.translate('Animes/anitoday:AHOJE_ERROR') ? `**${query}** ${guild.translate('Animes/anitoday:AHOJE_DESC3')}` : jikanError(res.status)}`
          ].join(''))
          .setThumbnail('https://i.imgur.com/sbTZHbT.png')
        return interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      }

      // get total page number
      let pagesNum = Math.ceil(res.data.length / 10);
      if (pagesNum === 0) pagesNum = 1;

      // fetch data to show on pages
      const elapsed = Math.floor(Math.random() * 6000);

      // create pages for pageinator
      const pages = [];
      for (const anime of res.data) {
        const embed = new Embed(bot, guild)
          .setColor(65475)
          .setThumbnail(anime.image_url)
          .setDescription([
            `${anime.score ? `${guild.translate('Animes/anitoday:AHOJE_DESC4')}\u2000${anime.score}\n` : '\u2000'}`,
            `${anime.genres.map(x => `[${x.name}](${x.url})`).join(' • ')}\n\n`,
            `${text.truncate(anime.synopsis?.replace(/\r\n/g, ' ').replace(`(${guild.translate('Animes/proximos-animes:APROX_DESC11')})` || '\u2000'), 300, `${guild.translate('Animes/anitoday:AHOJE_DESC5')}(${anime.url})`)}`
          ].join(''))
          .setAuthor({ name: anime.title, iconURL: null, url: anime.url })
          .setFooter({
            text: [
              `${guild.translate('Animes/anitoday:AHOJE_DESC6')} ${Math.abs(elapsed / 1000).toFixed(2)} ${guild.translate('Animes/anitoday:AHOJE_DESC7')}`,
              `${guild.translate('Animes/anitoday:AHOJE_DESC8')} ${pages.length === null ? 1 : pages.length + 1} ${guild.translate('Animes/anitoday:AHOJE_DESC9')} ${res.data.length}`,
              `${guild.translate('Animes/anitoday:AHOJE_DESC10', { prefix: guild.settings.prefix })} ${guild.translate(`Animes/${this.help.name}:USAGEE`)}`
            ].join('\u2000\u2000•\u2000\u2000'), iconURL: `${member.displayAvatarURL({ format: 'png', dynamic: true })}`
          })
          .addFields([
            { name: `${guild.translate('Animes/anitoday:AHOJE_DESC11')}`, value: anime.type || `${guild.translate('Animes/anitoday:AHOJE_DESC12')}`, inline: true },
            { name: `${guild.translate('Animes/anitoday:AHOJE_DESC13')}`, value: moment(anime.aired.from).format('dddd, do MMMM YYYY'), inline: true },
            { name: `Broadcast`, value: anime.broadcast.string, inline: true },
            { name: `${guild.translate('Animes/anitoday:AHOJE_DESC14')}`, value: anime.source || `${guild.translate('Animes/anitoday:AHOJE_DESC12')}`, inline: true },
            { name: `${guild.translate('Animes/anitoday:AHOJE_DESC15')}`, value: anime.producers.map(x => `[${x.name}](${x.url})`).join(' • ') || `${guild.translate('Animes/anitoday:AHOJE_DESC17')}`, inline: true },
            { name: `${guild.translate('Animes/anitoday:AHOJE_DESC16')}`, value: anime.licensors.join(' • ') || `${guild.translate('Animes/anitoday:AHOJE_DESC17')}`, inline: true },
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
}