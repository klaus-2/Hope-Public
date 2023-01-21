// Dependências
const { Embed } = require(`../../utils`),
    { AttachmentBuilder } = require('discord.js'),
    { createCanvas, loadImage } = require('canvas'),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    canvas = createCanvas(600, 240),
    ctx = canvas.getContext('2d'),
    Command = require('../../structures/Command.js');

module.exports = class Banner extends Command {
    constructor(bot) {
        super(bot, {
            name: 'banner',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AttachFiles],
            description: 'Get a user\'s profile banner.',
            usage: '<prefix><commandName> [user]',
            examples: [
                '.banner',
                '.banner Klaus'
            ],
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        let user = message.mentions.members.first() || message.guild.members.cache.get(message.args[0]) || message.guild.members.cache.find(r => r.user.username === message.args[0]) || message.guild.members.cache.find(r => r.displayName === message.args[0] || message.author);

        // const bannerHash = await user.banner;

        if (!user.banner) {
            if (user.hexAccentColor) {
                ctx.fillStyle = user.hexAccentColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // const banner = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}${bannerHash ? ".gif" : ".png"}?size=4096`;

                let attachment
                attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'teste.png' });
                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Guild/banner:BANNER'), iconURL: message.guild.iconURL({ format: 'png', dynamic: true }) })
                    .setImage('attachment://teste.png')
                    .setDescription(message.translate('Guild/banner:BANNER1', { user: user.user }))
                    .setColor(user.hexAccentColor || 'RANDOM')
                message.channel.send({ embeds: [embed], files: [attachment] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            } else {
                return message.channel.error('Guild/banner:BANNER2').then(m => m.timedDelete({ timeout: 5000 }));
            }
        } else if (user.banner) {

            const banner = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png?size=4096`;

            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Guild/banner:BANNER'), iconURL: message.guild.iconURL({ format: 'png', dynamic: true }) })
                .setImage(banner)
                .setDescription(`${message.translate('Guild/banner:BANNER1', { user: user.user })}\n${message.translate('Guild/banner:BANNER3', { banner: banner })}`)
                .setColor(banner.hexAccentColor || 'RANDOM')
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        }
    }
};