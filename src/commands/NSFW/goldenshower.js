// Dependências
const { Embed } = require(`../../utils`),
    Command = require('../../structures/Command.js');
const utility = require('../../utils/timeFormatter.js')
const fetch = require('node-fetch')
const subreddits = [
    'Pee',
    'watersports',
    'cuckoldcaptions',
    'wetfetish',
    'GayWatersports',
    'AsianPee'
];

module.exports = class GoldenShower extends Command {
    constructor(bot) {
        super(bot, {
            name: 'goldenshower',
            aliases: ['watersports', 'esportesaquaticos'],
            nsfw: true,
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_WEBHOOKS'],
            description: 'Look at NSFW images.',
            usage: 'goldenshower',
            cooldown: 5000,
            slash: true,
        });
    }

    // Executar comando
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        var randSubreddit = subreddits[Math.round(Math.random() * (subreddits.length - 1))];

        fetch(`https://www.reddit.com/r/${randSubreddit}.json`).then(res => res.json()).then(data => {
            let info = []
            const res = data.data.children.filter(m => m.data.post_hint === 'image')
            res.forEach(post => {
                info.push({ title: post.data.title, up: post.data.ups, downs: post.data.downs, link: `https://www.reddit.com${post.data.permalink}`, image: post.data.url })
            })

            const reddit = info[Math.floor(Math.random() * (info.length - 1))]
            //console.log(reddit)

            if (!reddit) return message.channel.error('misc:ERROR_MESSAGE', `Falha em r/${randSubreddit}`);

            /*const meme = new Embed(bot, message.guild)
                .setFooter(`${utility.commatize(reddit.up)}👍 | ${utility.commatize(reddit.downs)}👎`)
                .setColor(1)
                .setTitle(reddit.title)
                .setImage(reddit.image).setTimestamp()

            return new Promise(async (resolve, reject) => {
                await message.channel.send({ embeds: [meme] })
            })*/
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
                    content: reddit.image,
                });

                /*var hook = await message.channel.createWebhook(WebhookNames[random], { avatar: `https://i.imgur.com/${WebhookAvatars[random]}.gif`, reason: `command ${settings.prefix}goldenshower by ${message.author.username}` })
                await hook.send(reddit.image).catch(err => message.channel.error('misc:ERROR_MESSAGE', { err: err.message }));
                setTimeout(async function () {
                    await hook.delete()
                }, 30000);*/
            })
        })
    }
    // Function for slash command
    async callback(bot, interaction, guild) {
        const channel = guild.channels.cache.get(interaction.channelId);

        var randSubreddit = subreddits[Math.round(Math.random() * (subreddits.length - 1))];

        fetch(`https://www.reddit.com/r/${randSubreddit}.json`).then(res => res.json()).then(data => {
            let info = []
            const res = data.data.children.filter(m => m.data.post_hint === 'image')
            res.forEach(post => {
                info.push({ title: post.data.title, up: post.data.ups, downs: post.data.downs, link: `https://www.reddit.com${post.data.permalink}`, image: post.data.url })
            })

            const reddit = info[Math.floor(Math.random() * (info.length - 1))]
            //console.log(reddit)

            if (!reddit) return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', `Falha em r/${randSubreddit}`, true)], ephemeral: true });

            /*const meme = new Embed(bot, guild)
                .setFooter(`${utility.commatize(reddit.up)}👍 | ${utility.commatize(reddit.downs)}👎`)
                .setColor(1)
                .setTitle(reddit.title)
                .setImage(reddit.image).setTimestamp()*/

            return new Promise(async (resolve, reject) => {
                await interaction.reply({ content: reddit.image, ephemeral: true });
            })
        })
    }
};