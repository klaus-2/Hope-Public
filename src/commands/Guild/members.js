// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  ReactionMenu = require(`../../helpers/ReactionMenu.js`),
  Command = require('../../structures/Command.js');

module.exports = class Members extends Command {
  constructor(bot) {
    super(bot, {
      name: 'members',
      aliases: ['membros'],
      dirname: __dirname,
      botPermission: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
      description: 'Check all members of a certain role! or maybe all!',
      usage: '<prefix><commandName> [all | role name | @role]',
      examples: [
        '.members all',
        '!members role',
        '?members @role'
      ],
      cooldown: 5000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    let role = message.mentions.roles.first() || message.guild.roles.cache.get(message.args[0]) || message.guild.roles.cache.find(rl => rl.name.toLowerCase() === message.args.slice(0).join(' ').toLowerCase()) || message.guild.roles.cache.find(rl => rl.name.toUpperCase() === message.args.slice(0).join(' ').toUpperCase())

    if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Guild/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Guild/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

    if (message.args[0].toLowerCase() === 'everyone' || message.args[0].toLowerCase() === message.translate('Guild/members:MEMBROS')) role = message.guild.roles.everyone

    if (!role) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Guild/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Guild/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    const memberRole = role

    const members = [...message.guild.members.cache.filter(m => {
      if (m.roles.cache.find(r => r === memberRole)) return true;
    }).sort((a, b) => (a.joinedAt > b.joinedAt) ? 1 : -1).values()];

    const embed = new Embed(bot, message.guild)
      .setTitle(`${capitalize(memberRole.name ?? 'None')} ${message.translate('Guild/members:MEMBROS1')} [${members.length}]`)
      .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
      .setTimestamp()
      .setColor(message.guild.members.me.displayHexColor);

    const interval = 25;
    if (members.length === 0) message.channel.error(`${message.translate('Guild/members:MEMBROS2')} ${memberRole} ${message.translate('Guild/members:MEMBROS3')}`);
    else if (members.length <= interval) {

      const range = (members.length == 1) ? '[1]' : `[1 - ${members.length}]`;
      message.channel.send({ embeds: [embed.setTitle(`${capitalize(memberRole.name)} ${message.translate('Guild/members:MEMBROS1')} ${range}`).setDescription(members.join('\n') ?? 'None')] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

    } else {
      embed.setTitle(`${capitalize(memberRole.name)} ${message.translate('Guild/members:MEMBROS1')}`)
        .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true }))
        .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` });

      new ReactionMenu(message.client, message.channel, message.member, { embeds: [embed] }, members, interval);
    }
  }
};

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
