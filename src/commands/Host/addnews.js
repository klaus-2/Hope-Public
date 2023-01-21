// Dependências
const { newsDB } = require('../../database/models'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class CriarDB extends Command {
    constructor(bot) {
        super(bot, {
            name: 'addnews',
            dirname: __dirname,
            ownerOnly: true,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'reportar um bug para o meu desenvolvedor.',
            usage: 'bug <mensagem>',
            examples: '.bug estou tentando usar o comando teste mas não está funcionando.',
            cooldown: 1000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {

            const newSettings1 = new newsDB({
                id: "Hope",
                newsTitle: message.args[0],
                newsShort: message.args[1] || null,
                newsFull: message.args[2] || null,
                date: Date.now(),
            });
            await newSettings1.save().catch((e) => { console.log(e) });

            message.channel.send(`Announcement published successfully`);
    }
};