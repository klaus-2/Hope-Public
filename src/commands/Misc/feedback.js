// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Feedback extends Command { // fazer pra enviar o feedback a um canal de aprovação
    constructor(bot) {
        super(bot, {
            name: 'feedback',
            dirname: __dirname,
            usage: '<prefix><commandName> <star> <feedback>',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Leave feedback on Hope\'s server about her.',
            examples: [
                '.feedback 5 Hope is an excellent bot that meets all requirements on my server'
            ],
            cooldown: 60000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        let feedbackchannel = bot.channels.cache.get('830246691625238560');
        let feednumber = message.content.split(" ").slice(1)
        let feedstr = message.content.split(" ").slice(2).join(" ");
        let feednumber1 = parseInt(feednumber)
        if (!feedstr) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        if (!feednumber1 || isNaN(parseInt(feednumber)) || parseInt(feednumber) <= 0 || parseInt(feednumber) > 5) return message.channel.send(`:x:`)
        if (feednumber1 > 5) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        let stararray = []
        for (var i = 0; i < feednumber1; i++) {
            stararray.push("⭐")
        }
        const embed = new Embed(bot, message.guild)
            .setTitle('Misc/feedback:EFEED_DESC')
            .addFields({ name: message.translate('Misc/feedback:EFEED_DESC1'), value: `${stararray.join("")}`, inline: false },
                { name: message.translate('Misc/feedback:EFEED_DESC2'), value: `${feedstr}`, inline: false },
                { name: message.translate('Misc/feedback:EFEED_DESC3'), value: `${message.author}`, inline: false })
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor(16775424)
            .setFooter({ text: message.translate('Misc/feedback:EFEED_DESC4', { prefix: settings.prefix }) });
        await feedbackchannel.send({ embeds: [embed] })
        await message.channel.send(message.translate('Misc/feedback:EFEED_DESC5')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
}