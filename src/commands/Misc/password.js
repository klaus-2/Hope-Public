// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Password extends Command {
    constructor(bot) {
        super(bot, {
            name: 'password',
            aliases: ['senha'],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Generates a secure password.',
            usage: '<prefix><commandName>',
            examples: [
                '.password'
            ],
            cooldown: 5000,
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (!(/^\d+$/.test(message.args[0]))) { var length = 12 }
        else {
            if (message.args[0])
                if (message.args[0] > 75) var length = 12
                else var length = message.args[0];
            else var length = 12
        }
        let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!£$%&@#*)({}][;:~.>,<?",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        if (length < 8) var secure = message.translate('Misc/password:ESENHA_DESC')
        else if (length >= 14) var secure = message.translate('Misc/password:ESENHA_DESC1')
        else if (length >= 8) var secure = message.translate('Misc/password:ESENHA_DESC2')

        const embed = new Embed(bot, message.guild)
            .setTitle('Misc/password:ESENHA_DESC3')
            .addFields({ name: `${message.translate('Misc/password:ESENHA_DESC4')}`, value: `**\`${retVal}\`**`, inline: true },
                { name: `${message.translate('Misc/password:ESENHA_DESC5')}`, value: `${length}`, inline: true },
                { name: `${message.translate('Misc/password:ESENHA_DESC6')}`, value: `${secure}`, inline: true })
            .setFooter({ text: message.translate('Misc/password:ESENHA_DESC7') })

        const failed = new Embed(bot, message.guild)
            .setColor(16775424)
            .setTitle('Misc/password:ESENHA_DESC8')
            .setDescription(message.translate('Misc/password:ESENHA_DESC9'))
            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

        async function failf() {
            if (settings.ModerationClearToggle && message.deletable) message.delete();
            const fail = await message.channel.send(failed); setTimeout(() => { fail.delete() }, 6000)
        }

        const embedSuccess = new Embed(bot, message.guild)
            .setDescription('Your password has been generated and sent to your private! Please check.')

        message.reply({ embeds: [embedSuccess] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        message.author.send({ embeds: [embed] }).catch(() => failf())
    }
}