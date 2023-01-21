// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Parser = require('rss-parser'),
    Command = require('../../structures/Command.js');

module.exports = class SeaofThieves extends Command {
    constructor(bot) {
        super(bot, {
            name: 'seaofthieves',
            dirname: __dirname,
            aliases: ['sot'],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Displays information about Sea of Thieves',
            usage: '<prefix><commandName>',
            examples: [
                '.seaofthieves',
                '!sot'
            ],
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0]) {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: { user: bot.user.username } }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                .setThumbnail('https://i.redd.it/3nh610set8711.jpg')
                .setTitle('Games/seaofthieves:SOT1')
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT2'))
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'patch') {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                .setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                .setTitle('Games/seaofthieves:SOT3')
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT4'))
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            //if (settings.ModerationClearToggle && message.deletable) message.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'pesca' || message.args[0] == 'fish') {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                .setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                .setTitle('Games/seaofthieves:SOT5')
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT6'))
                .setImage('https://cdn.discordapp.com/attachments/649376794595688515/649795434910318614/KDSLDFH.png')
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            //if (settings.ModerationClearToggle && message.deletable) message.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'lorota' || message.args[0] == 'talltales') {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                .setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                .setTitle('Games/seaofthieves:SOT7')
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT8'))
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            //if (settings.ModerationClearToggle && message.deletable) message.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'promo') {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                .setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                .setTitle('Games/seaofthieves:SOT9')
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT10'))
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            //if (settings.ModerationClearToggle && message.deletable) message.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'insider') {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                .setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                .setTitle('Games/seaofthieves:SOT11')
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT12'))
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            //if (settings.ModerationClearToggle && message.deletable) message.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'enigma' || message.args[0] == 'riddle') {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                .setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                .setTitle('Games/seaofthieves:SOT13')
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT14'))
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            //if (settings.ModerationClearToggle && message.deletable) message.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'mapa' || message.args[0] == 'map') {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                //.setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                .setImage('https://i.imgur.com/IZOoStV.png')
                .setColor(13210623)
                .setTitle('Games/seaofthieves:SOT15')
                .setDescription(message.translate('Games/seaofthieves:SOT16'))
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            //if (settings.ModerationClearToggle && message.deletable) message.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'wanda') {
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                .setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                .setTitle('Games/seaofthieves:SOT17')
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT18'))
                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
            //if (settings.ModerationClearToggle && message.deletable) message.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'thief') {
            let parser = new Parser();
            let feed = await parser.parseURL('https://rarethief.com/feed/');
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT19'), iconURL: `https://rarethief.com/wp-content/uploads/2019/03/cropped-Rare-Thief-Logo-Favicon-32x32.png` }) //description
                .setThumbnail('https://rarethief.com/wp-content/uploads/2019/03/Rare-Thief-Logo-1.png')
                .addField(`${feed.items[0].title}`, `[${message.translate('Games/seaofthieves:SOT20')}](${feed.items[0].link})`, true)
                .addField(`${feed.items[1].title}`, `[${message.translate('Games/seaofthieves:SOT20')}](${feed.items[1].link})`, true)
                .addField(`${feed.items[2].title}`, `[${message.translate('Games/seaofthieves:SOT20')}](${feed.items[2].link})`, true)
                .addField(`${feed.items[3].title}`, `[${message.translate('Games/seaofthieves:SOT20')}](${feed.items[3].link})`, true)
                .addField(`${feed.items[4].title}`, `[${message.translate('Games/seaofthieves:SOT20')}](${feed.items[4].link})`, true)
                .addField(`${feed.items[5].title}`, `[${message.translate('Games/seaofthieves:SOT20')}](${feed.items[5].link})`, true)
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT21'))
                .setFooter({ text: message.translate('Games/seaofthieves:SOT22', { feed: feed.lastBuildDate }) })
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'noticias') {
            const r = await message.channel.send(message.translate('Games/seaofthieves:SOT23'));
            const info4 = message.translate('Games/seaofthieves:SOT25');
            const info5 = message.translate('Games/seaofthieves:SOT26');
            let parser = new Parser();
            let feed = await parser.parseURL('https://www.arenaxbox.com.br/tag/sea-of-thieves/feed/');
            let aut = await parser.parseURL('https://www.arenaxbox.com.br/tag/sea-of-thieves/feed/'); //https://www.arenaxbox.com.br/tag/sea-of-thieves/feed/
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Games/seaofthieves:SOT24'), iconURL: `https://www.arenaxbox.com.br/wp-content/uploads/2019/05/cropped-arena-otimizado-quadrado-32x32.png` }) //description
                .setThumbnail('https://www.arenaxbox.com.br/wp-content/uploads/2019/10/newarenalogo.png')
                .addField(`${feed.items[0].title}`, `[${info4}](${feed.items[0].link}) - ${info5} **${aut.items[0].creator}**`)
                .addField(`${feed.items[1].title}`, `[${info4}](${feed.items[1].link}) - ${info5} **${aut.items[0].creator}**`)
                .addField(`${feed.items[2].title}`, `[${info4}](${feed.items[2].link}) - ${info5} **${aut.items[0].creator}**`)
                .addField(`${feed.items[3].title}`, `[${info4}](${feed.items[3].link}) - ${info5} **${aut.items[0].creator}**`)
                .addField(`${feed.items[4].title}`, `[${info4}](${feed.items[4].link}) - ${info5} **${aut.items[0].creator}**`)
                .addField(`${feed.items[5].title}`, `[${info4}](${feed.items[5].link}) - ${info5} **${aut.items[0].creator}**`)
                .setColor(13210623)
                .setDescription(message.translate('Games/seaofthieves:SOT27'))
                .setFooter({ text: message.translate('Games/seaofthieves:SOT28', { feed: { feed: feed.lastBuildDate } }) })
            r.delete();
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'status') {
            let parser = new Parser();
            let feed = await parser.parseURL('http://fetchrss.com/rss/609066c000ed92641a069f92609066b8f8249e3a1412dd62.xml');
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: `${feed.title}`, iconURL: `https://i.redd.it/3nh610set8711.jpg` }) //description
                .setThumbnail('https://i.redd.it/3nh610set8711.jpg')
                .setDescription(`${feed.items[0].title}.`)
                .setColor(13210623)
                .setFooter({ text: message.translate('Games/seaofthieves:SOT28', feed.pubDate) })
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (message.args[0] == 'news') {
            const info4 = message.translate('Games/seaofthieves:SOT25');
            let parser = new Parser();
            let feed = await parser.parseURL('https://rss.../feeds/nYHvmbwAqeIfKRll.xml');
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: `${feed.title}`, iconURL: `https://www.seaofthieves.com/favicon.ico` }) //description
                .setThumbnail('https://i.redd.it/3nh610set8711.jpg')
                //.setDescription(`${feed.items[0].title}.\n${feed.items[0].content}\n${feed.items[0].link}\n${feed.items[1].title}`)
                .addField(`${feed.items[0].title}`, `[${info4}](${feed.items[0].link})\n${feed.items[0].content}`)
                .addField(`${feed.items[1].title}`, `[${info4}](${feed.items[1].link})\n${feed.items[1].content}`)
                .addField(`${feed.items[2].title}`, `[${info4}](${feed.items[2].link})\n${feed.items[2].content}`)
                .addField(`${feed.items[3].title}`, `[${info4}](${feed.items[3].link})\n${feed.items[3].content}`)
                .addField(`${feed.items[4].title}`, `[${info4}](${feed.items[4].link})\n${feed.items[4].content}`)
                .addField(`${feed.items[5].title}`, `[${info4}](${feed.items[5].link})\n${feed.items[5].content}`)
                .setColor(13210623)
                .setFooter({ text: message.translate('Games/seaofthieves:SOT28', feed.pubDate) })
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        }
    }
};
