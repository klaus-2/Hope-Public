// Dependências
const { Embed } = require(`../../utils`),
  { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
  actions = require(`${process.cwd()}/assets/json/actions.json`),
  Command = require('../../structures/Command.js');

module.exports = class Blush extends Command {
  constructor(bot) {
    super(bot, {
      name: 'blush',
      dirname: __dirname,
      aliases: ['vergonha', 'corar'],
      description: 'Express a feeling of shame/crying.',
      usage: '<prefix><commandName> [user]',
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      cooldown: 3000,
      examples: ['/blush', '.blush @Klaus', '!corar @Hope'],
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
    // Filtre args para que todos args sejam apenas formatos de menção de usuário.
    message.args = message.args.filter(x => /<@!?\d{17,19}>/.test(x))

    //const url = 'bot.images.baka()';
    const embed = new Embed(bot, message.guild)
      .setColor(16248815)
      .setImage(`https://i.imgur.com/${actions.blush[Math.floor(Math.random() * (actions.blush.length - 1))]}.gif`)

    if ((message.guild && !message.mentions.members.size) || !message.args[0]) {
      embed.setDescription(message.translate('Actions/blush:VERGONHA_DESCRIÇÃO', { author: message.author }))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else if (new RegExp(`<@!?${message.author.id}>`).test(message.args[0])) {
      embed.setDescription(message.translate('Actions/blush:VERGONHA_DESCRIÇÃO', { author: message.author }))
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else {
      embed.setDescription(`${message.author} ${message.translate('Actions/blush:VERGONHA_DESCRIÇÃO1')} ${message.args[0]}!`)
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    };
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
    const channel = guild.channels.cache.get(interaction.channelId);

    const embed = new Embed(bot, guild)
    .setColor(16248815)
    .setImage(`https://i.imgur.com/${actions.blush[Math.floor(Math.random() * (actions.blush.length - 1))]}.gif`)

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      if (!args.get('user')) {
        embed.setDescription(guild.translate('Actions/blush:VERGONHA_DESCRIÇÃO', { author: member }))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      } else if (new RegExp(`<@!?${interaction.user.id}>`).test(guild.members.cache.get(args.get('user')?.value))) {
        embed.setDescription(guild.translate('Actions/blush:VERGONHA_DESCRIÇÃO', { author: member }))
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      } else {
        embed.setDescription(`${interaction.user} ${guild.translate('Actions/blush:VERGONHA_DESCRIÇÃO1')} ${member}!`)
        return interaction.editReply(({ embeds: [embed] })).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      }
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};