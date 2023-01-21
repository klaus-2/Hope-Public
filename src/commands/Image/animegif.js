// Dependências
const { PermissionsBitField: { Flags } } = require('discord.js'),
  fetch = require('node-fetch'),
  Command = require('../../structures/Command.js');

module.exports = class AnimeGIF extends Command {
  constructor(bot) {
    super(bot, {
      name: 'animegif',
      dirname: __dirname,
      aliases: ['an', 'anigif'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Generate a random gif of an anime.',
      usage: '<prefix><commandName>',
      examples: [
        '.animegif',
        '!an',
        '?anigif'
      ],
      cooldown: 5000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    fetch(`https://api.tenor.com/v1/random?key=${bot.config.api_keys.tenor}&q=anime&limit=1`)
      .then(res => res.json())
      .then(json => message.channel.send(json.results[0].url))
  };
};