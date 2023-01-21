// Dependências
const { Embed, func: { genInviteLink }, HopePaginator } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType, GuildEmoji } = require('discord.js'),
  { fetch } = require('undici'),
  Pages = require('../../structures/Paginate'),
  Command = require('../../structures/Command.js');

module.exports = class ChuckNorris extends Command {
  constructor(bot) {
    super(bot, {
      name: 'chucknorris',
      dirname: __dirname,
      aliases: ['chuckfact', 'norris', 'chuck-norris'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Generate random or specific Chuck Norris jokes.',
      usage: '<prefix><commandName> [option]',
      cooldown: 10000,
      examples: [
        '/chucknorris',
        '.chucknorris -cat',
        '!chucknorris music',
        '?chucknorris ? joke'
      ],
      slash: true,
      options: [{
        name: 'search',
        description: 'Search Query',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: 'category',
        description: 'type',
        type: ApplicationCommandOptionType.String,
        choices: [...["animal", "career", "celebrity", "dev", "explicit", "fashion", "food", "history", "money", "movie", "music", "political", "religion", "science", "sport", "travel"].map(day => ({ name: day, value: day }))].slice(0, 24),
        required: false,
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    if (!message.args[0]) {
      const category = await fetch(`https://api.chucknorris.io/jokes/random`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      if (category.status === 404) {
        await message.channel.error('Uh-oh! ' + category.message + ' Please use \``' + settings.prefix + '\``**chucknorris -cat** to see the list of available categories!').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      }

      const answerEmbed = new Embed(bot, message.guild)
        .setColor(16279836)
        .setAuthor({ name: `Chuck Norris`, iconURL: 'https://img.icons8.com/plasticine/452/chuck-norris.png', url: genInviteLink(bot) })
        .setDescription(category.value)
        .setThumbnail("https://img.icons8.com/plasticine/452/chuck-norris.png")
        .setTimestamp()
        .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

      message.channel.send({ embeds: [answerEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } else if (message.args[0] === '?') {
      if (!message.args[1]) return message.channel.error(`Uh-oh! Sorry, but you need to enter a search term. Please try: \`${settings.prefix}\`**chucknorris ? joke**`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      const search = await fetch(`https://api.chucknorris.io/jokes/search?query=${message.args.slice(1).join(' ')}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
      
      if (search.total === 0) return message.channel.error(`Uh-oh! I couldn't find any joke with this term, try again!`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

      const page = new Pages();
      let index = 0;

      for (const data of search.result) {
        const embed = new Embed(bot, message.guild)
          .setColor(16279836)
          .setAuthor({ name: `Chuck Norris | ${data.categories.join(', ') ?? data.categories[0]} Joke`, iconURL: 'https://img.icons8.com/plasticine/452/chuck-norris.png', url: genInviteLink(bot) })
          .setDescription(data.value)
          .setThumbnail("https://img.icons8.com/plasticine/452/chuck-norris.png")
          .setTimestamp()
          .setFooter({ text: `Page ${index + 1} of ${search.total}\u2000\u2000${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

        index++;
        page.add(embed);
      };

      await message.channel.send({ embeds: [page.firstPage] }).then(async (m) => {

        if (page.size === 1) return;

        const prev = bot.emojis.cache.get('767062237722050561') || '◀';
        const next = bot.emojis.cache.get('767062244034084865') || '▶';
        const terminate = bot.emojis.cache.get('767062250279927818') || '❌';

        const filter = (_, user) => user.id === message.author.id;
        const collector = m.createReactionCollector({ filter, time: 90000 });
        const navigators = [prev, next, terminate];
        let timeout = setTimeout(() => collector.stop(), 90000);

        for (let i = 0; i < navigators.length; i++) {
          await m.react(navigators[i]);
        };

        collector.on('collect', async reaction => {
          switch (reaction.emoji.name) {
            case prev instanceof GuildEmoji ? prev.name : prev:
              m.edit({ embeds: [page.previous()] });
              break;
            case next instanceof GuildEmoji ? next.name : next:
              m.edit({ embeds: [page.next()] });
              break;
            case terminate instanceof GuildEmoji ? terminate.name : terminate:
              collector.stop();
              break;
          };

          await reaction.users.remove(message.author.id);
          timeout.refresh();
        });

        collector.on('end', async () => await m.reactions.removeAll());
      });
    } else if (message.args[0] === '-cat') {
      const catlist = await fetch(`https://api.chucknorris.io/jokes/categories`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      const answerEmbed = new Embed(bot, message.guild)
        .setColor(16279836)
        .setAuthor({ name: `Chuck Norris | Categories list`, iconURL: 'https://img.icons8.com/plasticine/452/chuck-norris.png', url: genInviteLink(bot) })
        .setDescription(catlist.join(', '))
        .setThumbnail("https://img.icons8.com/plasticine/452/chuck-norris.png")
        .setTimestamp()
        .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

      message.channel.send({ embeds: [answerEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } else if (message.args[0] !== '-cat' && message.args[0] !== '?') {
      const category = await fetch(`https://api.chucknorris.io/jokes/random?category=${message.args[0]}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      if (category.status === 404) {
        await message.channel.error('Uh-oh! ' + category.message + ' Please use \``' + settings.prefix + '\``**chucknorris -cat** to see the list of available categories!').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      }

      const answerEmbed = new Embed(bot, message.guild)
        .setColor(16279836)
        .setAuthor({ name: `Chuck Norris | ${message.args[0]} Joke`, iconURL: 'https://img.icons8.com/plasticine/452/chuck-norris.png', url: genInviteLink(bot) })
        .setDescription(category.value)
        .setThumbnail("https://img.icons8.com/plasticine/452/chuck-norris.png")
        .setTimestamp()
        .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

      message.channel.send({ embeds: [answerEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const channel = guild.channels.cache.get(interaction.channelId);
    const search = args.get('search')?.value;
    const category = args.get('category')?.value;

    await interaction.deferReply();

    if (category) {
      const categorydata = await fetch(`https://api.chucknorris.io/jokes/random?category=${category}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      if (categorydata.status === 404) return await interaction.editReply({ embeds: [channel.error('Uh-oh! ' + categorydata.message + ' Please use \``' + guild.settings.prefix + '\``**chucknorris -cat** to see the list of available categories!', true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

      const answerEmbed = new Embed(bot, guild)
        .setColor(16279836)
        .setAuthor({ name: `Chuck Norris | ${category} Joke`, iconURL: 'https://img.icons8.com/plasticine/452/chuck-norris.png', url: genInviteLink(bot) })
        .setDescription(categorydata.value)
        .setThumbnail("https://img.icons8.com/plasticine/452/chuck-norris.png")
        .setTimestamp()
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

      interaction.editReply({ embeds: [answerEmbed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } else if (search) {
      const searchdata = await fetch(`https://api.chucknorris.io/jokes/search?query=${search}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      if (searchdata.total === 0) return interaction.editReply({ content: ' ', embeds: [channel.error('Uh-oh! I couldn\'t find any joke with this term, try again!', {}, true)], ephemeral: true }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

      // get total page number
      let pagesNum = Math.ceil(searchdata.result.length / 10);
      if (pagesNum === 0) pagesNum = 1;

      // create pages for pageinator
      const pages = [];
      let index = 0;
      for (const data of searchdata.result) {
        const embed = new Embed(bot, guild)
          .setColor(16279836)
          .setAuthor({ name: `Chuck Norris | ${data.categories.join(', ') ?? data.categories[0]} Joke`, iconURL: 'https://img.icons8.com/plasticine/452/chuck-norris.png', url: genInviteLink(bot) })
          .setDescription(data.value)
          .setThumbnail("https://img.icons8.com/plasticine/452/chuck-norris.png")
          .setTimestamp()
          .setFooter({ text: `Page ${index + 1} of ${searchdata.total}\u2000\u2000${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

        index++;
        pages.push(embed);
      };

      // If a user specified a page number then show page if not show pagintor.
      return HopePaginator(bot, interaction, pages, member.id);
    } else {
      const random = await fetch(`https://api.chucknorris.io/jokes/random`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);

      const answerEmbed = new Embed(bot, guild)
        .setColor(16279836)
        .setAuthor({ name: 'Chuck Norris', iconURL: 'https://img.icons8.com/plasticine/452/chuck-norris.png', url: genInviteLink(bot) })
        .setDescription(random.value)
        .setThumbnail("https://img.icons8.com/plasticine/452/chuck-norris.png")
        .setTimestamp()
        .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

      interaction.editReply({ embeds: [answerEmbed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
  }
};