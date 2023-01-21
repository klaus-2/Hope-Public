// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Encode extends Command {
    constructor(bot) {
        super(bot, {
            name: 'encode',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Encodes a message in binary code.',
            usage: '<prefix><commandName> <code>',
            examples: [
                'encode Hope is the best bot in the world <3'
            ],
            cooldown: 5000,
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0])
            return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        let encodedString = message.args
            .join(" ")
            .split("")
            .map(x => x.charCodeAt(0).toString(2))
            .join(" ");

        const embed = new Embed(bot, message.guild)
            .setDescription(encodedString)
            .setColor(16775424)
        message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    };
};    
