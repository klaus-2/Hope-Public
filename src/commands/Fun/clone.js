// Dependências
const { PermissionsBitField: { Flags } } = require('discord.js'),
    { getMember } = require('../../utils/functions'),
    Command = require('../../structures/Command.js');

module.exports = class Clone extends Command {
    constructor(bot) {
        super(bot, {
            name: 'clone',
            aliases: ['clonar'],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageWebhooks],
            description: 'Make a bot of the user making him speak a pre-defined text by you.',
            usage: '<prefix><commandName> <user> <message>',
            cooldown: 5000,
            examples: [
                '.clone @Klaus hello',
                '!clone @Hope Hey @Klaus I like u <33',
                '?clonar @Faith Tsc..'
            ],
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Fun/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Fun/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Fun/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Fun/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        let ment = getMember(message, message.args[0])
        const webhook = await message.channel.createWebhook({ name: ment.displayName, avatar: ment.user.displayAvatarURL(), reason: `${settings.prefix}clone command used by ${message.author.username}` })
        await webhook.send(`${message.args.slice(1).join(" ")}`)
        webhook.delete(`command ${settings.prefix}clone used by ${message.author.username}`)
    }
}