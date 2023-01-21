// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Update extends Command {
    constructor(bot) {
        super(bot, {
            name: 'res',
            ownerOnly: true,
            dirname: __dirname,
            description: 'Altera o status da Hope.',
            usage: 'gerarcodigo <dias>',
            cooldown: 3000,
            examples: ['gerarcodigo 2'],
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {

        const msg1 = message.args[1].slice(1).join(' ') || 'RESTARTING FOR UPDATES'
        const msg2 = message.args[0] || 'WATCHING'

        bot.user.setActivity(msg1, { type: msg2 });

        message.reply('Status alterado com sucesso.')
    }
}