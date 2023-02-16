// Dependências
const { Embed } = require(`../../utils`),
    Command = require('../../structures/Command.js');
const fetch = require('node-fetch');

module.exports = class BDSM extends Command {
    constructor(bot) {
        super(bot, {
            name: 'bdsm',
            nsfw: true,
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_WEBHOOKS'],
            description: 'Look NSFW images.',
            usage: 'bdsm',
            cooldown: 5000,
            slash: true,
        });
    }

    // Function for message command
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        var subreddits = [
            'BDSM',
            'Bondage',
            'BDSMCommunity',
            'bdsmgw',
            'femdom'
        ]

        var reddit = subreddits[Math.round(Math.random() * (subreddits.length - 1))];

        const data = await fetch(`https://meme-api.herokuapp.com/gimme/${reddit}`).then(res => res.json())

        if (!data) return message.channel.send(message.translate('misc:BIQUINI'));

        const { title, postLink, url, subreddit } = data

        /*const embed = new Embed(bot, message.guild)
          .setTitle(title)
          .setImage(url)
          .setColor(1)
    
        message.channel.send({ embeds: [embed] });*/
        const WebhookNames = ["Ahegao-chan", "MegaMilk", "Suzukawa Rei", "Shichijou Reika", "Mitarai Keiko", "Sakurai Erika", "Belfast", "Suzuhara Lulu", "Kiryuu Coco", "Sesshouin Kiara", "Kagura", "Kama", "Hero-chan", "Honoka", "Iris Lilith Vandella Carmen", "Christina Morgan", "Astolfo", "Takao", "Mei (Pokemon)", "Suomi kp31", "PA15", "Dola", "Weiss Schnee", "Baltimore", "Hyun-sung Seo", "Iris Yuma", "Kashima", "Bari", "Taihou", "Hamazake", "Godguard Brodia", "Miyamae Shiho", "Nijou Aki"]
        const WebhookAvatars = ["9xmBvv0", "waImdvo", "Z8tKkV7", "vSLv9bn", "e5L8mSo", "AkpcTPL", "LHmztxh", "bmEwo0n", "GeA9smM", "xXe89P2", "C24HDRq", "hUyIUqZ", "0qdfV2S", "up7vf1W", "mncvryw", "Ar7JUJ2", "Rdul8FL", "fdwdx4H", "UYBktZQ", "En3ilZ3", "rLqMUFr", "1diobww", "epuvobD", "4QakTZa", "ATwO2dY", "hkentp0", "ISSklge", "hMZ9zSl", "DBearj5", "8Su1c7B", "h8f0God", "dBN6nCu", "usasrUN"]
        const random = Math.floor(Math.random() * (WebhookNames.length - 1))

        return new Promise(async (resolve, reject) => {
            const webhooks = await bot.channels.fetch(message.channel.id).then(c => c.fetchWebhooks());
            let webhook = webhooks.find(wh => wh.name == bot.user.username);

            // cria o webhook se não existir
            if (!webhook) {
                webhook = await bot.channels.fetch(message.channel.id).then(c => c.createWebhook(bot.user.username, {
                    avatar: bot.user.displayAvatarURL({ format: 'png', size: 1024 }),
                }));
            }

            await webhook.send({
                username: WebhookNames[random],
                avatarURL: `https://i.imgur.com/${WebhookAvatars[random]}.gif`,
                content: url,
            });

            /*var hook = await message.channel.createWebhook(WebhookNames[random], { avatar: `https://i.imgur.com/${WebhookAvatars[random]}.gif`, reason: `command ${settings.prefix}cum by ${message.author.username}` })
            await hook.send(url).catch(err => message.channel.error('misc:ERROR_MESSAGE', { err: err.message }));
            setTimeout(async function () {
              await hook.delete()
            }, 30000);*/
        })
    }
    // Function for slash command
    async callback(bot, interaction, guild) {
        const channel = guild.channels.cache.get(interaction.channelId);

        var subreddits = [
            'BDSM',
            'Bondage',
            'BDSMCommunity',
            'bdsmgw',
            'femdom'
        ]

        var reddit = subreddits[Math.round(Math.random() * (subreddits.length - 1))];

        const data = await fetch(`https://meme-api.herokuapp.com/gimme/${reddit}`).then(res => res.json())

        if (!data) return interaction.reply({ embeds: [channel.error('misc:BIQUINI', true)], ephemeral: true });

        const { title, postLink, url, subreddit } = data

        /*const embed = new Embed(bot, guild)
          .setTitle(title)
          .setImage(url)
          .setColor(1)*/

        interaction.reply({ content: url, ephemeral: true });
    }
};