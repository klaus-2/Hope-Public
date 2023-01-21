// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');
const SlayBotDB = require(`../../database/models/Hope.js`);

module.exports = class SetNews extends Command {
  constructor(bot) {
    super(bot, {
      name: 'setnews',
      ownerOnly: true,
      dirname: __dirname,
      botPermission: [Flags.AddReactions],
      description: 'This is for the developers.',
      usage: '<text>',
      cooldown: 3000,
      examples: ['setnews Teste']
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    let news = message.args.join(' ').split('').join('') 
    if(!message.args[0]) {
        return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Addons/${this.help.name}:USAGE`, {EXAMPLE: settings.prefix.concat(message.translate(`Addons/${this.help.name}:EXAMPLE`) )})) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});
    }
    if(!SlayBotDB.news) return  await SlayBotDB.create({ news: news, tag: '622812963572809771', time: new Date() }) + await SlayBotDB.updateOne({ news: news, tag: '622812963572809771', time: new Date()}) +  message.channel.send(' Notícias atualizadas!')
    await SlayBotDB.updateOne({ news: news, tag: '622812963572809771', time: new Date() })
    message.channel.send(' Notícias atualizadas!')
  }
};
