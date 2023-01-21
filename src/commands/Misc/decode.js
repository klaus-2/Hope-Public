// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Decode extends Command {
    constructor(bot) {
        super(bot, {
            name: 'decode',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Decode a binary code.',
            usage: '<prefix><commandName> <code>',
            examples: [
                'decode 1010011 1101011 1111001 1100101 100000 11101001 100000 1100001 100000 1101101 1100101 1101100 1101000 1101111 1110010 100000 1100010 1101111 1110100 100000 1100100 1101111 100000 1101101 1110101 1101110 1100100 1101111 100000 10011101100100 1111111000001111'
            ],
            cooldown: 5000,
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0])
            return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        if (
            message.args
                .map(x => {
                    if (isNaN(parseInt(x))) return "true"
                    else return "false"
                })
                .includes("true")
        )
            return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        let decodedString = message.args
            .map(x => {
                return String.fromCharCode(parseInt(x, 2))
            })
            .join("")
        let decodedEmbed = new Embed(bot, message.guild)
            .setDescription(decodedString)
            .setColor(16775424)
        //.setTimestamp()
        //.setFooter(`${trans1} ${trans2}decode <codigo>`, `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}`)   
        message.channel.send({ embeds: [decodedEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
};
