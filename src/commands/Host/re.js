// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');
const botModel = require("../../database/models/bot");

module.exports = class Re extends Command {
  constructor(bot) {
    super(bot, {
      name: 're',
      dirname: __dirname,
      ownerOnly: true,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'reiniciar o bot.',
      usage: 're',
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    //message.delete()
    //message.channel.sendTyping();

    let embed = new Embed(bot, message.guild)
      .setColor(13754160)
      .setTitle('Dono/re:HRE_DESC')
      .setDescription(message.translate('Dono/re:HRE_DESC1'))
    const ms = await message.channel.send(message.translate('Dono/re:HRE_DESC2'));
    await botModel.findOneAndUpdate({
      name: "Andoi",
      channel: message.channel.id,
      lastMsg: ms.id,
    });
    await bot.destroy();
    process.exit(1);
  }
};