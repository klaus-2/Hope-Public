// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js'),
    { Aki } = require("aki-api"),
    emojis = ["👍", "👎", "❔", "🤔", "🙄", "❌"],
    isPlaying = new Set();

module.exports = class Hopenator extends Command {
    constructor(bot) {
        super(bot, {
            name: 'hopenator',
            aliases: ['hopenator'],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
            description: 'Hope can read your mind and tell which character you\'re thinking of by asking a few questions.',
            usage: '<prefix><commandName>',
            examples: [
                '.hopenator',
                '!akinator'
            ],
            cooldown: 5000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        //MSG
        const sendMsg = await message.channel.send(message.translate('Fun/hopenator:FNATOR_DESC'));
        //AKI
        const region = message.translate('Fun/hopenator:FNATOR_DESC11');
        const aki = new Aki({ region }); // Full languages list at: https://github.com/jgoralcz/aki-api
        await aki.start();
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        sendMsg.delete();
        if (isPlaying.has(message.author.id)) {
            return message.channel.send(message.translate('Fun/hopenator:FNATOR_DESC1')).then(m => m.timedDelete({ timeout: 10000 }));
        }

        isPlaying.add(message.author.id);

        const msg = await message.channel.send({
            embeds: [new Embed(bot, message.guild)
                .setAuthor({ name: `${message.author.username}, ${message.translate('Fun/hopenator:FNATOR_DESC2')} ${aki.currentStep + 1} ${message.translate('Fun/hopenator:FNATOR_DESC3')}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                .setColor(16279836)
                .setTimestamp()
                .setThumbnail("https://i.imgur.com/UH1StAo.png")
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                .setDescription(`**${aki.question}**\n\n${message.translate('Fun/hopenator:FNATOR_DESC4')}\n${aki.answers.map((x, i) => `${x} | ${emojis[i]}`).join("\n")}`)]
        });

        for (const emoji of emojis) await msg.react(emoji);

        const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id == message.author.id;
        const collector = msg.createReactionCollector({ filter: filter, time: 60000 * 6 });

        collector
            .on("end", () => isPlaying.delete(message.author.id))
            .on("collect", async ({
                emoji,
                users
            }) => {
                users.remove(message.author).catch(() => null);

                if (emoji.name == "❌") return collector.stop();

                await aki.step(emojis.indexOf(emoji.name));

                if (aki.progress >= 70 || aki.currentStep >= 78) {

                    await aki.win();

                    collector.stop();

                    message.channel.send({
                        embeds: [new Embed(bot, message.guild)
                            .setAuthor({ name: message.translate('Fun/hopenator:FNATOR_DESC5'), iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                            .setDescription(`**${aki.answers[0].name}**\n${aki.answers[0].description}\n${message.translate('Fun/hopenator:FNATOR_DESC6')} **#${aki.answers[0].ranking}**\n\n${message.translate('Fun/hopenator:FNATOR_DESC7')}`)
                            .setImage(aki.answers[0].absolute_picture_path)
                            .setColor(16279836)]
                    }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

                    const filter = m => /(sim|não|s|n|no|yes|y)/i.test(m.content) && m.author.id == message.author.id;

                    message.channel.awaitMessages({ filter: filter, max: 1, time: 30000, errors: ["time"] })
                        .then(collected => {
                            const isWinner = /yes|y|sim|s/i.test(collected.first().content);
                            message.channel.send({
                                embeds: [new Embed(bot, message.guild)
                                    .setTitle(isWinner ? message.translate('Fun/hopenator:FNATOR_DESC8') : message.translate('Fun/hopenator:FNATOR_DESC9'))
                                    .setColor(16279836)
                                    .setDescription(message.translate('Fun/hopenator:FNATOR_DESC10'))]
                            }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        }).catch(() => null);

                } else {
                    const rando_imgs = [
                        'https://i.imgur.com/UH1StAo.png',
                        'https://i.imgur.com/8R3QU2V.png',
                        'https://i.imgur.com/cGD0yfH.png',
                        'https://i.imgur.com/ONDM4s9.png',
                    ]
                    msg.edit({
                        embeds: [new Embed(bot, message.guild)
                            .setAuthor({ name: `${message.author.username}, ${message.translate('Fun/hopenator:FNATOR_DESC2')} ${aki.currentStep + 1} ${message.translate('Fun/hopenator:FNATOR_DESC3')}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                            .setColor(16279836)
                            .setThumbnail(rando_imgs[Math.floor(Math.random() * rando_imgs.length)])
                            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                            .setDescription(`**${aki.question}**\n\n${message.translate('Fun/hopenator:FNATOR_DESC4')}\n${aki.answers.map((x, i) => `${x} | ${emojis[i]}`).join("\n")}`)]
                    });
                }
            });
        collector.on("end", () => {
            isPlaying.delete(message.author.id);
            msg.delete({ timeout: 1000 }).catch(() => { });
        })
    }
};