// Dependências
const backup = require("discord-backup"),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class CriarDB extends Command {
    constructor(bot) {
        super(bot, {
            name: 'b-carregar',
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

        try {
            backup.load(message.args[0], message.guild).then(() => {
                backup.remove(message.args[0]); // When the backup is loaded, it's recommended to delete it
                message.channel.send(`Backup carregado e deletado com sucesso!`);
            });
        } catch (err) {
            message.channel.send(`Um error ocorreu: ${err}`);
        }
    }
};