// Dependências
const backup = require("discord-backup"),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class CriarDB extends Command {
    constructor(bot) {
        super(bot, {
            name: 'b-criar',
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

        let options = {
            maxMessagesPerChannel: 10,
            jsonSave: true,
            jsonBeautify: true,
            doNotBackup: [ "emojis", "bans" ],
            saveImages: "base64"
        };

        try {
            backup.setStorageFolder(__dirname+"/backups/");
            await backup.create(message.guild, options).then((backupData) => {
                console.log(backupData);
                message.channel.send(`Backup criado com sucesso!\nID: **${backupData.id}**`)
            });
        } catch (err) {
            message.channel.send(`Um error ocorreu: ${err}`);
        }
    }
};