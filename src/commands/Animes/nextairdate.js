// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  { fetch } = require('undici'),
  requireText = require('require-text'),
  withQuery = requireText(`${process.cwd()}/assets/graphql/AirDateQuery.graphql`, require),
  withoutQuery = requireText(`${process.cwd()}/assets/graphql/AirDateNoQuery.graphql`, require),
  { duration } = require('moment'),
  Command = require('../../structures/Command.js');
require('moment-duration-format');

module.exports = class Nextairdate extends Command {
  constructor(bot) {
    super(bot, {
      name: 'nextairdate',
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      usage: '<prefix><commandName>',
      aliases: ['nextairing', 'nextair', 'proximos-episodios', 'nextepisode', 'pep', 'proximosep', 'nextep'],
      description: 'Shows the remaining time for the next episode of given anime.',
      examples: [
        'nextairdate',
        'nextair boruto',
        'nextairing black clover',
        'nextep attack on titan',
        'nextepisode tensura'
      ],
      cooldown: 60000,
      slash: true,
      options: [{
        name: 'anime',
        description: 'Search Query',
        type: ApplicationCommandOptionType.String,
        required: false,
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    let search = message.args.join(' ') ?? null;
    const query = search ? withQuery : withoutQuery;
    const variables = search ? { search, status: 'RELEASING' } : {};

    let res = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ query, variables }) }).then(res => res.json()).catch(err => err);

    const embed = new Embed(bot, message.guild)
      .setColor(65475)
      .setThumbnail('https://i.imgur.com/UH1StAo.png')
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

    if (res.errors && res.errors.some(e => e.message !== message.translate('Animes/nextairdate:APEP_DESC'))) {
      embed.setAuthor({ name: message.translate('Animes/nextairdate:APEP_DESC2'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          message.translate('Animes/nextairdate:APEP_DESC3', { member: message.member.displayName }),
          `${res.errors.map(({ message }) => '• ' + message).join('\n')}`,
          message.translate('Animes/nextairdate:APEP_DESC4')
        ].join(''))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    };

    if (res.errors && res.errors.some(e => e.message === message.translate('Animes/nextairdate:APEP_DESC'))) {
      embed.setAuthor({ name: message.translate('Animes/nextairdate:APEP_DESC'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          message.translate('Animes/nextairdate:APEP_DESC5', { member: message.member.displayName }),
          message.translate('Animes/nextairdate:APEP_DESC6')
        ].join(''))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    };

    const [now, next, later] = [res.data.Media || res.data.Page.media].flat().filter(x => x.nextAiringEpisode).sort((A, B) => A.nextAiringEpisode.timeUntilAiring - B.nextAiringEpisode.timeUntilAiring)
    
    if (!now) {
      embed.setAuthor({ name: 'Nada encontrado', iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          message.translate('Animes/nextairdate:APEP_DESC5', { member: message.member.displayName }),
          message.translate('Animes/nextairdate:APEP_DESC6')
        ].join(''))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    } else if (variables.status) {
      embed.setColor(now.coverImage.color)
        .setThumbnail(now.coverImage.large)
        .setTitle(now.title.english || now.title.romaji || now.title.native)
        .setDescription([
          `${now.title.native || '*'} \n`,
          `${now.title.romaji || '*'} \n\n`,
          now.nextAiringEpisode ? [
            `${message.translate('Animes/nextairdate:APEP_DESC7')} **${now.episodes === now.nextAiringEpisode.episode ? `${now.nextAiringEpisode.episode} (${message.translate('Animes/nextairdate:APEP_DESC8')})` : now.nextAiringEpisode.episode}**`,
            `${message.translate('Animes/nextairdate:APEP_DESC9')} [${now.title.english || now.title.romaji || now.title.native}](${now.siteUrl})`,
            `${message.translate('Animes/nextairdate:APEP_DESC10')} **${duration(now.nextAiringEpisode.timeUntilAiring, 'seconds').locale(message.translate('misc:regiao')).humanize()}**\n\n`,
          ].join(' ') : [
            `${message.translate('Animes/nextairdate:APEP_DESC11')} [${now.title.english || now.title.romaji || now.title.native}](${now.siteUrl})`,
            `${message.translate('Animes/nextairdate:APEP_DESC12')}`
          ].join(' '),
          `${now.id}\u2000|\u2000${now.studios.edges.map(x => `[${x.node.name}](${x.node.siteUrl})`).join('\u2000|\u2000')}`
        ].join(''))
      return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
    } else {
      //const d = moment.duration(later.nextAiringEpisode.timeUntilAiring, 'seconds');
      //const days = (d.days() == 1) ? `${d.days()} dia` : `${d.days()} dias`;
      //const hours = (d.hours() == 1) ? `${d.hours()} hora` : `${d.hours()} horas`;
      //const minutes = (d.minutes() == 1) ? `${d.minutes()} minuto` : `${d.minutes()} minutos`;
      //const seconds = (d.seconds() == 1) ? `${d.seconds()} segundo` : `${d.seconds()} segundos`;
      //const date = moment().subtract(d, 'ms').format('lll');
      embed.setColor(now.coverImage.color || next.coverImage.color || later.coverImage.color)
        .setThumbnail(now.coverImage.large)
        .setAuthor({ name: `${message.translate('Animes/nextairdate:APEP_DESC13')}\u2000|\u2000${now.title.english || now.title.romaji || now.title.native}.`, iconURL: null, url: now.siteUrl })
        .setDescription([
          [
            `[**${now.title.english || now.title.romaji || now.title.native}**](${now.siteUrl})`,
            `\u2000\u2000*${now.title.english ? now.title.romaji : now.title.native}*`,
            `\u2000\u2000*${now.title.romaji ? now.title.native : '~'}*`
          ].join('\n'),
          now.nextAiringEpisode.timeUntilAiring ? [
            `${message.translate('Animes/nextairdate:APEP_DESC7')} **${now.episodes === now.nextAiringEpisode.episode ? `${now.nextAiringEpisode.episode} (${message.translate('Animes/nextairdate:APEP_DESC8')})` : now.nextAiringEpisode.episode}**`,
            `${message.translate('Animes/nextairdate:APEP_DESC14')} **${duration(now.nextAiringEpisode.timeUntilAiring, 'seconds').locale(message.translate('misc:regiao')).humanize()}**.\n\u200b`
          ].join(' ') : message.translate('Animes/nextairdate:APEP_DESC15')
        ].join('\n'))
        .addFields([
          {
            name: message.translate('Animes/nextairdate:APEP_DESC16'),
            value: next ? [
              [
                `[**${next.title.english || next.title.romaji || next.title.native}**](${next.siteUrl})`,
                `\u2000\u2000*${next.title.english ? next.title.romaji : next.title.native}*`,
                `\u2000\u2000*${next.title.romaji ? next.title.native : '~'}*`
              ].join('\n'),
              next.nextAiringEpisode.timeUntilAiring ? [
                `${message.translate('Animes/nextairdate:APEP_DESC7')} **${next.episodes === next.nextAiringEpisode.episode ? `${next.nextAiringEpisode.episode} (${message.translate('Animes/nextairdate:APEP_DESC8')})` : next.nextAiringEpisode.episode}**`,
                `${message.translate('Animes/nextairdate:APEP_DESC14')} **${duration(next.nextAiringEpisode.timeUntilAiring, 'seconds').locale(message.translate('misc:regiao')).humanize()}**.\n\u200b`
              ].join(' ') : message.translate('Animes/nextairdate:APEP_DESC15')
            ].join('\n') : message.translate('Animes/nextairdate:APEP_DESC17')
          }, {
            name: message.translate('Animes/nextairdate:APEP_DESC16'),
            value: later ? [
              [
                `[**${later.title.english || later.title.romaji || later.title.native}**](${later.siteUrl})`,
                `\u2000\u2000*${later.title.english ? later.title.romaji : later.title.native}*`,
                `\u2000\u2000*${later.title.romaji ? later.title.native : '~'}*`
              ].join('\n'),
              later.nextAiringEpisode.timeUntilAiring ? [
                `${message.translate('Animes/nextairdate:APEP_DESC7')} **${later.episodes === later.nextAiringEpisode.episode ? `${later.nextAiringEpisode.episode} (${message.translate('Animes/nextairdate:APEP_DESC8')})` : later.nextAiringEpisode.episode}**`,
                `${message.translate('Animes/nextairdate:APEP_DESC14')} **${duration(later.nextAiringEpisode.timeUntilAiring, 'seconds').locale(message.translate('misc:regiao')).humanize()}**.\n\u200b` //**${days}, ${hours}, ${minutes}, e ${seconds}**.`
              ].join(' ') : message.translate('Animes/nextairdate:APEP_DESC15')
            ].join('\n') : message.translate('Animes/nextairdate:APEP_DESC17')
          }
        ])
      return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
    };
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const channel = guild.channels.cache.get(interaction.channelId);

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      let search = args.get('anime')?.value ?? null;
      const query = search ? withQuery : withoutQuery;
      const variables = search ? { search, status: 'RELEASING' } : {};

      let res = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ query, variables }) }).then(res => res.json()).catch(err => err);

      const embed = new Embed(bot, guild)
        .setColor(65475)
        .setThumbnail('https://i.imgur.com/UH1StAo.png')
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

      if (res.errors && res.errors.some(e => e.message !== guild.translate('Animes/nextairdate:APEP_DESC'))) {
        embed.setAuthor({ name: guild.translate('Animes/nextairdate:APEP_DESC2'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
          .setDescription([
            guild.translate('Animes/nextairdate:APEP_DESC3', { member: member.displayName }),
            `${res.errors.map(({ message }) => '• ' + message).join('\n')}`,
            guild.translate('Animes/nextairdate:APEP_DESC4')
          ].join(''))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      };

      if (res.errors && res.errors.some(e => e.message === guild.translate('Animes/nextairdate:APEP_DESC'))) {
        embed.setAuthor({ name: guild.translate('Animes/nextairdate:APEP_DESC'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
          .setDescription([
            guild.translate('Animes/nextairdate:APEP_DESC5', { member: member.displayName }),
            guild.translate('Animes/nextairdate:APEP_DESC6')
          ].join(''))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      };

      const [now, next, later] = [res.data.Media || res.data.Page.media].flat().filter(x => x.nextAiringEpisode).sort((A, B) => A.nextAiringEpisode.timeUntilAiring - B.nextAiringEpisode.timeUntilAiring)

      if (!now) {
        embed.setAuthor({ name: 'Nada encontrado', iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
          .setDescription([
            message.translate('Animes/nextairdate:APEP_DESC5', { member: member.displayName }),
            message.translate('Animes/nextairdate:APEP_DESC6')
          ].join(''))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      } else if (variables.status) {
        embed.setColor(now.coverImage.color)
          .setThumbnail(now.coverImage.large)
          .setTitle(now.title.english || now.title.romaji || now.title.native)
          .setDescription([
            `${now.title.native || '*'} \n`,
            `${now.title.romaji || '*'} \n\n`,
            now.nextAiringEpisode ? [
              `${guild.translate('Animes/nextairdate:APEP_DESC7')} **${now.episodes === now.nextAiringEpisode.episode ? `${now.nextAiringEpisode.episode} (${guild.translate('Animes/nextairdate:APEP_DESC8')})` : now.nextAiringEpisode.episode}**`,
              `${guild.translate('Animes/nextairdate:APEP_DESC9')} [${now.title.english || now.title.romaji || now.title.native}](${now.siteUrl})`,
              `${guild.translate('Animes/nextairdate:APEP_DESC10')} **${duration(now.nextAiringEpisode.timeUntilAiring, 'seconds').locale(guild.translate('misc:regiao')).humanize()}**\n\n`,
            ].join(' ') : [
              `${guild.translate('Animes/nextairdate:APEP_DESC11')} [${now.title.english || now.title.romaji || now.title.native}](${now.siteUrl})`,
              `${guild.translate('Animes/nextairdate:APEP_DESC12')}`
            ].join(' '),
            `${now.id}\u2000|\u2000${now.studios.edges.map(x => `[${x.node.name}](${x.node.siteUrl})`).join('\u2000|\u2000')}`
          ].join(''))
        return interaction.editReply({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
      } else {
        //const d = moment.duration(later.nextAiringEpisode.timeUntilAiring, 'seconds');
        //const days = (d.days() == 1) ? `${d.days()} dia` : `${d.days()} dias`;
        //const hours = (d.hours() == 1) ? `${d.hours()} hora` : `${d.hours()} horas`;
        //const minutes = (d.minutes() == 1) ? `${d.minutes()} minuto` : `${d.minutes()} minutos`;
        //const seconds = (d.seconds() == 1) ? `${d.seconds()} segundo` : `${d.seconds()} segundos`;
        //const date = moment().subtract(d, 'ms').format('lll');
        embed.setColor(now.coverImage.color || next.coverImage.color || later.coverImage.color)
          .setThumbnail(now.coverImage.large)
          .setAuthor({ name: `${guild.translate('Animes/nextairdate:APEP_DESC13')}\u2000|\u2000${now.title.english || now.title.romaji || now.title.native}.`, iconURL: null, url: now.siteUrl })
          .setDescription([
            [
              `[**${now.title.english || now.title.romaji || now.title.native}**](${now.siteUrl})`,
              `\u2000\u2000*${now.title.english ? now.title.romaji : now.title.native}*`,
              `\u2000\u2000*${now.title.romaji ? now.title.native : '~'}*`
            ].join('\n'),
            now.nextAiringEpisode.timeUntilAiring ? [
              `${guild.translate('Animes/nextairdate:APEP_DESC7')} **${now.episodes === now.nextAiringEpisode.episode ? `${now.nextAiringEpisode.episode} (${guild.translate('Animes/nextairdate:APEP_DESC8')})` : now.nextAiringEpisode.episode}**`,
              `${guild.translate('Animes/nextairdate:APEP_DESC14')} **${duration(now.nextAiringEpisode.timeUntilAiring, 'seconds').locale(guild.translate('misc:regiao')).humanize()}**.\n\u200b`
            ].join(' ') : guild.guild.translate('Animes/nextairdate:APEP_DESC15')
          ].join('\n'))
          .addFields([
            {
              name: guild.translate('Animes/nextairdate:APEP_DESC16'),
              value: next ? [
                [
                  `[**${next.title.english || next.title.romaji || next.title.native}**](${next.siteUrl})`,
                  `\u2000\u2000*${next.title.english ? next.title.romaji : next.title.native}*`,
                  `\u2000\u2000*${next.title.romaji ? next.title.native : '~'}*`
                ].join('\n'),
                next.nextAiringEpisode.timeUntilAiring ? [
                  `${guild.translate('Animes/nextairdate:APEP_DESC7')} **${next.episodes === next.nextAiringEpisode.episode ? `${next.nextAiringEpisode.episode} (${guild.translate('Animes/nextairdate:APEP_DESC8')})` : next.nextAiringEpisode.episode}**`,
                  `${guild.translate('Animes/nextairdate:APEP_DESC14')} **${duration(next.nextAiringEpisode.timeUntilAiring, 'seconds').locale(guild.translate('misc:regiao')).humanize()}**.\n\u200b`
                ].join(' ') : guild.translate('Animes/nextairdate:APEP_DESC15')
              ].join('\n') : guild.translate('Animes/nextairdate:APEP_DESC17')
            }, {
              name: guild.translate('Animes/nextairdate:APEP_DESC16'),
              value: later ? [
                [
                  `[**${later.title.english || later.title.romaji || later.title.native}**](${later.siteUrl})`,
                  `\u2000\u2000*${later.title.english ? later.title.romaji : later.title.native}*`,
                  `\u2000\u2000*${later.title.romaji ? later.title.native : '~'}*`
                ].join('\n'),
                later.nextAiringEpisode.timeUntilAiring ? [
                  `${guild.translate('Animes/nextairdate:APEP_DESC7')} **${later.episodes === later.nextAiringEpisode.episode ? `${later.nextAiringEpisode.episode} (${guild.translate('Animes/nextairdate:APEP_DESC8')})` : later.nextAiringEpisode.episode}**`,
                  `${guild.translate('Animes/nextairdate:APEP_DESC14')} **${duration(later.nextAiringEpisode.timeUntilAiring, 'seconds').locale(guild.translate('misc:regiao')).humanize()}**.\n\u200b` //**${days}, ${hours}, ${minutes}, e ${seconds}**.`
                ].join(' ') : guild.translate('Animes/nextairdate:APEP_DESC15')
              ].join('\n') : guild.translate('Animes/nextairdate:APEP_DESC17')
            }
          ])
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 90000 }) } });
      }
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};