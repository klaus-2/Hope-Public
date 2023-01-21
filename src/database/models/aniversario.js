const { Schema, model } = require('mongoose');

const AniversarioSchema = Schema({
  _id: String,
  toggle: { type: Boolean, default: false },
  channelID: { type: String, default: null },
  // Se definido, não usará o canal, e enviará os parabens no privado
  private: { type: Boolean, default: null },
  // Define o tipo da mensagem
  messageType: { type: String, default: 'default' },
  // Se a mensagem for Text
  messageText: { type: String, default: null },
  // Se a mensagem for Embed
  embed: {
    title: { type: String, default: null },
    titleURL: { type: String, default: null },
    description: { type: String, default: null },
    footer: { type: String, default: null },
    footerIcon: { type: String, default: null },
    color: { type: String, default: null },
    timestamp: { type: Boolean, default: false },
    thumbnail: { type: String, default: null },
    image: { type: String, default: null },
    author: {
      name: { type: String, default: null },
      url: { type: String, default: null },
      icon: { type: String, default: null },
    },
  },
  // Mentions everyone | role | none
  mentionType: { type: String, default: 'everyone' },
  // Se for role
  roleID: { type: String, default: null },
});

module.exports = model('Aniversario', AniversarioSchema);