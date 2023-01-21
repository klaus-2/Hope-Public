// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  moment = require('moment'),
  Command = require('../../structures/Command.js');

module.exports = class Old extends Command {
  constructor(bot) {
    super(bot, {
      name: 'old',
      dirname: __dirname,
      aliases: ['antigo'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Locates the oldest member on the server.',
      usage: '<prefix><commandName>',
      examples: [
        '.old',
        '!antigo'
      ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const mem = message.guild.members.cache.filter((m) => !m.user.bot).sort((a, b) => a.user.createdAt - b.user.createdAt).first();

    const embed = new Embed(bot, message.guild)
      .setAuthor({ name: message.translate('Fun/old:FOLD_DESC'), iconURL: `${mem.user.displayAvatarURL({ format: 'png', dynamic: true })}` })
      .setColor(16279836)
      .setTimestamp()
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
      .setDescription(`${mem.user} ${message.translate('Fun/old:FOLD_DESC1')} **${message.guild.name}**\n${message.translate('Fun/old:FOLD_DESC2')} __${moment(mem.user.createdAt).format('lll')}__\n <:SkyeUau:823047534670774303> ${message.translate('Fun/old:FOLD_DESC3')}`);

    message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
};