// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  { randomQuote } = require('animequotes'),
  { searchAnime } = require('node-kitsu'),
  Command = require('../../structures/Command.js');

module.exports = class AniQuote extends Command {
  constructor(bot) {
    super(bot, {
      name: 'aniquote',
      dirname: __dirname,
      aliases: ['af', 'animequotes', 'anime-frase', 'quotes', 'anifrase'],
      description: 'Generate a random anime quote.',
      usage: '<prefix><commandName> [anime]',
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      cooldown: 3000,
      examples: ['/aniquote', '/aniquote one piece', '.anifrase', '!af dragon ball'],
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
    const { quote, anime, id, name } = randomQuote();

    const res = await searchAnime(message.args.join('') || anime, 0).catch(() => { }) || [];

    const image = res?.[0]?.attributes?.coverImage?.original || null;

    const embed = new Embed(bot, message.guild)
      .setColor(65475)
      .addFields(
        { name: message.translate('Animes/aniquote:AFRASE_FIELD', { anime: res?.[0]?.attributes?.titles.en ?? res?.[0]?.attributes?.titles.en_jp ?? res?.[0]?.attributes?.titles.ja_jp ?? anime }), value: `${quote}\n\n-*${name}*`, inline: false },
      )
      .setImage(image)
      .setTimestamp()
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
    return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const channel = guild.channels.cache.get(interaction.channelId);

    const { quote, anime, id, name } = randomQuote();

    const res = await searchAnime(args.get('anime')?.value || anime, 0).catch(() => { }) || [];

    const image = res?.[0]?.attributes?.coverImage?.original || null;

    const embed = new Embed(bot, guild)
      .setColor(65475)
      .addFields({ name: guild.translate('Animes/aniquote:AFRASE_FIELD', { anime: res?.[0]?.attributes?.titles.en ?? res?.[0]?.attributes?.titles.en_jp ?? res?.[0]?.attributes?.titles.ja_jp ?? anime }), value: `${quote}\n\n-*${name}*`, inline: false })
      .setImage(image)
      .setTimestamp()
      .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })

    try {
      // Get Interaction Message Data
      await interaction.deferReply();
      return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.reply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};