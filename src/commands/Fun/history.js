// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    fetch = require('node-fetch'),
    Command = require('../../structures/Command.js');

module.exports = class History extends Command {
    constructor(bot) {
        super(bot, {
            name: 'history',
            dirname: __dirname,
            aliases: ['historia'],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Get a random historical fact of the day.',
            usage: '<prefix><commandName>',
            cooldown: 3000,
            examples: [
                '.history',
                '!historia'
            ]
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        const info3 = message.translate('Fun/history:FHIST_DESC2');
        fetch("http://history.muffinlabs.com/date").then(res => res.json()).then(json => {
            var i = Math.floor(Math.random() * (json.data.Events.length - 1));
            const embed = new Embed(bot, message.guild)
                .setDescription(`[${(json.date) ? json.date : `Today`}](${json.url ? json.url : `https://placeholder.com`})\n\n${info3}** ${json.data.Events[i].year}**\n\n${json.data.Events[i].text}`)
                .setImage(json.url)
                .setColor(16279836)
                .setFooter({ text: message.translate('Fun/history:FHIST_DESC') });
            return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
        }).catch(() => {
            message.channel.send(message.translate('Fun/history:FHIST_DESC1')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        })
    }
}