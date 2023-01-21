// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class PressF extends Command {
    constructor(bot) {
        super(bot, {
            name: 'f',
            dirname: __dirname,
            description: "Pays his respects",
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            usage: 'f',
            examples: ['f'],
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        
        const target = message.mentions.users.first();

        if (!target) {
            message.delete().catch(() => { });
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: `${message.author.username} ${message.translate('Fun/f:F')}`, iconURL: message.author.displayAvatarURL({ format: 'png' }) })
                .setColor(16279836)
                .setFooter({ text: message.translate('Fun/f:F1') });
            message.channel.send({ embeds: [embed] }).then(m => m.react('🇫')).catch(() => { });
        } else {
            message.delete().catch(() => { });
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: '\u2000', iconURL: message.author.displayAvatarURL({ format: 'png' }) })
                .setColor(16279836)
                .setDescription(`${message.author} ${message.translate('Fun/f:F2')} ${target}`)
                .setFooter({ text: message.translate('Fun/f:F3') });
            message.channel.send({ embeds: [embed] }).then(m => m.react('🇫')).catch(() => { });
        }
    }
};