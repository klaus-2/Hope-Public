// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Snipe extends Command {
    constructor(bot) {
        super(bot, {
            name: 'snipe',
            dirname: __dirname,
            botPermissions: [Flags.ManageMessages, Flags.AttachFiles, Flags.ManageGuild],
            description: 'Capture a recently deleted message on the channel.',
            usage: 'snipe',
            usage: '<prefix><commandName>',
            examples: [
                '.snipe'
            ],
            cooldown: 5000,
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        const msg = bot.snipe.get(message.channel.id);
        if (!msg)
            return message.channel.error('Moderation/snipe:SNIPE').then(m => m.timedDelete({ timeout: 5000 }));

        const embed = new Embed(bot, message.guild)
            .setAuthor({ name: message.translate('Moderation/snipe:SNIPE1') })
            .setDescription(message.translate('Moderation/snipe:SNIPE2', { author: msg.author, content: msg.content || 'None' }))
            .setTimestamp();

        if (msg.image) embed.setImage(msg.image);
        message.channel.send({ embeds: [embed] }).then(m => {
            //m.react("✅");
            m.react("❌");
            const filter = (reaction, user) => {
                return (
                    ["❌"].includes(reaction.emoji.name) &&
                    user.id === message.author.id
                );
            };

            m.awaitReactions({ filter: filter, max: 1, time: 300000, errors: ["time"] }).then(collected => {
                const reaction = [...collected.values()][collected.size - 1]

                //if (!reaction.message.guild) return; // If the user was reacting something but not in the guild/server, ignore them.

                if (reaction.emoji.name === "❌") {
                    m.delete();
                }
            })
        })
    }
};