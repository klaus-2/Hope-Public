// Dependências
const { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');

module.exports = class Etext extends Command {
  constructor(bot) {
    super(bot, {
      name: 'etext',
      aliases: ['etexto'],
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Returns the supplied text in the form of emoji (emotes).',
      usage: '<prefix><commandName> <message>',
      examples: [
        '.etext Hope is the best bot in the world <3'
      ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const mapping = {
      ' ': '   ',
      '0': ':zero:',
      '1': ':one:',
      '2': ':two:',
      '3': ':three:',
      '4': ':four:',
      '5': ':five:',
      '6': ':six:',
      '7': ':seven:',
      '8': ':eight:',
      '9': ':nine:',
      '!': ':grey_exclamation:',
      '?': ':grey_question:',
      '#': ':hash:',
      '*': ':asterisk:'
    };

    'abcdefghijklmnopqrstuvwxyz'.split('').forEach(c => {
      mapping[c] = mapping[c.toUpperCase()] = ` :regional_indicator_${c}:`;
    });
    if (message.args.length < 1) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Addons/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Addons/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

    message.channel.send(message.args.join(' ').split('').map(c => mapping[c] || c).join('')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  };
};