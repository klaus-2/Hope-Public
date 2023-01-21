// Dependências
const { publicServers } = require('../../database/models'),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class CriarDB extends Command {
    constructor(bot) {
        super(bot, {
            name: 'criardb',
            dirname: __dirname,
            ownerOnly: true,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'reportar um bug para o meu desenvolvedor.',
            usage: 'bug <mensagem>',
            examples: '.bug estou tentando usar o comando teste mas não está funcionando.',
            cooldown: 60000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        bot.guilds.cache.forEach(async (guild) => {
            await guild.updateGuild({ updatesChannel: guild.systemChannelId });

            //Se conecta a Database pelo ID do usuario
            const db = await publicServers.findOne({
                guildID: guild.id,
            });

            if (!db) {
                const novaDB = await publicServers.create({
                    enabled: false,
                    guildID: guild.id,
                    guildName: guild.name,
                    guildMembers: guild.memberCount,
                    guildIcon: guild.icon,
                    description: guild.description,
                });
                await novaDB.save().catch(() => {
                    // do nothing.
                });
            }
            //await guild.fetchSettings();
        })
        message.channel.send(`DBs criada com sucesso para todos servidores!`);
    }
};