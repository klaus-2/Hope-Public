// Dependências
const { Embed } = require(`../../utils`),
  { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
  actions = require(`${process.cwd()}/assets/json/actions.json`),
  Command = require('../../structures/Command.js');

module.exports = class Baka extends Command {
  constructor(bot) {
    super(bot, {
      name: 'baka',
      dirname: __dirname,
      aliases: ['idiot', 'idiota'],
      description: 'Call someone an idiot.',
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      usage: '<prefix><commandName> [user]',
      cooldown: 3000,
      examples: ['/baka', '.baka @Klaus', '!idiota @Hope'],
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
      .setImage(`https://i.imgur.com/${actions.baka[Math.floor(Math.random() * (actions.baka.length - 1))]}.gif`)

    if (message.guild && !message.mentions.members.size) {

      return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else if (new RegExp(`<@!?${bot.user.id}>`).test(message.args[0])) {

      //return message.react(':HopePutassa:845724119537418261');
      embed.setDescription(`${message.args[0]} B~baka!`)
      return message.channel.send(
        ({ embeds: [embed] })
      ).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else if (new RegExp(`<@!?${message.author.id}>`).test(message.args[0])) {

      return message.channel.send(message.translate('Actions/baka:IDIOTA_DESCRIÇÃO', { author: message.author })).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else {
      embed.setDescription(`${message.args[0]} B~baka!`)
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
      .setImage(`https://i.imgur.com/${actions.baka[Math.floor(Math.random() * (actions.baka.length - 1))]}.gif`)

    try {
      // Get Interaction Message Data
      await interaction.deferReply();

      if (!args.get('user')) {
        return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      } else if (new RegExp(`<@!?${bot.user.id}>`).test(member)) {
        embed.setDescription(`${member} B~baka!`)
        return interaction.editReply(({ embeds: [embed] })).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      } else if (new RegExp(`<@!?${member.id}>`).test(member)) {
        return interaction.editReply({ content: guild.translate('Actions/baka:IDIOTA_DESCRIÇÃO', { author: member }) }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      } else {
        embed.setDescription(`${member} B~baka!`)
        return interaction.editReply(({ embeds: [embed] })).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
      }
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};