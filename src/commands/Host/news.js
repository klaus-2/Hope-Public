// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');
const Guild = require(`../../database/models/Hope.js`);
const { GuildSchema } = require(`../../database/models`);
const moment = require("moment")
moment.suppressDeprecationWarnings = true;

module.exports = class News extends Command {
  constructor(bot) {
    super(bot, {
      name: 'news',
      ownerOnly: true,
      dirname: __dirname,
      botPermission: [Flags.AddReactions],
      description: 'Mostra as últimas notícias da Hope.', //Shows Hope's latest news
      usage: 'news',
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    const guildDB = await Guild.findOne({
      tag: '622812963572809771'
    });

    if(!guildDB) return message.channel.send(`${language.noNews}`)


      
      let embed = new Embed(bot, message.guild)
    .setColor(message.guild.members.me.displayHexColor)
    .setTitle('Guild/news:NEWS')
    .setDescription(`***__${message.translate('Guild/news:NEWS1')}__ ${moment(guildDB.time).format("dddd, Do MMMM YYYY")}*** *__[\`(${moment(guildDB.time).fromNow()})\`](https://Hope.xyz)__*\n\n ${guildDB.news}`)
    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Guild/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
    .setTimestamp();

    message.channel.send({ embeds: [embed] }).catch(() => {
      message.channel.send(`${language.noNews}`)
    });
  
  }
};