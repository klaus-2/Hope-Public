// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');

module.exports = class Position extends Command {
  constructor(bot) {
    super(bot, {
      name: 'position',
      aliases: ['posição'],
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Shows the login position of a user on the server.',
      usage: '<prefix><commandName> [user]',
      examples: [
        '.position',
        '!position @Klaus'
      ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const member = message.mentions.members.first() || message.author;

    if (!member) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

    const members = [...message.guild.members.cache
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
      .values()];

    const position = new Promise((ful) => {
      for (let i = 1; i < members.length + 1; i++) {
        if (members[i - 1].id === member.id) ful(i);
      }
    });
    let user = message.mentions.members.first() ?? message.guild.members.cache.get(message.args[0]) ?? message.member;
    const positione = new Embed(bot, message.guild)
      .setTitle('Misc/position:EPOS_DESC')
      .setDescription(`${member} ${message.translate('Misc/position:EPOS_DESC1')} \`${await position}\` ${message.translate('Misc/position:EPOS_DESC2')} **${message.guild.name}**`)
      .setColor(16775424)
      .setThumbnail(user.user.avatarURL({ format: 'png', dynamic: true }))
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

    message.channel.send({ embeds: [positione] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
};