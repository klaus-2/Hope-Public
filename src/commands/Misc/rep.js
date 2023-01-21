// Dependências
const { Reputação } = require('../../database/models/index'),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');

module.exports = class Rep extends Command {
  constructor(bot) {
    super(bot, {
      name: 'rep',
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Give a user a rep point.',
      usage: '<prefix><commandName> <user>',
      examples: [
        '.rep @Klaus'
      ],
      cooldown: 60000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    const target = message.mentions.users.first()
    if (!target) {
      message.channel.send(message.translate('Thanks/rep:REP')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      return
    }

    const { guild } = message
    const guildID = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === authorId) {
      message.channel.send(message.translate('Thanks/rep:REP1')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
      return
    }

    const authorData = await Reputação.findOne({
      userID: authorId,
      guildID,
    })

    if (authorData && authorData.lastGave) {
      const then = new Date(authorData.lastGave)

      const diff = now.getTime() - then.getTime()
      const diffHours = Math.round(diff / (1000 * 60 * 60))

      const hours = 24
      if (diffHours <= hours) {
        message.channel.send(
          message.translate('Thanks/rep:REP2', { hours: hours })
        ).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        return
      }
    }

    // Update the "lastGave" property for the command sender
    await Reputação.findOneAndUpdate({ userID: authorId, guildID }, { userID: authorId, guildID, ultimoRep: now }, { upsert: true });

    // Increase how many Reputação the target user has had
    const result = await Reputação.findOneAndUpdate(
      {
        userID: targetId,
        guildID,
      },
      {
        userID: targetId,
        guildID,
        $inc: {
          recebido: 1,
        },
      },
      {
        upsert: true,
        new: true,
      }
    )

    const amount = result.recebido
    message.channel.send(
      `${message.translate('Thanks/rep:REP3')} <@${targetId}> ${message.translate('Thanks/rep:REP4')} ${amount} ${message.translate('Thanks/rep:REP5')}`
    ).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
  }
}