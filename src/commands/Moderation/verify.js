// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

function randomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class Verify extends Command {
    constructor(bot) {
        super(bot, {
            name: 'verify',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['verificar'],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles],
            description: 'Start a verification process on this server.',
            usage: 'verificar',
            usage: '<prefix><commandName>',
            examples: [
                '.verify'
            ],
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        let code = randomInteger(100000, 1000000);
        message.delete({ timeout: 1000 });
        let channel = message.guild.channels.cache.get(settings.VerificarCanal);
        let role = message.guild.roles.cache.get(settings.VerificarCargo);

        if (settings.VerificarOpção == 0) {
            message.channel.error('Moderation/verificar:VEF10', { prefix: settings.prefix })
        }
        if (settings.VerificarOpção == 1) {
            if (message.member.roles.cache.has(role.id)) {
                return message.channel.error('Moderation/verificar:VEF11').then(m => m.timedDelete({ timeout: 5000 }));
            }
            if (!role)
                return message.author.error('Moderation/verificar:VERIFICAR_MSGCANAL');
            if (!channel)
                return message.channel.error('Moderation/verificar:VERIFICAR_PRIVADO');
            let embed = new Embed(bot, message.guild)
                .setColor(16711709)
                .setDescription(
                    message.translate('Moderation/verificar:VERIFICAR_PRIVADO1', { prefix: settings.prefix })
                );
            if (message.channel !== channel) return message.channel.send({ embeds: [embed] });

            message.channel.send(message.translate('Moderation/verificar:VERIFICAR_PRIVADO2'))
                .then(m => m.timedDelete({ timeout: 3000 }));

            const embeb2 = new Embed(bot, message.guild)
                .setColor(16711709)
                .setTitle('Moderation/verificar:VERIFICAR_PRIVADO3')
                .setDescription(
                    message.translate('Moderation/verificar:VERIFICAR_PRIVADO4', { code: code })
                )
                .setFooter({ text: message.translate('Moderation/verificar:VERIFICAR_PRIVADO5') });
            let filter = m => m.author === message.author;

            message.author.send({ embeds: [embeb2] }).then(dmChannel => {

                dmChannel.channel.awaitMessages({ filter: filter, max: 1, time: 180000, errors: ["time"] }).then(collected => {
                    if ((collected.content = code)) {
                        if (!role)
                            return message.author.send(message.translate('Moderation/verificar:VERIFICAR_PRIVADO9'));

                        let user = message.member;
                        user.roles.add(role);
                        const embed = new Embed(bot, message.guild)
                            .setColor("GREEN")
                            .setDescription(message.translate('Moderation/verificar:VERIFICAR_PRIVADO10'));
                        return message.author.send({ embeds: [embed] });
                    }

                    if (collected.code != code) {
                        const embed = new Embed(bot, message.guild)
                            .setColor(16711709)
                            .setDescription(message.translate('Moderation/verificar:VERIFICAR_PRIVADO11'))
                            .setFooter({ text: message.translate('Moderation/verificar:VERIFICAR_PRIVADO12') });
                        return message.author.send({ embeds: [embed] });
                    }
                });
            });
        } else if (settings.VerificarOpção == 2) {
            message.delete();

            if (message.member.roles.cache.has(role.id)) {
                return message.channel.error('Moderation/verificar:VEF11').then(m => m.timedDelete({ timeout: 5000 }));
            }

            let embed = new Embed(bot, message.guild)
                .setColor(16711709)
                .setDescription(
                    message.translate('Moderation/verificar:VERIFICAR_PRIVADO1', { prefix: settings.prefix })
                );
            if (message.channel !== channel) return message.channel.send({ embeds: [embed] });
            const user = message.member;
            user.roles.add(role);
            const embed1 = new Embed(bot, message.guild)
                .setTitle('Moderation/verificar:VERIFICAR_MSGCANAL2')
                .setColor(16711709)
                .setDescription(message.translate('Moderation/verificar:VERIFICAR_MSGCANAL3', { guild: message.guild.name }))
                .setFooter({ text: message.translate('Moderation/verificar:VERIFICAR_MSGCANAL4') });
            return message.author.send({ embeds: [embed1] });
        }
    }
};
