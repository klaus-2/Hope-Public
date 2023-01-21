// Dependências
const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ChannelType, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ActionRowBuilder, GuildEmoji } = require('discord.js'),
    { Embed } = require(`../../utils`),
    { AutoAnimes } = require('../../database/models/index'),
    { fetch } = require('undici'),
    _ = require('lodash'),
    watching = require('require-text')(`${process.cwd()}/assets/graphql/Watching.graphql`, require),
    Page = require(`../../structures/Paginate`),
    text = require(`../../utils/string`),
    Command = require('../../structures/Command.js');

module.exports = class AutoAnime extends Command {
    constructor(bot) {
        super(bot, {
            name: 'autoanimes',
            aliases: ['aa'],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
            userPermissions: [Flags.SendMessages, Flags.ManageGuild],
            description: 'Manages and configures the Auto-Animes addon.',
            usage: '<prefix><commandName> <option>',
            examples: [
                '/autoanimes',
                '.autoanimes add One piece',
                '/autoanimes remove Boku no hero',
                '.autoanimes list',
                '!autoanimes channel',
                '/autoanimes role'
            ],
            cooldown: 3000,
            slash: true,
            options: [{
                name: 'action',
                description: 'Choose an option',
                type: ApplicationCommandOptionType.String,
                choices: [...['add', 'remove', 'list', 'channel', 'role'].map(type => ({ name: type, value: type }))].slice(0, 24),
                required: true,
            }, {
                name: 'anime',
                description: 'Enter the name of the anime',
                type: ApplicationCommandOptionType.String,
                required: false,
            }, {
                name: 'channel',
                description: 'Choose the target channel',
                type: ApplicationCommandOptionType.Channel,
                required: false,
            }, {
                name: 'role',
                description: 'Choose the target role',
                type: ApplicationCommandOptionType.Role,
                channelTypes: [ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildForum],
                required: false,
            }],
        });
    }

    /** ------------------------------------------------------------------------------------------------
    * EXECUTA O COMANDO @AUTOANIMES
    * ------------------------------------------------------------------------------------------------ */
    async run(bot, message, settings) {

        if (settings.ModerationClearToggle && message.deletable) message.delete();

        let embed, aniQuery, query, getAnimes, row;
        let db = await AutoAnimes.findOne({ _id: message.guild.id });
        if (!db) {
            const newSettings = new AutoAnimes({
                _id: message.guild.id
            });
            await newSettings.save().catch(() => { });
            db = await AutoAnimes.findOne({ _id: message.guild.id });
        }

        switch (message.args[0]) {
            case 'add':
                aniQuery = message.content.split(' ').slice(2);

                query = `query {
                    Page(perPage: 1) {
                      media(type: ANIME, format: TV, sort: POPULARITY_DESC, search: "${aniQuery}", status: RELEASING) {
                        id
                          title {
                          english,
                            userPreferred,
                            native,
                            romaji
                        }
                        popularity
                          coverImage {
                          large
                        }
                      }
                    }
                  }`
                getAnimes = await getAllAnimes(query);
                // console.log(getAnimes.data.Page.media)

                if (getAnimes.data.Page.media[0]) {
                    embed = new Embed(bot, message.guild)
                        .setTitle(`Hope Auto-Animes`)
                        .setThumbnail('https://i.imgur.com/1NMudBy.png')
                        .setColor(16722829)
                        .setDescription(`The anime **${getAnimes.data.Page.media[0]?.title.english}** \`(${getAnimes.data.Page.media[0]?.title.romaji ?? getAnimes.data.Page.media[0]?.title.native})\` has been successfully added to the watch list.`)
                        .setFooter({ text: `To see the current watch list of animes on this server, use ${settings.prefix}autoanimes list` })

                    if (db.animes.includes(getAnimes.data.Page.media[0].id)) return message.channel.error(`Uh-oh! You have already added **${getAnimes.data.Page.media[0]?.title.english}** to the watchlist. To see the current list, use **${settings.prefix}autoanimes list**`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                    db.animes.push(getAnimes.data.Page.media[0].id);
                    await db.save().catch(() => { });

                    message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                } else {
                    embed = new Embed(bot, message.guild)
                        .setTitle(`Hope Auto-Animes`)
                        .setThumbnail('https://i.imgur.com/67BZzuG.png')
                        .setColor(16722829)
                        .setDescription(`Uh-oh! Sorry, but I couldn't find this anime.\nPlease **check** if the *anime name* is correct, or if the anime is still **on air**, and try again!`)
                        .setFooter({ text: `If you have questions, join the support server for help.` })

                    message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                }
                break;

            case 'remove':
                aniQuery = message.content.split(' ').slice(2);

                query = `query {
                    Page(perPage: 1) {
                      media(type: ANIME, format: TV, sort: POPULARITY_DESC, search: "${aniQuery}", status: RELEASING) {
                        id
                          title {
                          english,
                            userPreferred,
                            native,
                            romaji
                        }
                        popularity
                          coverImage {
                          large
                        }
                      }
                    }
                  }`
                getAnimes = await getAllAnimes(query);
                // console.log(getAnimes.data.Page.media)

                if (getAnimes.data.Page.media[0]) {
                    if (db.animes.includes(getAnimes.data.Page.media[0].id)) {
                        embed = new Embed(bot, message.guild)
                            .setTitle(`Hope Auto-Animes`)
                            .setThumbnail('https://i.imgur.com/1NMudBy.png')
                            .setColor(65286)
                            .setDescription(`The anime **${getAnimes.data.Page.media[0]?.title.english}** \`(${getAnimes.data.Page.media[0]?.title.romaji ?? getAnimes.data.Page.media[0]?.title.native})\` has been successfully removed from the watch list.`)
                            .setFooter({ text: `To see the current watch list of animes on this server, use ${settings.prefix}autoanimes list` })

                        var arr = db.animes;
                        for (var i = 0; i < arr.length; i++) {
                            // console.log(arr[i].toString() === getAnimes.data.Page.media[0].id.toString())
                            // console.log(arr[i])
                            // console.log(getAnimes.data.Page.media[0].id.toString())
                            if (arr[i].toString() === getAnimes.data.Page.media[0].id.toString()) {
                                // console.log('aq')
                                arr.splice(i, 1);
                            }
                        }

                        await db.save().catch(() => { });

                        message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                    } else {
                        embed = new Embed(bot, message.guild)
                            .setTitle(`Hope Auto-Animes`)
                            .setThumbnail('https://i.imgur.com/67BZzuG.png')
                            .setColor(16711711)
                            .setDescription(`Uh-oh! Sorry, but I couldn't find this anime.\nPlease **check** with the command **${settings.prefix}autoanimes list** if the *anime name* is correct and try again!`)
                            .setFooter({ text: `If you have questions, join the support server for help.` })

                        message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                    }
                } else {
                    embed = new Embed(bot, message.guild)
                        .setTitle(`Hope Auto-Animes`)
                        .setThumbnail('https://i.imgur.com/67BZzuG.png')
                        .setColor(16711711)
                        .setDescription(`Uh-oh! Sorry, but I couldn't find this anime.\nPlease **check** if the *anime name* is correct, or if the anime is still **on air**, and try again!`)
                        .setFooter({ text: `If you have questions, join the support server for help.` })

                    message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                }
                break;

            case 'list':
                AutoAnimes.findById(message.guild.id, async (err, doc) => {

                    if (err) {
                        return message.channel.error(`Uh-oh! There was a small problem running this command. Please try again or seek help at [support server](${bot.config.SupportServer.link})!\n*Error reference: ${err.name}*`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                    } else if (!doc) {
                        doc = new AutoAnimes({ _id: message.guild.id });
                    };

                    const embed = new Embed(bot, message.guild)
                        .setColor(16711711)
                        .setFooter({ text: `Powered by hopebot.top` })

                    const anischedch = message.guild.channels.cache.get(doc.channelID);

                    if (!anischedch) {
                        return message.channel.error(`Uh-oh! Sorry, but the Auto-Animes addon is disabled. Please activate it and try again or seek help at [support server](${bot.config.SupportServer.link})!`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                    } else if (!doc.animes.length) {
                        return message.channel.send(
                            embed.setAuthor({ name: 'No Subscription', iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
                                .setDescription(`Uh-oh, this server has no Auto-Animes entries yet. Please add an anime using the command **${settings.prefix}autoanimes add <anime name>**`)
                        ).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                    } else {
                        const entries = [];
                        const watched = doc.animes;
                        let page = 0
                        let hasNextPage = false;

                        do {
                            const res = await getAllAnimes(watching, { watched, page });

                            if (res.errors) {
                                return message.channel.send(
                                    embed.setAuthor({ name: 'AniList Error', iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
                                        .setDescription('Received error from anilist:\n' + errors.map(x => x.message).join('\n') + `\nPlease wait a few minutes and try again or seek help at [support server](${bot.config.SupportServer.link})!`)
                                );
                            } else if (!entries.length && !res.data.Page.media.length) {
                                return message.channel.send(
                                    embed.setAuthor({ name: 'No Subscription', iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
                                        .setDescription(`Uh-oh, this server has no Auto-Animes entries yet. Please add an anime using the command **${settings.prefix}autoanimes add <anime name>**`)
                                ).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                            } else {
                                page = res.data.Page.pageInfo.currentPage + 1;
                                hasNextPage = res.data.Page.pageInfo.hasNextPage;
                                entries.push(...res.data.Page.media.filter(x => x.status === 'RELEASING'));
                            };
                        } while (hasNextPage);

                        const chunks = entries.sort((A, B) => A.id - B.id).map(entry => {
                            const id = ' '.repeat(6 - String(entry.id).length) + String(entry.id);
                            const title = text.truncate(entry.title.romaji, 42, '...');
                            return `•\u2000\u2000\`[ ${id} ]\` [**${title}**](${entry.siteUrl})`;
                        });
                        const descriptions = _.chunk(chunks, 20).map(d => d.join('\n'));

                        const pages = new Page(descriptions.map((d, i) => {
                            return new Embed(bot, message.guild)
                                .setColor(16056064)
                                .setDescription(d)
                                .setTitle(`Current Hope Auto-Animes Subscription (${entries.length} entries!)`)
                                .setFooter({ text: `Auto-Animes list\u2000\u2000•\u2000\u2000Page ${i + 1} of ${descriptions.length}\u2000\u2000•\u2000\u2000Powered by hopebot.top` })
                                .addFields({
                                    name: 'Tips', value: [
                                        `- Use \`${settings.prefix}autoanimes add\` to add subscription`,
                                        `- Use \`${settings.prefix}autoanimes remove\` to remove subscription`,
                                        `- Use \`${settings.prefix}nextairdate <anime title>\` to check episode countdown`
                                    ].join('\n'), inline: true
                                })
                        }));

                        const msg = await message.channel.send({ embeds: [pages.firstPage] });

                        if (pages.size === 1) {
                            return;
                        };

                        const prev = bot.emojis.cache.get('767062237722050561') || '◀';
                        const next = bot.emojis.cache.get('767062244034084865') || '▶';
                        const terminate = bot.emojis.cache.get('767062250279927818') || '❌';

                        const filter = (_, user) => user.id === message.author.id;
                        const collector = msg.createReactionCollector(filter);
                        const navigators = [prev, next, terminate];
                        let timeout = setTimeout(() => collector.stop(), 90000);

                        for (let i = 0; i < navigators.length; i++) {
                            await msg.react(navigators[i]);
                        };

                        collector.on('collect', async reaction => {

                            switch (reaction.emoji.name) {
                                case prev instanceof GuildEmoji ? prev.name : prev:
                                    msg.edit(pages.previous());
                                    break;
                                case next instanceof GuildEmoji ? next.name : next:
                                    msg.edit(pages.next());
                                    break;
                                case terminate instanceof GuildEmoji ? terminate.name : terminate:
                                    collector.stop();
                                    break;
                            };

                            await reaction.users.remove(message.author.id);
                            timeout.refresh();
                        });

                        collector.on('end', async () => await msg.reactions.removeAll());

                        return;
                    };
                })
                break;

            case 'channel':
                row = new ActionRowBuilder().setComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('chanime')
                        .setPlaceholder('Choose a channel (Click and type to search)')
                        .setDisabled(false)
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.GuildAnnouncement,
                            ChannelType.GuildForum,
                        ),
                );

                embed = new Embed(bot, message.guild)
                    .setTitle(`Hope Auto-Animes`)
                    // .setThumbnail('https://i.imgur.com/KgZTGt5.png')
                    .setColor(16722829)
                    .setDescription(`Please click below and select the channel where you wish to receive anime notifications.`)
                    .setFooter({ text: `If you have questions, join the support server for help.` })

                await message.channel.send({ embeds: [embed], components: [row] }).then(async msg => {
                    // create collector
                    const filter = (i) => i.user.id === message.author.id;
                    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                    collector.on('collect', async i => {
                        i.deferUpdate();
                        // console.log(i.values.join(', '))

                        embed = new Embed(bot, message.guild)
                            .setTitle(`Hope Auto-Animes`)
                            .setThumbnail('https://i.imgur.com/1NMudBy.png')
                            .setColor(65286)
                            .setDescription(`The **channel** of the Auto-Animes addon *has been changed* with **success** to <#${i.values.join(', ')}>.`)
                            .setFooter({ text: `If you have questions, join the support server for help.` })

                        db.channelID = i.values.join(', ');
                        db.enabled = true;
                        await db.save().catch(() => { });

                        message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                    });

                    collector.on('end', async () => {
                        msg.delete();
                    });
                });
                break;

            case 'role':
                row = new ActionRowBuilder().setComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId('rranime')
                        .setPlaceholder('Choose a role (Click and type to search)')
                        .setDisabled(false)
                        .setMinValues(1)
                        .setMaxValues(1),
                );

                embed = new Embed(bot, message.guild)
                    .setTitle(`Hope Auto-Animes`)
                    // .setThumbnail('https://i.imgur.com/KgZTGt5.png')
                    .setColor(16722829)
                    .setDescription(`Please click below and select the desired role to notify server users.`)
                    .setFooter({ text: `If you have questions, join the support server for help.` })

                await message.channel.send({ embeds: [embed], components: [row] }).then(async msg => {
                    // create collector
                    const filter = (i) => i.user.id === message.author.id;
                    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                    collector.on('collect', async i => {
                        i.deferUpdate();
                        // console.log(i.values.join(', '))

                        embed = new Embed(bot, message.guild)
                            .setTitle(`Hope Auto-Animes`)
                            .setThumbnail('https://i.imgur.com/1NMudBy.png')
                            .setColor(65286)
                            .setDescription(`The **notification role** of the Auto-Animes addon *has been set* with **success** to <@&${i.values.join(', ')}>.`)
                            .setFooter({ text: `If you have questions, join the support server for help.` })

                        db.roleNotify = i.values.join(', ');
                        await db.save().catch(() => { });

                        message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                    });

                    collector.on('end', async () => {
                        msg.delete();
                    });
                });
                break;

            default:
                embed = new Embed(bot, message.guild)
                    .setTitle(`Hope Auto-Animes Settings`)
                    .setThumbnail('https://i.imgur.com/KgZTGt5.png')
                    .setColor(16722829)
                    .setDescription(`Welcome to the Auto-Animes addon configuration panel.
                    Currently there are **5** configuration options available.
                    \n<:11:1048282233817022495> **${this.help.name} add <anime name>** - Add an anime to the watchlist.
                    *Exemple: \`${settings.prefix}${this.help.name} add One Piece\`*
                    \n<:2:1048280338885005353> **${this.help.name} remove <anime name>** - Removes an anime from the watchlist.
                    *Exemple: \`${settings.prefix}${this.help.name} remove One Piece\`*
                    \n<:31:1048282237470261268> **${this.help.name} list** - Displays the current watchlist for the addon.
                    *Exemple: \`${settings.prefix}${this.help.name} list\`*
                    \n<:4:1048280342483705896> **${this.help.name} channel** - Change the channel where animes will be announced.
                    *Exemple: \`${settings.prefix}${this.help.name} channel\`*
                    \n<:5_:1048282239064100914> **${this.help.name} role** - Changes the anime notification role.
                    *Exemple: \`${settings.prefix}${this.help.name} role\`*`)
                    .setFooter({ text: `If you have questions, join the support server for help.` })

                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                break;
        }

        async function getAllAnimes(query, variables) {
            const adata = await fetch(`https://graphql.anilist.co`, { method: 'POST', body: JSON.stringify({ query, variables }), headers: { 'Content-Type': 'application/json', "Accept": "application/json" } }).then(res => res.json()).catch(err => {
                if (err.code === 'ETIMEDOUT') {
                    return console.log('err getAllAnimes - autoanimes.js');
                }
            });

            return adata;
        }
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = interaction.user,
            ch = args.get('channel')?.value,
            channel = guild.channels.cache.get(interaction.channelId),
            action = args.get('action')?.value,
            anime = args.get('anime')?.value,
            role = args.get('role')?.value;

        try {
            let embed, aniQuery, query, getAnimes, row;
            let db = await AutoAnimes.findOne({ _id: guild.id });
            if (!db) {
                const newSettings = new AutoAnimes({
                    _id: guild.id
                });
                await newSettings.save().catch(() => { });
                db = await AutoAnimes.findOne({ _id: guild.id });
            }

            switch (action) {
                case 'add':
                    aniQuery = anime;

                    query = `query {
                        Page(perPage: 1) {
                          media(type: ANIME, format: TV, sort: POPULARITY_DESC, search: "${aniQuery}", status: RELEASING) {
                            id
                              title {
                              english,
                                userPreferred,
                                native,
                                romaji
                            }
                            popularity
                              coverImage {
                              large
                            }
                          }
                        }
                      }`
                    getAnimes = await getAllAnimes(query);
                    // console.log(getAnimes.data.Page.media)

                    if (getAnimes.data.Page.media[0]) {
                        embed = new Embed(bot, guild)
                            .setTitle(`Hope Auto-Animes`)
                            .setThumbnail('https://i.imgur.com/1NMudBy.png')
                            .setColor(16722829)
                            .setDescription(`The anime **${getAnimes.data.Page.media[0]?.title.english}** \`(${getAnimes.data.Page.media[0]?.title.romaji ?? getAnimes.data.Page.media[0]?.title.native})\` has been successfully added to the watch list.`)
                            .setFooter({ text: `To see the current watch list of animes on this server, use /autoanimes list` })

                        if (db.animes.includes(getAnimes.data.Page.media[0].id)) return interaction.reply({ embeds: [channel.error(`Uh-oh! You have already added **${getAnimes.data.Page.media[0]?.title.english}** to the watchlist. To see the current list, use **/autoanimes list**`, {}, true)], ephemeral: true })
                        db.animes.push(getAnimes.data.Page.media[0].id);
                        await db.save().catch(() => { });

                        interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                    } else {
                        embed = new Embed(bot, guild)
                            .setTitle(`Hope Auto-Animes`)
                            .setThumbnail('https://i.imgur.com/67BZzuG.png')
                            .setColor(16722829)
                            .setDescription(`Uh-oh! Sorry, but I couldn't find this anime.\nPlease **check** if the *anime name* is correct, or if the anime is still **on air**, and try again!`)
                            .setFooter({ text: `If you have questions, join the support server for help.` })

                        interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                    }
                    break;

                case 'remove':
                    aniQuery = anime;

                    query = `query {
                        Page(perPage: 1) {
                          media(type: ANIME, format: TV, sort: POPULARITY_DESC, search: "${aniQuery}", status: RELEASING) {
                            id
                              title {
                              english,
                                userPreferred,
                                native,
                                romaji
                            }
                            popularity
                              coverImage {
                              large
                            }
                          }
                        }
                      }`
                    getAnimes = await getAllAnimes(query);
                    // console.log(getAnimes.data.Page.media)

                    if (getAnimes.data.Page.media[0]) {
                        if (db.animes.includes(getAnimes.data.Page.media[0].id)) {
                            embed = new Embed(bot, guild)
                                .setTitle(`Hope Auto-Animes`)
                                .setThumbnail('https://i.imgur.com/1NMudBy.png')
                                .setColor(65286)
                                .setDescription(`The anime **${getAnimes.data.Page.media[0]?.title.english}** \`(${getAnimes.data.Page.media[0]?.title.romaji ?? getAnimes.data.Page.media[0]?.title.native})\` has been successfully removed from the watch list.`)
                                .setFooter({ text: `To see the current watch list of animes on this server, use /autoanimes list` })

                            var arr = db.animes;
                            for (var i = 0; i < arr.length; i++) {
                                if (arr[i].toString() === getAnimes.data.Page.media[0].id.toString()) {
                                    arr.splice(i, 1);
                                }
                            }

                            await db.save().catch(() => { });

                            interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        } else {
                            embed = new Embed(bot, guild)
                                .setTitle(`Hope Auto-Animes`)
                                .setThumbnail('https://i.imgur.com/67BZzuG.png')
                                .setColor(16711711)
                                .setDescription(`Uh-oh! Sorry, but I couldn't find this anime.\nPlease **check** with the command **/autoanimes list** if the *anime name* is correct and try again!`)
                                .setFooter({ text: `If you have questions, join the support server for help.` })

                            interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                        }
                    } else {
                        embed = new Embed(bot, guild)
                            .setTitle(`Hope Auto-Animes`)
                            .setThumbnail('https://i.imgur.com/67BZzuG.png')
                            .setColor(16711711)
                            .setDescription(`Uh-oh! Sorry, but I couldn't find this anime.\nPlease **check** if the *anime name* is correct, or if the anime is still **on air**, and try again!`)
                            .setFooter({ text: `If you have questions, join the support server for help.` })

                        interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                    }
                    break;

                case 'list':
                    AutoAnimes.findById(guild.id, async (err, doc) => {

                        if (err) {
                            return interaction.reply({ embeds: [channel.error(`Uh-oh! There was a small problem running this command. Please try again or seek help at [support server](${bot.config.SupportServer.link})!\n*Error reference: ${err.name}*`, {}, true)], ephemeral: true });
                        } else if (!doc) {
                            doc = new AutoAnimes({ _id: guild.id });
                        };

                        const embed = new Embed(bot, guild)
                            .setColor(16711711)
                            .setFooter({ text: `Powered by hopebot.top` })

                        const anischedch = guild.channels.cache.get(doc.channelID);

                        if (!anischedch) {
                            return interaction.reply({ embeds: [channel.error(`Uh-oh! Sorry, but the Auto-Animes addon is disabled. Please activate it and try again or seek help at [support server](${bot.config.SupportServer.link})!`, {}, true)], ephemeral: true });
                        } else if (!doc.animes.length) {
                            return interaction.reply(
                                embed.setAuthor({ name: 'No Subscription', iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
                                    .setDescription(`Uh-oh, this server has no Auto-Animes entries yet. Please add an anime using the command **/autoanimes add <anime name>**`)
                            ).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                        } else {
                            const entries = [];
                            const watched = doc.animes;
                            let page = 0
                            let hasNextPage = false;

                            do {
                                const res = await getAllAnimes(watching, { watched, page });

                                if (res.errors) {
                                    return interaction.reply(
                                        embed.setAuthor({ name: 'AniList Error', iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
                                            .setDescription('Received error from anilist:\n' + errors.map(x => x.message).join('\n') + `\nPlease wait a few minutes and try again or seek help at [support server](${bot.config.SupportServer.link})!`)
                                    );
                                } else if (!entries.length && !res.data.Page.media.length) {
                                    return interaction.reply(
                                        embed.setAuthor({ name: 'No Subscription', iconURL: 'https://cdn.discordapp.com/emojis/767062250279927818.png?v=1' })
                                            .setDescription(`Uh-oh, this server has no Auto-Animes entries yet. Please add an anime using the command **/autoanimes add <anime name>**`)
                                    ).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 30000 }) } });
                                } else {
                                    page = res.data.Page.pageInfo.currentPage + 1;
                                    hasNextPage = res.data.Page.pageInfo.hasNextPage;
                                    entries.push(...res.data.Page.media.filter(x => x.status === 'RELEASING'));
                                };
                            } while (hasNextPage);

                            const chunks = entries.sort((A, B) => A.id - B.id).map(entry => {
                                const id = ' '.repeat(6 - String(entry.id).length) + String(entry.id);
                                const title = text.truncate(entry.title.romaji, 42, '...');
                                return `•\u2000\u2000\`[ ${id} ]\` [**${title}**](${entry.siteUrl})`;
                            });
                            const descriptions = _.chunk(chunks, 20).map(d => d.join('\n'));

                            const pages = new Page(descriptions.map((d, i) => {
                                return new Embed(bot, guild)
                                    .setColor(16056064)
                                    .setDescription(d)
                                    .setTitle(`Current Hope Auto-Animes Subscription (${entries.length} entries!)`)
                                    .setFooter({ text: `Auto-Animes list\u2000\u2000•\u2000\u2000Page ${i + 1} of ${descriptions.length}\u2000\u2000•\u2000\u2000Powered by hopebot.top` })
                                    .addFields({
                                        name: 'Tips', value: [
                                            `- Use \`/autoanimes add\` to add subscription`,
                                            `- Use \`/autoanimes remove\` to remove subscription`,
                                            `- Use \`/nextairdate <anime title>\` to check episode countdown`
                                        ].join('\n'), inline: true
                                    })
                            }));

                            const msg = await interaction.reply({ embeds: [pages.firstPage] });

                            if (pages.size === 1) {
                                return;
                            };

                            const prev = bot.emojis.cache.get('767062237722050561') || '◀';
                            const next = bot.emojis.cache.get('767062244034084865') || '▶';
                            const terminate = bot.emojis.cache.get('767062250279927818') || '❌';

                            const filter = (_, user) => user.id === member.id;
                            const collector = msg.createReactionCollector(filter);
                            const navigators = [prev, next, terminate];
                            let timeout = setTimeout(() => collector.stop(), 90000);

                            for (let i = 0; i < navigators.length; i++) {
                                await msg.react(navigators[i]);
                            };

                            collector.on('collect', async reaction => {

                                switch (reaction.emoji.name) {
                                    case prev instanceof GuildEmoji ? prev.name : prev:
                                        msg.edit(pages.previous());
                                        break;
                                    case next instanceof GuildEmoji ? next.name : next:
                                        msg.edit(pages.next());
                                        break;
                                    case terminate instanceof GuildEmoji ? terminate.name : terminate:
                                        collector.stop();
                                        break;
                                };

                                await reaction.users.remove(member.id);
                                timeout.refresh();
                            });

                            collector.on('end', async () => await msg.reactions.removeAll());
                            return;
                        };
                    })
                    break;

                case 'channel':

                    embed = new Embed(bot, guild)
                        .setTitle(`Hope Auto-Animes`)
                        .setThumbnail('https://i.imgur.com/1NMudBy.png')
                        .setColor(65286)
                        .setDescription(`The **channel** of the Auto-Animes addon *has been changed* with **success** to <#${ch}>.`)
                        .setFooter({ text: `If you have questions, join the support server for help.` })

                    db.channelID = ch;
                    db.enabled = true;
                    await db.save().catch(() => { });

                    interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                    break;

                case 'role':
                    embed = new Embed(bot, guild)
                        .setTitle(`Hope Auto-Animes`)
                        .setThumbnail('https://i.imgur.com/1NMudBy.png')
                        .setColor(65286)
                        .setDescription(`The **notification role** of the Auto-Animes addon *has been set* with **success** to <@&${role}>.`)
                        .setFooter({ text: `If you have questions, join the support server for help.` })

                    db.roleNotify = role;
                    await db.save().catch(() => { });

                    interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                    break;

                default:
                    embed = new Embed(bot, guild)
                        .setTitle(`Hope Auto-Animes Settings`)
                        .setThumbnail('https://i.imgur.com/KgZTGt5.png')
                        .setColor(16722829)
                        .setDescription(`Welcome to the Auto-Animes addon configuration panel.
                        Currently there are **5** configuration options available.
                        \n<:11:1048282233817022495> **${this.help.name} add <anime name>** - Add an anime to the watchlist.
                        *Exemple: \`${settings.prefix}${this.help.name} add One Piece\`*
                        \n<:2:1048280338885005353> **${this.help.name} remove <anime name>** - Removes an anime from the watchlist.
                        *Exemple: \`${settings.prefix}${this.help.name} remove One Piece\`*
                        \n<:31:1048282237470261268> **${this.help.name} list** - Displays the current watchlist for the addon.
                        *Exemple: \`${settings.prefix}${this.help.name} list\`*
                        \n<:4:1048280342483705896> **${this.help.name} channel** - Change the channel where animes will be announced.
                        *Exemple: \`${settings.prefix}${this.help.name} channel\`*
                        \n<:5_:1048282239064100914> **${this.help.name} role** - Changes the anime notification role.
                        *Exemple: \`${settings.prefix}${this.help.name} role\`*`)
                        .setFooter({ text: `If you have questions, join the support server for help.` })

                    interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                    break;
            }

            async function getAllAnimes(query, variables) {
                const adata = await fetch(`https://graphql.anilist.co`, { method: 'POST', body: JSON.stringify({ query, variables }), headers: { 'Content-Type': 'application/json', "Accept": "application/json" } }).then(res => res.json()).catch(err => {
                    if (err.code === 'ETIMEDOUT') {
                        return console.log('err getAllAnimes - autoanimes.js');
                    }
                });

                return adata;
            }
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.reply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
};