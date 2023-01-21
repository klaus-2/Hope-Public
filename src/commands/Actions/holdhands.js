// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
  actions = require(`${process.cwd()}/assets/json/actions.json`),
  Command = require('../../structures/Command.js');

module.exports = class Holdhands extends Command {
  constructor(bot) {
    super(bot, {
      name: 'holdhands',
      dirname: __dirname,
      aliases: ['mãosdadas', 'boldhands', 'md', 'maosdadas'],
      description: 'Hold hands with someone special.',
      usage: '<prefix><commandName> <user>',
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      cooldown: 3000,
      examples: ['/holdhands', '.boldhands @Klaus', '!md @Klaus @Hope', '?maosdadas @Klaus @Hope @Faith'],
      slash: true,
      options: [{
        name: 'user',
        description: 'Choose the target user',
        type: ApplicationCommandOptionType.User,
        required: true,
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
      .setImage(`https://i.imgur.com/${actions.holdhands[Math.floor(Math.random() * (actions.holdhands.length - 1))]}.gif`)

    if ((message.guild && !message.mentions.members.size) || !message.args[0]) {

      return message.channel.send(message.translate('Actions/holdhands:MAOS_DESCRIÇÃO', { author: message.author })).then(m => m.timedDelete({ timeout: 10000 }));

    } else if (new RegExp(`<@!?${bot.user.id}>`).test(message.args[0])) {
      embed.setImage(`https://i.imgur.com/${actions.slap[Math.floor(Math.random() * (actions.slap.length - 1))]}.gif`)
      embed.setDescription(`${message.author} baka!`)
      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else if (new RegExp(`<@!?${message.author.id}>`).test(message.args[0])) {

      return message.channel.send(message.translate('Actions/holdhands:MAOS_DESCRIÇÃO2', { author: message.author })).then(m => m.timedDelete({ timeout: 10000 }));

    } else {
      embed.setDescription(`${message.author} ${message.translate('Actions/holdhands:MAOS_DESCRIÇÃO1')} ${message.args[0]}!`)
      return message.channel.send(
        ({ embeds: [embed] })
      ).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    };
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
    const channel = guild.channels.cache.get(interaction.channelId);

    const embed = new Embed(bot, guild)
      .setColor(16248815)
      .setImage(`https://i.imgur.com/${actions.holdhands[Math.floor(Math.random() * (actions.holdhands.length - 1))]}.gif`)

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      if (!args.get('user')) {
        return interaction.editReply({ conntent: guild.translate('Actions/holdhands:MAOS_DESCRIÇÃO', { author: interaction.user }) }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      } else if (new RegExp(`<@!?${bot.user.id}>`).test(member)) {
        embed.setImage(`https://i.imgur.com/${actions.slap[Math.floor(Math.random() * (actions.slap.length - 1))]}.gif`)
        embed.setDescription(`${interaction.user} baka!`)
        return interaction.editReply(({ embeds: [embed] })).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      } else if (new RegExp(`<@!?${interaction.user.id}>`).test(guild.members.cache.get(args.get('user')?.value))) {
        return interaction.editReply({ content: guild.translate('Actions/holdhands:MAOS_DESCRIÇÃO2', { author: interaction.user }) }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      } else {
        embed.setDescription(`${interaction.user} ${guild.translate('Actions/holdhands:MAOS_DESCRIÇÃO1')} ${member}!`)
        return interaction.editReply(({ embeds: [embed] })).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      }
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};