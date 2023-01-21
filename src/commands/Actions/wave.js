// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  actions = require(`${process.cwd()}/assets/json/actions.json`),
  Command = require('../../structures/Command.js');

module.exports = class Wave extends Command {
  constructor(bot) {
    super(bot, {
      name: 'wave',
      dirname: __dirname,
      aliases: ['acenar'],
      description: 'Wave to someone.',
      usage: '<prefix><commandName> [user]',
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      cooldown: 3000,
      examples: ['/wave', '.acenar @Hope'],
      slash: true,
      options: [{
        name: 'user',
        description: 'Choose the target user',
        type: ApplicationCommandOptionType.User,
        required: false,
      }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    // Filtra args para que todos args sejam apenas formatos de menção de um usuário
    message.args = message.args.filter(x => /<@!?\d{17,19}>/.test(x))

    const url = `https://i.imgur.com/${actions.wave[Math.floor(Math.random() * (actions.wave.length - 1))]}.gif`;

    //const url = 'bot.images.baka()';
    const embed = new Embed(bot, message.guild)
      .setColor(16248815)
      .setImage(url)

    if ((message.guild && !message.mentions.members.size) || !message.args[0]) {
      embed.setDescription(message.translate('Actions/wave:ACENAR_DESCRIÇÃO1', { author: message.author }))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else if (new RegExp(`<@!?${bot.user.id}>`).test(message.args[0])) {
      embed.setDescription(message.translate('Actions/wave:ACENAR_DESCRIÇÃO2', { user: bot.user }))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else if (new RegExp(`<@!?${message.author.id}>`).test(message.args[0])) {
      embed.setDescription(message.translate('Actions/wave:ACENAR_DESCRIÇÃO1', { author: message.author }))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else {
      embed.setDescription(`${message.author}${message.translate('Actions/wave:ACENAR_DESCRIÇÃO3')}${message.args[0]}!`)
      return message.channel.send(
        { embeds: [embed] }
      ).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    };
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
    const channel = guild.channels.cache.get(interaction.channelId);

    const url = `https://i.imgur.com/${actions.wave[Math.floor(Math.random() * (actions.wave.length - 1))]}.gif`;

    const embed = new Embed(bot, guild)
      .setColor(16248815)
      .setImage(url)

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      if (!args.get('user')) {
        embed.setDescription(guild.translate('Actions/wave:ACENAR_DESCRIÇÃO1', { author: interaction.user }))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

      } else if (new RegExp(`<@!?${bot.user.id}>`).test(member)) {
        embed.setDescription(guild.translate('Actions/wave:ACENAR_DESCRIÇÃO2', { user: bot.user }))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

      } else if (new RegExp(`<@!?${interaction.user.id}>`).test(member)) {
        embed.setDescription(guild.translate('Actions/wave:ACENAR_DESCRIÇÃO1', { author: interaction.user }))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

      } else {
        embed.setDescription(`${interaction.user}${guild.translate('Actions/wave:ACENAR_DESCRIÇÃO3')}${member}!`)
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      };
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};