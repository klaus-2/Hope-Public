// Dependências
const { Embed } = require(`../../utils`),
  fetch = require("node-fetch"),
  { AttachmentBuilder, PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');

module.exports = class Minecraft extends Command {
  constructor(bot) {
    super(bot, {
      name: 'minecraft',
      dirname: __dirname,
      aliases: ['minecraft', 'mc'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Get information from a minecraft server.',
      usage: '<prefix><commandName> <ip> <port>',
        examples: [
            '.minecraft eu.hypixel.net',
            '!mc eu.hypixel.net',
            '?mc 127.0.0.1 25565'
        ],
      cooldown: 5000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

    const [host, port = 25565] = message.args[0].split(":");
    const body = await fetch(
      `https://mcapi.us/server/status?ip=${host}&port=${port}`
    ).then((res) => res.json());

    console.log(body.motd.replace(/§[0-9a-fk-or]/g, ""))

    if (body.online) {
      const embed = new Embed(bot, message.guild)
        .setTitle('Pesquisas/minecraft:MINECRAFT')
        .setURL(`https://mcsrvstat.us/server/${message.args[0]}:${message.args[1]}`)
        .setDescription(`${body.motd.replaceAll(/§[0-9a-fk-or]/g, "") || '\u2000'}`)
        .setColor(12317183)
        .addFields({ name: message.translate('Pesquisas/minecraft:MINECRAFT1'), value: body.online ? message.translate('Pesquisas/minecraft:MINECRAFT2') : message.translate('Pesquisas/minecraft:MINECRAFT3'), inline: true },
          { name: message.translate('Pesquisas/minecraft:MINECRAFT4'), value: `${body.players.now.toLocaleString(settings.Language)}/${body.players.max.toLocaleString(settings.Language)}`, inline: true },
          { name: message.translate('Pesquisas/minecraft:MINECRAFT5'), value: `\`${host}:${port}\``, inline: false },
          { name: `${message.translate('Pesquisas/minecraft:MINECRAFT6')}`, value: `${body.server.name.replace(/§[0-9a-fk-or]/g, "")}`, inline: true })
      //.addField('Descrição:', response.description.descriptionText.replace(/§[a-zA-Z0-9]/g, ''))
      let attachment;
      attachment = new AttachmentBuilder(this.decodeBase64Image(body.favicon), { name: "favIcon.png" })
      embed.setThumbnail("attachment://favIcon.png")
      message.channel.send({ embeds: [embed], files: [attachment] });
    } else {
      message.channel.send(message.translate('Pesquisas/minecraft:MINECRAFT7')).then(m => m.timedDelete({ timeout: 5000 }));
    }
  }

  decodeBase64Image(str) {
    if (!str) return "https://i.imgur.com/nZ6nRny.png";
    const matches = str.match(/^data:([A-Za-z-+\/]+);base64,([\s\S]+)/);
    if (!matches || matches.length !== 3) return Buffer.from(str, "base64");
    return Buffer.from(matches[2], "base64");
  }
};
