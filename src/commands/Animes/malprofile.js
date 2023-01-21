// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  { fetch } = require('undici'),
  moment = require('moment'),
  text = require('../../utils/string'),
  Command = require('../../structures/Command.js');

module.exports = class Malprofile extends Command {
  constructor(bot) {
    super(bot, {
      name: 'malprofile',
      guildOnly: true,
      aliases: ['mal-of', 'malof', 'malstat', 'maluser', 'mal-perfil'],
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.UseExternalEmojis, Flags.AddReactions],
      usage: '<prefix><commandName> <username>',
      description: 'Finds user profile on myanimelist based on the provided query.',
      cooldown: 10000,
      examples: [
        '/malprofile Klaus',
        '.mal-of Hope',
        '!malof Klaus',
        '?malstat Hope',
        '$maluser Faith'
      ],
      slash: true,
      options: [{
        name: 'username',
        description: 'Myanimelist Username',
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

    const profile = await fetch(`https://api.jikan.moe/v4/users/${encodeURI(query)}/full`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
    const favorites = await fetch(`https://api.jikan.moe/v4/users/${encodeURI(query)}/favorites`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

    if (!profile) {
      let err;
      if (profile && profile.data.status >= 500) {
        err = message.translate('Animes/malprofile:AMAL_DESC')
      } else if (response && profile.data.status >= 400) {
        err = message.translate('Animes/malprofile:AMAL_DESC1')
      } else {
        err = message.translate('Animes/malprofile:AMAL_DESC2', { query: query })
      };
      return message.channel.send(err).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    };

    const fav_anime = text.joinArrayAndLimit(favorites.data.anime.map((entry) => {
      return `[${entry.title}](${entry.url.split('/').splice(0, 5).join('/')})`;
    }), 1000, ' • ');
    const fav_manga = text.joinArrayAndLimit(favorites.data.manga.map((entry) => {
      return `[${entry.title}](${entry.url.split('/').splice(0, 5).join('/')})`;
    }), 1000, ' • ');
    const fav_characters = text.joinArrayAndLimit(favorites.data.characters.map((entry) => {
      return `[${entry.name}](${entry.url.split('/').splice(0, 5).join('/')})`;
    }), 1000, ' • ');
    const fav_people = text.joinArrayAndLimit(favorites.data.people.map((entry) => {
      return `[${entry.name}](${entry.url.split('/').splice(0, 5).join('/')})`;
    }), 1000, ' • ');

    const embed = new Embed(bot, message.guild)
      .setColor(65475)
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
      .setAuthor({ name: `${profile.data.username}' ${message.translate('Animes/malprofile:AMAL_DESC3')}`, iconURL: profile.data.images.webp.image_url, url: profile.data.url })
      .setDescription([
        text.truncate((profile.data.about || '').replace(/(<([^>]+)>)/ig, ''), 350, `...[${message.translate('Animes/malprofile:AMAL_DESC4')}](${profile.data.url})`),
        `• **${message.translate('Animes/malprofile:AMAL_DESC5')}**:\u2000\u2000${profile.data.gender || 'Unspecified'}`,
        `• **${message.translate('Animes/malprofile:AMAL_DESC6')}**\u2000\u2000${profile.data.location || 'Unspecified'}`,
        `• **${message.translate('Animes/malprofile:AMAL_DESC7')}**\u2000\u2000${moment(profile.data.joined).format('dddd, do MMMM YYYY')}, *${moment(profile.data.joined).fromNow()}*`,
        `• **${message.translate('Animes/malprofile:AMAL_DESC8')}**\u2000\u2000${moment(profile.data.last_online).format('dddd, do MMMM YYYY')}, *${moment(profile.data.last_online).fromNow()}*`
      ].join('\n'))
      .addFields([
        {
          name: `${message.translate('Animes/malprofile:AMAL_DESC9')}`, inline: true,
          value: '```fix\n' + Object.entries(profile.data.statistics.anime).map(([key, value]) => {
            const cwidth = 28;
            const name = key.split('_').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
            const spacing = ' '.repeat(cwidth - (3 + name.length + String(value).length));

            return ' • ' + name + ':' + spacing + value;
          }).join('\n') + '```'
        }, {
          name: `${message.translate('Animes/malprofile:AMAL_DESC10')}`, inline: true,
          value: '```fix\n' + Object.entries(profile.data.statistics.manga).splice(0, 10).map(([key, value]) => {
            const cwidth = 28;
            const name = key.split('_').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
            const spacing = ' '.repeat(cwidth - (3 + name.length + String(value).length));

            return ' • ' + name + ':' + spacing + value;
          }).join('\n') + '```'
        }, {
          name: `${message.translate('Animes/malprofile:AMAL_DESC11')}`,
          value: fav_anime.text + (!!fav_anime.excess ? ` ${message.translate('Animes/malprofile:AMAL_DESC12')} ${fav_anime.excess} ${message.translate('Animes/malprofile:AMAL_DESC13')}` : '') || `${message.translate('Animes/malprofile:AMAL_DESC14')}`
        }, {
          name: `${message.translate('Animes/malprofile:AMAL_DESC15')}`,
          value: fav_manga.text + (!!fav_manga.excess ? ` ${message.translate('Animes/malprofile:AMAL_DESC12')} ${fav_manga.excess} ${message.translate('Animes/malprofile:AMAL_DESC13')}` : '') || `${message.translate('Animes/malprofile:AMAL_DESC14')}`
        }, {
          name: `${message.translate('Animes/malprofile:AMAL_DESC16')}`,
          value: fav_characters.text + (!!fav_characters.excess ? ` ${message.translate('Animes/malprofile:AMAL_DESC12')} ${fav_characters.excess} ${message.translate('Animes/malprofile:AMAL_DESC13')}` : '') || `${message.translate('Animes/malprofile:AMAL_DESC14')}`
        }, {
          name: `${message.translate('Animes/malprofile:AMAL_DESC17')}`,
          value: fav_people.text + (!!fav_people.excess ? ` ${message.translate('Animes/malprofile:AMAL_DESC12')} ${fav_people.excess} ${message.translate('Animes/malprofile:AMAL_DESC13')}` : '') || `${message.translate('Animes/malprofile:AMAL_DESC14')}`
        }
      ])
    return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const query = args.get('username')?.value;
    const channel = guild.channels.cache.get(interaction.channelId);

    try {
      // Get Interaction Message Data
      await interaction.deferReply();
  
      const profile = await fetch(`https://api.jikan.moe/v4/users/${encodeURI(query)}/full`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
      const favorites = await fetch(`https://api.jikan.moe/v4/users/${encodeURI(query)}/favorites`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      if (!profile) {
        let err;
        if (profile && profile.data.status >= 500) {
          err = guild.translate('Animes/malprofile:AMAL_DESC')
        } else if (response && profile.data.status >= 400) {
          err = guild.translate('Animes/malprofile:AMAL_DESC1')
        } else {
          err = guild.translate('Animes/malprofile:AMAL_DESC2', { query: query })
        };
        return interaction.editReply(err).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      };
  
      const fav_anime = text.joinArrayAndLimit(favorites.data.anime.map((entry) => {
        return `[${entry.title}](${entry.url.split('/').splice(0, 5).join('/')})`;
      }), 1000, ' • ');
      const fav_manga = text.joinArrayAndLimit(favorites.data.manga.map((entry) => {
        return `[${entry.title}](${entry.url.split('/').splice(0, 5).join('/')})`;
      }), 1000, ' • ');
      const fav_characters = text.joinArrayAndLimit(favorites.data.characters.map((entry) => {
        return `[${entry.name}](${entry.url.split('/').splice(0, 5).join('/')})`;
      }), 1000, ' • ');
      const fav_people = text.joinArrayAndLimit(favorites.data.people.map((entry) => {
        return `[${entry.name}](${entry.url.split('/').splice(0, 5).join('/')})`;
      }), 1000, ' • ');
  
      const embed = new Embed(bot, guild)
        .setColor(65475)
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
        .setAuthor({ name: `${profile.data.username}' ${guild.translate('Animes/malprofile:AMAL_DESC3')}`, iconURL: profile.data.images.webp.image_url, url: profile.data.url })
        .setDescription([
          text.truncate((profile.data.about || '').replace(/(<([^>]+)>)/ig, ''), 350, `...[${guild.translate('Animes/malprofile:AMAL_DESC4')}](${profile.data.url})`),
          `• **${guild.translate('Animes/malprofile:AMAL_DESC5')}**:\u2000\u2000${profile.data.gender || 'Unspecified'}`,
          `• **${guild.translate('Animes/malprofile:AMAL_DESC6')}**\u2000\u2000${profile.data.location || 'Unspecified'}`,
          `• **${guild.translate('Animes/malprofile:AMAL_DESC7')}**\u2000\u2000${moment(profile.data.joined).format('dddd, do MMMM YYYY')}, *${moment(profile.data.joined).fromNow()}*`,
          `• **${guild.translate('Animes/malprofile:AMAL_DESC8')}**\u2000\u2000${moment(profile.data.last_online).format('dddd, do MMMM YYYY')}, *${moment(profile.data.last_online).fromNow()}*`
        ].join('\n'))
        .addFields([
          {
            name: `${guild.translate('Animes/malprofile:AMAL_DESC9')}`, inline: true,
            value: '```fix\n' + Object.entries(profile.data.statistics.anime).map(([key, value]) => {
              const cwidth = 28;
              const name = key.split('_').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
              const spacing = ' '.repeat(cwidth - (3 + name.length + String(value).length));
  
              return ' • ' + name + ':' + spacing + value;
            }).join('\n') + '```'
          }, {
            name: `${guild.translate('Animes/malprofile:AMAL_DESC10')}`, inline: true,
            value: '```fix\n' + Object.entries(profile.data.statistics.manga).splice(0, 10).map(([key, value]) => {
              const cwidth = 28;
              const name = key.split('_').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
              const spacing = ' '.repeat(cwidth - (3 + name.length + String(value).length));
  
              return ' • ' + name + ':' + spacing + value;
            }).join('\n') + '```'
          }, {
            name: `${guild.translate('Animes/malprofile:AMAL_DESC11')}`,
            value: fav_anime.text + (!!fav_anime.excess ? ` ${guild.translate('Animes/malprofile:AMAL_DESC12')} ${fav_anime.excess} ${guild.translate('Animes/malprofile:AMAL_DESC13')}` : '') || `${guild.translate('Animes/malprofile:AMAL_DESC14')}`
          }, {
            name: `${guild.translate('Animes/malprofile:AMAL_DESC15')}`,
            value: fav_manga.text + (!!fav_manga.excess ? ` ${guild.translate('Animes/malprofile:AMAL_DESC12')} ${fav_manga.excess} ${guild.translate('Animes/malprofile:AMAL_DESC13')}` : '') || `${guild.translate('Animes/malprofile:AMAL_DESC14')}`
          }, {
            name: `${guild.translate('Animes/malprofile:AMAL_DESC16')}`,
            value: fav_characters.text + (!!fav_characters.excess ? ` ${guild.translate('Animes/malprofile:AMAL_DESC12')} ${fav_characters.excess} ${guild.translate('Animes/malprofile:AMAL_DESC13')}` : '') || `${guild.translate('Animes/malprofile:AMAL_DESC14')}`
          }, {
            name: `${guild.translate('Animes/malprofile:AMAL_DESC17')}`,
            value: fav_people.text + (!!fav_people.excess ? ` ${guild.translate('Animes/malprofile:AMAL_DESC12')} ${fav_people.excess} ${guild.translate('Animes/malprofile:AMAL_DESC13')}` : '') || `${guild.translate('Animes/malprofile:AMAL_DESC14')}`
          }
        ])
      return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};
