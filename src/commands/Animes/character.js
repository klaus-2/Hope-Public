// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  _ = require('lodash'),
  { fetch } = require('undici'),
  text = require('../../utils/string'),
  badge = '<:MyAnimeList:827773575112425472> [MyAnimeList](https://myanimelist.net \'Site\')',
  Command = require('../../structures/Command.js');

module.exports = class Character extends Command {
  constructor(bot) {
    super(bot, {
      name: 'character',
      dirname: __dirname,
      aliases: ['anichar', 'char', 'c', 'personagem'],
      description: 'Searches for a character in MyAnimeList.net',
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      usage: '<prefix><commandName> <query>',
      cooldown: 30000,
      examples: [
        'character',
        'anichar Alucard',
        'anichar Saitama',
        'char Son Goku',
        'c Naruto'
      ],
      slash: true,
      options: [{
        name: 'character',
        description: 'Search Query',
        type: ApplicationCommandOptionType.String,
        required: true,
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const query = message.args.join(' ') || 'Pain';

    const embed = new Embed(bot, message.guild)
      .setColor(65475)
      .setDescription(message.translate('Animes/character:APERSO_DESC', { query: query }))
      .setThumbnail('https://i.imgur.com/UH1StAo.png')
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

    const msg = await message.channel.send({ embeds: [embed] });

    const character = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURI(query)}&order_by=favorites&sort=desc&page=1`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

    const errstatus = {
      "404": message.translate('Animes/character:APERSO_DESC1', { query: query }),
      "429": message.translate('Animes/character:APERSO_DESC2', { badge: badge }),
      "500": message.translate('Animes/character:APERSO_DESC3', { badge: badge }),
      "503": message.translate('Animes/character:APERSO_DESC3', { badge: badge }),
    }

    embed.setColor(65475)
      .setAuthor({ name: character.status == 404 ? message.translate('Animes/character:APERSO_DESC4') : message.translate('Animes/character:APERSO_DESC5'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
      .setDescription(`**${message.member.displayName}**, ${errstatus[character.status] || `${badge} ${message.translate('Animes/character:APERSO_DESC6')} ${character.status}`}`)
      .setThumbnail('https://i.imgur.com/UH1StAo.png');

    if (!character.data || character.data.error) {
      return await msg.edit({ embeds: [embed] }).catch(() => null) || message.channel.send({ embeds: [embed] });
    };

    const { mal_id } = character.data[0];

    let res = await fetch(`https://api.jikan.moe/v4/characters/${mal_id}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
    if (!res.data || res.data.error) {
      embed.setDescription(`**${message.member.displayName}**, ${errstatus[character.data.status] || `${badge} ${message.translate('Animes/character:APERSO_DESC6')} ${character.data.status}`}`);
      return await msg.edit({ embeds: [embed] }).catch(() => { }) || message.channel.send({ embeds: [embed] });
    };

    const wait = require('node:timers/promises').setTimeout;
    const getCharacterAnime = await fetch(`https://api.jikan.moe/v4/characters/${mal_id}/anime`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
    await wait(2000);
    const getCharacterManga = await fetch(`https://api.jikan.moe/v4/characters/${mal_id}/manga`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
    await wait(2000);
    const getCharacterVoiceActors = await fetch(`https://api.jikan.moe/v4/characters/${mal_id}/voices`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);


    const anime = [];
    for (const x of getCharacterAnime.data) {
      const url = x.anime.url.split('/').slice(0, 5).join('/');
      const data = '[' + x.anime.title + '](' + url + ') (' + x.role + ')';
      anime.push(data);
    }

    const manga = [];
    for (const x of getCharacterManga.data) {
      const url = x.manga.url.split('/').slice(0, 5).join('/');
      const data = '[' + x.manga.title + '](' + url + ') (' + x.role + ')';
      manga.push(data);
    }

    let m = text.joinArrayAndLimit(manga, 1000, ' • ');
    let a = text.joinArrayAndLimit(anime, 1000, ' • ');

    const mediastore = { anime: a, manga: m };

    embed.setAuthor({ name: `${res.data.name} ${res.data.name_kanji ? `• ${res.data.name_kanji}` : ''}`, iconURL: res.data.images.webp.small_image_url, url: res.data.url })
      .setThumbnail(res.data.images.webp.image_url)
      .setColor(65475)
      .setDescription(text.truncate(res.data.about.replace(/\\n/g, ''), 500, `... [${message.translate('Animes/character:APERSO_DESC7')}](${res.data.url})`))
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
      .addFields([
        ...['Anime', 'Manga'].map(media => {
          const store = mediastore[media.toLowerCase()];
          return {
            name: `${media} Appearances`,
            value: `${store?.text || 'None'} ${store.excess ? `\n...and ${store.excess} more!` : ''}`
          };
        }),
        ..._.chunk(getCharacterVoiceActors.data, 3).slice(0, 3).map((va_arr, index) => {
          return {
            inline: true,
            name: index === 0 ? `Seiyuu (${getCharacterVoiceActors.data.length})` : '\u200b',
            value: va_arr.map((va, i) => {
              const flag = [{ lang: 'Japanese', flag: '🇯🇵' }, { lang: 'French', flag: '🇫🇷' }, { lang: 'Russian', flag: '🇷🇺' }, { lang: 'German', flag: '🇩🇪' }, { lang: 'English', flag: '🇺🇸' }, { lang: 'Italian', flag: '🇮🇹' }, { lang: 'Spanish', flag: '🇪🇸' }, { lang: 'Korean', flag: '🇰🇷' }, { lang: 'Chinese', flag: '🇨🇳' }, { lang: 'Brazilian', flag: '🇧🇷' }]
                .find(m => m.lang === va.language)?.flag;
              if (index === 2 && i === 2) {
                return `...${message.translate('Animes/character:APERSO_DESC10')} ${getCharacterVoiceActors.data.length - 8} ${message.translate('Animes/character:APERSO_DESC11')}`;
              } else {
                return `${flag || va.language} [${va.person.name}](${va.url})`;
              };
            }).join('\n') || '\u200b'
          };
        })
      ]);

    return await msg.edit({ embeds: [embed] }).catch(() => null) || message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const channel = guild.channels.cache.get(interaction.channelId);
    const query = args.get('character')?.value;

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      const embed = new Embed(bot, guild)
        .setColor(65475)
        .setDescription(guild.translate('Animes/character:APERSO_DESC', { query: query }))
        .setThumbnail('https://i.imgur.com/UH1StAo.png')
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

      const msg = await interaction.editReply({ embeds: [embed] });

      const character = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURI(query)}&order_by=favorites&sort=desc&page=1`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      const errstatus = {
        "404": guild.translate('Animes/character:APERSO_DESC1', { query: query }),
        "429": guild.translate('Animes/character:APERSO_DESC2', { badge: badge }),
        "500": guild.translate('Animes/character:APERSO_DESC3', { badge: badge }),
        "503": guild.translate('Animes/character:APERSO_DESC3', { badge: badge }),
      }

      embed.setColor(65475)
        .setAuthor({ name: character.status == 404 ? guild.translate('Animes/character:APERSO_DESC4') : guild.translate('Animes/character:APERSO_DESC5'), iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
        .setDescription(`**${member.displayName}**, ${errstatus[character.status] || `${badge} ${guild.translate('Animes/character:APERSO_DESC6')} ${character.status}`}`)
        .setThumbnail('https://i.imgur.com/UH1StAo.png');

      if (!character.data || character.data.error) {
        return await interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      };

      const { mal_id } = character.data[0];

      let res = await fetch(`https://api.jikan.moe/v4/characters/${mal_id}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
      if (!res.data || res.data.error) {
        embed.setDescription(`**${member.displayName}**, ${errstatus[character.data.status] || `${badge} ${guild.translate('Animes/character:APERSO_DESC6')} ${character.data.status}`}`);
        return await interaction.editReply({ embeds: [embed] });
      };

      const wait = require('node:timers/promises').setTimeout;
      const getCharacterAnime = await fetch(`https://api.jikan.moe/v4/characters/${mal_id}/anime`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
      await wait(2000);
      const getCharacterManga = await fetch(`https://api.jikan.moe/v4/characters/${mal_id}/manga`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
      await wait(2000);
      const getCharacterVoiceActors = await fetch(`https://api.jikan.moe/v4/characters/${mal_id}/voices`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);


      const anime = [];
      for (const x of getCharacterAnime.data) {
        const url = x.anime.url.split('/').slice(0, 5).join('/');
        const data = '[' + x.anime.title + '](' + url + ') (' + x.role + ')';
        anime.push(data);
      }

      const manga = [];
      for (const x of getCharacterManga.data) {
        const url = x.manga.url.split('/').slice(0, 5).join('/');
        const data = '[' + x.manga.title + '](' + url + ') (' + x.role + ')';
        manga.push(data);
      }

      let m = text.joinArrayAndLimit(manga, 1000, ' • ');
      let a = text.joinArrayAndLimit(anime, 1000, ' • ');

      const mediastore = { anime: a, manga: m };

      embed.setAuthor({ name: `${res.data.name} ${res.data.name_kanji ? `• ${res.data.name_kanji}` : ''}`, iconURL: res.data.images.webp.small_image_url, url: res.data.url })
        .setThumbnail(res.data.images.webp.image_url)
        .setColor(65475)
        .setDescription(text.truncate(res.data.about.replace(/\\n/g, ''), 500, `... [${guild.translate('Animes/character:APERSO_DESC7')}](${res.data.url})`))
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
        .addFields([
          ...['Anime', 'Manga'].map(media => {
            const store = mediastore[media.toLowerCase()];
            return {
              name: `${media} Appearances`,
              value: `${store?.text || 'None'} ${store.excess ? `\n...and ${store.excess} more!` : ''}`
            };
          }),
          ..._.chunk(getCharacterVoiceActors.data, 3).slice(0, 3).map((va_arr, index) => {
            return {
              inline: true,
              name: index === 0 ? `Seiyuu (${getCharacterVoiceActors.data.length})` : '\u200b',
              value: va_arr.map((va, i) => {
                const flag = [{ lang: 'Japanese', flag: '🇯🇵' }, { lang: 'French', flag: '🇫🇷' }, { lang: 'Russian', flag: '🇷🇺' }, { lang: 'German', flag: '🇩🇪' }, { lang: 'English', flag: '🇺🇸' }, { lang: 'Italian', flag: '🇮🇹' }, { lang: 'Spanish', flag: '🇪🇸' }, { lang: 'Korean', flag: '🇰🇷' }, { lang: 'Chinese', flag: '🇨🇳' }, { lang: 'Brazilian', flag: '🇧🇷' }]
                  .find(m => m.lang === va.language)?.flag;
                if (index === 2 && i === 2) {
                  return `...${guild.translate('Animes/character:APERSO_DESC10')} ${getCharacterVoiceActors.data.length - 8} ${guild.translate('Animes/character:APERSO_DESC11')}`;
                } else {
                  return `${flag || va.language} [${va.person.name}](${va.url})`;
                };
              }).join('\n') || '\u200b'
            };
          })
        ]);

      return await interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};