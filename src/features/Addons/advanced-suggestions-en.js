const { Embed } = require(`../../utils`);
const suggestionSchema = require('../../database/models/suggestions-en-schema')

const statusMessages = {
  WAITING: {
    text: '<:Informao:823004619805294643> Waiting for community feedback, please vote!',
    color: 0xffea00,
  },
  APPROVED: {
    text: '<:v_:855859391835799582> Suggestion accepted! Will be implemented soon.',
    color: 0xB8E986,
  },
  DENIED: {
    text:
      '<:cancel:855859391709577266> Thanks for the suggestion, but we\'re not interested in it at this time.',
    color: 0xFF6A6A,
  },
}

let suggestionCache = {} // { guildId: channelId }

const fetchSuggestionChannels = async (guildId) => {
  let query = {}

  if (guildId) {
    query._id = guildId
  }

  const results = await suggestionSchema.find(query)

  for (const result of results) {
    const { _id, channelId } = result
    suggestionCache[_id] = channelId
  }
}

module.exports = (client) => {
  fetchSuggestionChannels()

  client.on('messageCreate', async (message) => {
    const { guild, channel, content, member } = message

    if (!guild) return

    const cachedChannelId = suggestionCache[guild.id]
    //const verificar = message.guild.channels.cache.get('830476567410901003');
    if (cachedChannelId && cachedChannelId === channel.id && !member.user.bot) {
      message.delete()

      const status = statusMessages.WAITING

      // Get server settings / if no settings then return
      const settings = message.guild.settings;
      //if (Object.keys(settings).length == 0) return;

      const embed = new Embed(client, message)
        .setColor(status.color)
        .setAuthor({ name: `${member.displayName} ${client.translate('Features/sugestões:SUGESTÕES5', {}, client.guilds.cache.get(message.guild.settings.guildID).settings.Language)}`, iconURL: member.user.displayAvatarURL() })
        .setDescription(content)
        .addFields({
          name: `${client.translate('Features/sugestões:SUGESTÕES7', {}, client.guilds.cache.get(message.guild.settings.guildID).settings.Language)}`,
          value: `${status.text}`,
        })
        .setFooter({ text: client.translate('Features/sugestões:SUGESTÕES6', {}, client.guilds.cache.get(message.guild.settings.guildID).settings.Language) })

      channel.send({ embeds: [embed] }).then((messages) => {
        messages.react('855859391835799582').then(() => {
          messages.react('855859391709577266')
        })
      })
    }
  })
}

module.exports.fetchSuggestionChannels = fetchSuggestionChannels

module.exports.statusMessages = statusMessages

module.exports.suggestionCache = () => {
  return suggestionCache
}