// Dependências
const request = require("request");
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');
const red = "#e60000";
const green = "#49c33a";

module.exports = class Verifyname extends Command {
  constructor(bot) {
    super(bot, {
      name: 'verifyname',
      dirname: __dirname,
      aliases: ['verificarnome'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Checks if a League of Legends summoner name is in use.',
      usage: '<prefix><commandName> <nickname>',
      examples: [
        '.verifyname Faker',
        '!verificarnome Faker'
      ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const api = bot.config.api_keys.riotAPI;
    if (message.args.length === 1) {
      var URL =
        `https://${message.translate('Games/elo:ELO5')}.api.riotgames.com/lol/summoner/v4/summoners/by-name/` +
        message.args[0] +
        "?api_key=" +
        api;
      request(URL, function (err, response, body) {

        var json = JSON.parse(body);

        if (json["status"]) {
          const embed = new Embed(bot, message.guild)
            .setColor(13210623)
            .setTitle('Games/verifyname:VERFNOME', { arg: message.args[0] })
            .setDescription(message.translate('Games/verifyname:VERFNOME1'))
            .setTimestamp()
            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Jogos/verifyname:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
          message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        }

        else {
          const embed = new Embed(bot, message.guild)
            .setColor(13210623)
            .setTitle('Games/verifyname:VERFNOME', { arg: message.args[0] })
            .setDescription(message.translate('Games/verifyname:VERFNOME2'))
            .setTimestamp()
            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Jogos/verifyname:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
          message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        }

      });
    } else {
      message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Jogos/verifyname:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Jogos/verifyname:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

    }
  }
};