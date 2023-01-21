// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  { fetch } = require('undici'),
  { convert: toMarkdown } = require('html-to-markdown'),
  { decode } = require('he'),
  { mediaFormat, months } = require('../../utils/constants'),
  text = require('../../utils/string'),
  animeDB = require(`${process.cwd()}/assets/json/anime.json`),
  Command = require('../../structures/Command.js');

module.exports = class Anirandom extends Command {
  constructor(bot) {
    super(bot, {
      name: 'anirandom',
      aliases: ['anirand', 'anirecommend', 'reanime', 'animere', 'anime-recomendado', 'anirec', 'anirecomendado', 'a-recomendado', 'anime-re'],
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      usage: '<prefix><commandName>',
      description: 'Generate a random anime recommendation. Recommends a Hentai if used on a nsfw channel.',
      examples: ['/anirandom', '.anirec', '!anirecomendado', '?reanime'],
      cooldown: 15000,
      slash: true,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const db = animeDB.filter(a => message.channel.nsfw === a.isAdult);
    const { ids: { al: id } } = db[Math.floor(Math.random() * db.length)];

    const query = `query ($id: Int) { Media(id: $id){ siteUrl id idMal synonyms isAdult format startDate { year month day } episodes duration genres studios(isMain:true){ nodes{ name siteUrl } } coverImage{ large color } description title { romaji english native userPreferred } } }`;
    const variables = { id };

    const { errors, data } = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ query, variables }) }).then(res => res.json()).catch(err => err);

    const embed = new Embed(bot, message.guild).setColor(65475)
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

    // Avisa se obter ratelimit pela api
    if (errors && errors.some(x => x.status === 429)) {

      embed
        .setAuthor({ name: message.translate('Animes/anirandom:ARECO_AUTHOR'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          `${message.translate('Animes/anirandom:ARECO_DESC')} ${message.member.displayName}**. ${message.translate('Animes/anirandom:ARECO_DESC1')}\n\n`,
          `${message.translate('Animes/anirandom:ARECO_DESC2')} ${settings.prefix}bug.`
        ].join(''))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    };

    // Avisa se obter error pela validação
    if (errors && errors.some(x => x.status === 400)) {

      embed
        .setAuthor({ name: message.translate('Animes/anirandom:ARECO_AUTHOR1'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          message.translate('Animes/anirandom:ARECO_DESC3', { member: message.member.displayName }),
          message.translate('Animes/anirandom:ARECO_DESC5', { prefix: settings.prefix })
        ].join(''))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    };

    // Avisa se obter error devido a outra coisa
    if (errors) {
      embed
        .setAuthor({ name: message.translate('Animes/anirandom:ARECO_AUTHOR1'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription([
          message.translate('Animes/anirandom:ARECO_DESC3', { member: message.member.displayName }),
          message.translate('Animes/anirandom:ARECO_DESC4'),
          message.translate('Animes/anirandom:ARECO_DESC5', { prefix: settings.prefix })
        ].join(''))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    };

    embed
      .setColor(data.Media.coverImage.color || 65475)
      .setAuthor({
        name: [
          text.truncate(data.Media.title.romaji || data.Media.title.english || data.Media.title.native),
          mediaFormat[data.Media.format]
        ].join('\u2000|\u2000'), iconURL: data.Media.siteUrl
      })
      .setDescription(data.Media.studios.nodes?.map(x => `[${x.name}](${x.url})`).join('\u2000|\u2000') || '\u2000')
      .addFields([
        {
          name: `${message.translate('Animes/anirandom:ARECO_DESC6')}`,
          value: [
            `•\u2000${message.translate('Animes/anirandom:ARECO_DESC7')}:\u2000${data.Media.title.native || `${message.translate('Animes/anirandom:ARECO_DESC10')}`}.`,
            `•\u2000${message.translate('Animes/anirandom:ARECO_DESC8')}:\u2000${data.Media.title.romaji || `${message.translate('Animes/anirandom:ARECO_DESC10')}`}.`,
            `•\u2000${message.translate('Animes/anirandom:ARECO_DESC9')}:\u2000${data.Media.title.english || `${message.translate('Animes/anirandom:ARECO_DESC10')}`}.`
          ].join('\n')
        }, {
          name: `${message.translate('Animes/anirandom:ARECO_DESC11')}`,
          value: `${text.joinArray(data.Media.genres) || '\u200b'}`
        }, {
          name: `${message.translate('Animes/anirandom:ARECO_DESC12')}`,
          value: [
            `${months[data.Media.startDate.month] || 0}`,
            `${data.Media.startDate.day || ''}`,
            `${data.Media.startDate.year || ''}`
          ].filter(Boolean).join(' ') || `${message.translate('Animes/anirandom:ARECO_DESC13')}`,
          inline: true
        }, {
          name: `${message.translate('Animes/anirandom:ARECO_DESC14')}`,
          value: `${data.Media.episodes || `${message.translate('Animes/anirandom:ARECO_DESC15')}`}`,
          inline: true
        }, {
          name: `${message.translate('Animes/anirandom:ARECO_DESC16')}`,
          value: `${data.Media.duration || `${message.translate('Animes/anirandom:ARECO_DESC17')}`}`,
          inline: true
        }, {
          name: '\u200b',
          value: `${text.truncate(toMarkdown(decode((data.Media.description || '').replace(/<br>/g, ''))), 1000, ` ${message.translate('Animes/anirandom:ARECO_DESC17')}(https://myanimelist.net/anime/${data.Media.idMal})`) || '\u200b'}`
        }
      ]).setThumbnail(data.Media.coverImage.large)
    return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
    const channel = guild.channels.cache.get(interaction.channelId);

    const db = animeDB.filter(a => channel.nsfw === a.isAdult);
    const { ids: { al: id } } = db[Math.floor(Math.random() * db.length)];

    const query = `query ($id: Int) { Media(id: $id){ siteUrl id idMal synonyms isAdult format startDate { year month day } episodes duration genres studios(isMain:true){ nodes{ name siteUrl } } coverImage{ large color } description title { romaji english native userPreferred } } }`;
    const variables = { id };

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      const { errors, data } = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ query, variables }) }).then(res => res.json()).catch(err => err);

      const embed = new Embed(bot, guild)
        .setColor(65475)
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

      // Avisa se obter ratelimit pela api
      if (errors && errors.some(x => x.status === 429)) {

        embed
          .setAuthor({ name: guild.translate('Animes/anirandom:ARECO_AUTHOR'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
          .setDescription([
            `${guild.translate('Animes/anirandom:ARECO_DESC')} ${member.displayName}**. ${guild.translate('Animes/anirandom:ARECO_DESC1')}\n\n`,
            `${guild.translate('Animes/anirandom:ARECO_DESC2')} ${guild.settings.prefix}bug.`
          ].join(''))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      };

      // Avisa se obter error pela validação
      if (errors && errors.some(x => x.status === 400)) {

        embed
          .setAuthor({ name: guild.translate('Animes/anirandom:ARECO_AUTHOR1'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
          .setDescription([
            guild.translate('Animes/anirandom:ARECO_DESC3', { member: member.displayName }),
            guild.translate('Animes/anirandom:ARECO_DESC5', { prefix: guild.settings.prefix })
          ].join(''))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      };

      // Avisa se obter error devido a outra coisa
      if (errors) {
        embed
          .setAuthor({ name: guild.translate('Animes/anirandom:ARECO_AUTHOR1'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
          .setDescription([
            guild.translate('Animes/anirandom:ARECO_DESC3', { member: member.displayName }),
            guild.translate('Animes/anirandom:ARECO_DESC4'),
            guild.translate('Animes/anirandom:ARECO_DESC5', { prefix: guild.settings.prefix })
          ].join(''))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      };

      embed
        .setColor(data.Media.coverImage.color || 65475)
        .setAuthor({
          name: [
            text.truncate(data.Media.title.romaji || data.Media.title.english || data.Media.title.native),
            mediaFormat[data.Media.format]
          ].join('\u2000|\u2000'), iconURL: data.Media.siteUrl
        })
        .setDescription(data.Media.studios.nodes?.map(x => `[${x.name}](${x.url})`).join('\u2000|\u2000') || '\u2000')
        .addFields([
          {
            name: `${guild.translate('Animes/anirandom:ARECO_DESC6')}`,
            value: [
              `•\u2000${guild.translate('Animes/anirandom:ARECO_DESC7')}:\u2000${data.Media.title.native || `${guild.translate('Animes/anirandom:ARECO_DESC10')}`}.`,
              `•\u2000${guild.translate('Animes/anirandom:ARECO_DESC8')}:\u2000${data.Media.title.romaji || `${guild.translate('Animes/anirandom:ARECO_DESC10')}`}.`,
              `•\u2000${guild.translate('Animes/anirandom:ARECO_DESC9')}:\u2000${data.Media.title.english || `${guild.translate('Animes/anirandom:ARECO_DESC10')}`}.`
            ].join('\n')
          }, {
            name: `${guild.translate('Animes/anirandom:ARECO_DESC11')}`,
            value: `${text.joinArray(data.Media.genres) || '\u200b'}`
          }, {
            name: `${guild.translate('Animes/anirandom:ARECO_DESC12')}`,
            value: [
              `${months[data.Media.startDate.month] || 0}`,
              `${data.Media.startDate.day || ''}`,
              `${data.Media.startDate.year || ''}`
            ].filter(Boolean).join(' ') || `${guild.translate('Animes/anirandom:ARECO_DESC13')}`,
            inline: true
          }, {
            name: `${guild.translate('Animes/anirandom:ARECO_DESC14')}`,
            value: `${data.Media.episodes || `${guild.translate('Animes/anirandom:ARECO_DESC15')}`}`,
            inline: true
          }, {
            name: `${guild.translate('Animes/anirandom:ARECO_DESC16')}`,
            value: `${data.Media.duration || `${guild.translate('Animes/anirandom:ARECO_DESC17')}`}`,
            inline: true
          }, {
            name: '\u200b',
            value: `${text.truncate(toMarkdown(decode((data.Media.description || '').replace(/<br>/g, ''))), 1000, ` ${guild.translate('Animes/anirandom:ARECO_DESC17')}(https://myanimelist.net/anime/${data.Media.idMal})`) || '\u200b'}`
          }
        ]).setThumbnail(data.Media.coverImage.large)
      return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};
