// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    utility = require('../../utils/timeFormatter.js'),
    fetch = require('node-fetch'),
    subreddits = ["Animemes", "Animemes", "Animemes"],
    Command = require('../../structures/Command.js');

module.exports = class Animeme extends Command {
    constructor(bot) {
        super(bot, {
            name: 'animeme',
            dirname: __dirname,
            aliases: ['ameme', 'animememe', 'animemes', 'animememes', 'amemes', 'memes'],
            description: 'Generate an anime meme fetched from selected Subreddits.',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.UseExternalEmojis, Flags.AddReactions],
            usage: '<prefix><commandName>',
            cooldown: 5000,
            examples: [
                '/animeme',
                '.animeme',
                '!animeme',
                '?animemes'
            ],
            slash: true,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        var randSubreddit = subreddits[Math.round(Math.random() * (subreddits.length - 1))];

        fetch(`https://www.reddit.com/r/${randSubreddit}.json`).then(res => res.json()).then(data => {
            let info = []
            const res = data.data.children.filter(m => m.data.post_hint === 'image')
            res.forEach(post => {
                info.push({ title: post.data.title, up: post.data.ups, downs: post.data.downs, link: `https://www.reddit.com${post.data.permalink}`, image: post.data.url, upvote_ratio: post.data.upvote_ratio, created: post.data.created })
            })

            const reddit = info[Math.floor(Math.random() * (info.length - 1))]

            if (!reddit) return message.channel.error(settings.Language, 'ERROR_MESSAGE', `${message.translate('Animes/animeme:AMEMES_DESC')} r/${randSubreddit}`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

            const probability = reddit.upvote_ratio;
            const percentage = Math.round((probability * 100));
            const calc = reddit.up - (reddit.up * (percentage / 100));
            const newPercentage = 100 - percentage;

            const meme = new Embed(bot, message.guild)
                .setFooter({ text: `👍 ${utility.commatize(reddit.up)} (${utility.commatize(percentage)}% of upvotes) | 👎 ${utility.commatize(Math.round(calc.toFixed(2)))} (${utility.commatize(newPercentage)}% of downvotes)\n${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}` })
                .setColor(65475)
                .setTitle(reddit.title)
                .setURL(reddit.link)
                .setImage(reddit.image)

            return new Promise(async (resolve, reject) => {
                const sent = await message.channel.send({ embeds: [meme] })
                let reactions = ['👍', '👎', '😂', '😮', '😡'];
                for (let i = 0; i < reactions.length; i++) await sent.react(reactions[i]);
            })
        })
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = interaction.user;
        const channel = guild.channels.cache.get(interaction.channelId);

        try {
            // Get Interaction Message Data
            await interaction.deferReply();

            var randSubreddit = subreddits[Math.round(Math.random() * (subreddits.length - 1))];

            fetch(`https://www.reddit.com/r/${randSubreddit}.json`).then(res => res.json()).then(data => {
                let info = []
                const res = data.data.children.filter(m => m.data.post_hint === 'image')
                res.forEach(post => {
                    info.push({ title: post.data.title, up: post.data.ups, downs: post.data.downs, link: `https://www.reddit.com${post.data.permalink}`, image: post.data.url, upvote_ratio: post.data.upvote_ratio, created: post.data.created })
                })
    
                const reddit = info[Math.floor(Math.random() * (info.length - 1))]
    
                if (!reddit) return interaction.editReply({ embeds: [channel.error(guild.settings.Language, 'ERROR_MESSAGE', `${guild.translate('Animes/animeme:AMEMES_DESC')} r/${randSubreddit}`), true]}).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
    
                const probability = reddit.upvote_ratio;
                const percentage = Math.round((probability * 100));
                const calc = reddit.up - (reddit.up * (percentage / 100));
                const newPercentage = 100 - percentage;
    
                const meme = new Embed(bot, guild)
                    .setFooter({ text: `👍 ${utility.commatize(reddit.up)} (${utility.commatize(percentage)}% of upvotes) | 👎 ${utility.commatize(Math.round(calc.toFixed(2)))} (${utility.commatize(newPercentage)}% of downvotes)\n${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}` })
                    .setColor(65475)
                    .setTitle(reddit.title)
                    .setURL(reddit.link)
                    .setImage(reddit.image)
    
                return new Promise(async (resolve, reject) => {
                    const sent = await interaction.editReply({ embeds: [meme] })
                    let reactions = ['👍', '👎', '😂', '😮', '😡'];
                    for (let i = 0; i < reactions.length; i++) await sent.react(reactions[i]);
                })
            })
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
}