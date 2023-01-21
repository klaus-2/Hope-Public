// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Nuke extends Command {
    constructor(bot) {
        super(bot, {
            name: 'nuke',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['limpar'],
            userPermissions: [Flags.ManageGuild],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageMessages],
            description: 'Clears all messages in a channel at once.',
            usage: '<prefix><commandName> [reason]',
            examples: [
                '.nuke',
                '.nuke only testing',
                '!limpar'
            ],
            cooldown: 60000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        let reason = message.args.join(" ") || message.translate('misc:NO_REASON');
        if (!message.channel.deletable) {
            return message.reply(message.translate('Moderation/nuke:LIMPAR'))
        }
        let newchannel = await message.channel.clone()
        await message.channel.delete()
        let embed = new Embed(bot, message.guild)
            .setTitle('Moderation/nuke:LIMPAR1', { channel: newchannel.id })
            .setDescription(reason)
            .setColor(16711709)
            .setImage('https://cdn.discordapp.com/attachments/811143476522909718/819507596302090261/boom.gif')
        await newchannel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
}