// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js'),
    MAL = require('mal-scraper'),
    Command = require('../../structures/Command.js');

module.exports = class Anisearch extends Command {
    constructor(bot) {
        super(bot, {
            name: 'anisearch',
            dirname: __dirname,
            aliases: ['animanysearch', 'anilist', 'buscar-anime', 'b-anime', 'procurar-anime', 'procuraranime', 'p-anime'],
            description: 'Pesquisa por vários animes pertencentes ao termo pesquisado. Máximo de 10 resultados.',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            usage: '<prefix><commandName> <query>',
            cooldown: 10000,
            nsfw: true,
            examples: ['/anisearch dragon ball', '.anisearch isekai', '!buscar-anime seishun buta', '?procurar-anime helsing'],
            slash: true,
            options: [{
                name: 'anime',
                description: 'Search Query',
                type: ApplicationCommandOptionType.String,
                required: true,
            }],
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (message.args.length === 0) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Animes/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Animes/${this.help.name}:EXAMPLE`)) })) }) }).then(message => { setTimeout(() => { if (!message.deleted) return message.delete() }, 10000) })

        const query = message.args.join('');

        MAL.getResultsFromSearch(query).then(data => {
            if (!data) return message.channel.send(message.translate('Animes/anisearch:ABUSCAR_DESC', { query: query })).then(message => { setTimeout(() => { if (!message.deleted) return message.delete() }, 10000) })

            return new Promise(async (resolve, reject) => {
                let n = 0;
                const embedder = (data) => {
                    let embed = new Embed(bot, message.guild)
                        .setAuthor({ name: `${message.translate('Animes/anisearch:ABUSCAR_AUTHOR')} ${query}` })
                        .setDescription(message.translate('Animes/anisearch:ABUSCAR_DESC1', { prefix: settings.prefix }))
                        .setColor(65475)
                        .setFooter({ text: `${message.translate('Animes/anisearch:ABUSCAR_DESC2')} ${n + 1} ${message.translate('Animes/anisearch:ABUSCAR_DESC3')} ${data.length}.` })
                    if (data[n].name) {
                        embed.setTitle(data[n].name)
                    }
                    if (data[n].url) {
                        embed.setURL(data[n].url)
                    }
                    if (data[n].image_url) {
                        embed.setThumbnail(data[n].image_url)
                    }
                    if (data[n].type) {
                        embed.addFields({ name: `${message.translate('Animes/anisearch:ABUSCAR_DESC4')}`, value: `${data[n].type.toUpperCase()}`, inline: true });
                    }
                    if (data[n].payload.aired) {
                        embed.addFields({ name: `${message.translate('Animes/anisearch:ABUSCAR_DESC5')}`, value: `${data[n].payload.aired}`, inline: true });
                    }
                    if (data[n].payload.status) {
                        embed.addFields({ name: `${message.translate('Animes/anisearch:ABUSCAR_DESC6')}`, value: `${data[n].payload.status}`, inline: true });
                    }
                    if (data[n].payload.media_type) {
                        embed.addFields({ name: `${message.translate('Animes/anisearch:ABUSCAR_DESC7')}`, value: `${data[n].payload.media_type}`, inline: true });
                    }
                    if (data[n].payload.start_year) {
                        embed.addFields({ name: `${message.translate('Animes/anisearch:ABUSCAR_DESC8')}`, value: `${data[n].payload.start_year}`, inline: true });
                    }
                    if (data[n].payload.score) {
                        embed.addFields({ name: `${message.translate('Animes/anisearch:ABUSCAR_DESC9')}`, value: `${data[n].payload.score}`, inline: true });
                    }
                    return embed
                }

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('1')
                            .setLabel('\u200b')
                            .setEmoji('1033761542258299032')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('2')
                            .setLabel('\u200b')
                            .setEmoji('1033761544732942417')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('3')
                            .setLabel('\u200b')
                            .setEmoji('1033761540756746340')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('4')
                            .setLabel('\u200b')
                            .setEmoji('1033761543583703070')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('5')
                            .setLabel('🗒')
                            .setStyle(ButtonStyle.Secondary),
                    );

                const interactiveMessage = await message.channel.send({ embeds: [embedder(data)], components: [row] });

                const buttonCollector = await interactiveMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

                // find out what emoji was reacted on to update pages
                buttonCollector.on('collect', async (i) => {
                    if (i.user.id !== message.author.id) return;
                    switch (Number(i.customId)) {
                        case 1:
                            n = 0;
                            await interactiveMessage.edit({ embeds: [embedder(data)], components: [row] });
                            break;
                        case 2:
                            if (!(n < 1)) {
                                n--;
                                await interactiveMessage.edit({ embeds: [embedder(data)], components: [row] });
                            }
                            break;
                        case 3:
                            if (n < (data.length - 1)) {
                                n++;
                                await interactiveMessage.edit({ embeds: [embedder(data)], components: [row] });
                            }
                            break;
                        case 4:
                            n = data.length - 1;
                            await interactiveMessage.edit({ embeds: [embedder(data)], components: [row] });
                            break;
                        case 5:
                            let c;
                            let list = new Embed(bot, message.guild)
                                .setColor(65475)
                            for (let c = 0; c < data.length; c++) {
                                list.addFields({ name: `${c + 1}. ${data[c].name}`, value: `${message.translate('Animes/anisearch:ABUSCAR_DESC4')} ${"["}${data[c].type ? data[c].type.toUpperCase() : 'Anime'}${"]"}(${data[c].url}) | ${message.translate('Animes/anisearch:ABUSCAR_DESC10')} ${data[c].payload.aired ? data[c].payload.aired : `${message.translate('Animes/anisearch:ABUSCAR_DESC11')}`} | ${message.translate('Animes/anisearch:ABUSCAR_DESC6')}: ${data[c].payload.status ? data[c].payload.status : `${message.translate('Animes/anisearch:ABUSCAR_DESC11')}`} | ${message.translate('Animes/anisearch:ABUSCAR_DESC12')} ${data[c].payload.score ? data[c].payload.score : `${message.translate('Animes/anisearch:ABUSCAR_DESC13')}`}\n\n`, inline: false })
                            }
                            list.setAuthor({ name: `${message.translate('Animes/anisearch:ABUSCAR_AUTHOR1')} ${query}` })
                                .setFooter({ text: message.translate('Animes/anisearch:ABUSCAR_DESC14') });
                            await interactiveMessage.edit({ embeds: [list], components: [row] });
                            break;
                        default:
                            break;
                    }
                    i.deferUpdate();
                    // i.update({ embeds: [embedder(data)] });
                });

                // when timer runs out remove all reactions to show end of pageinator
                buttonCollector.on('end', () => interactiveMessage.edit({ embeds: [embedder(data)], components: [] }));
            })
        })
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = interaction.user;
        const channel = guild.channels.cache.get(interaction.channelId);
        const query = args.get('anime')?.value;

        try {
            // Get Interaction Message Data
            await interaction.deferReply();
            MAL.getResultsFromSearch(query).then(data => {
                if (!data) return interaction.editReply(guild.translate('Animes/anisearch:ABUSCAR_DESC', { query: query })).then(message => { setTimeout(() => { if (!message.deleted) return message.delete() }, 10000) })

                return new Promise(async (resolve, reject) => {
                    let n = 0;
                    const embedder = (data) => {
                        let embed = new Embed(bot, guild)
                            .setAuthor({ name: `${guild.translate('Animes/anisearch:ABUSCAR_AUTHOR')} ${query}` })
                            .setDescription(guild.translate('Animes/anisearch:ABUSCAR_DESC1', { prefix: guild.settings.prefix }))
                            .setColor(65475)
                            .setFooter({ text: `${guild.translate('Animes/anisearch:ABUSCAR_DESC2')} ${n + 1} ${guild.translate('Animes/anisearch:ABUSCAR_DESC3')} ${data.length}.` })
                        if (data[n].name) {
                            embed.setTitle(data[n].name)
                        }
                        if (data[n].url) {
                            embed.setURL(data[n].url)
                        }
                        if (data[n].image_url) {
                            embed.setThumbnail(data[n].image_url)
                        }
                        if (data[n].type) {
                            embed.addFields({ name: `${guild.translate('Animes/anisearch:ABUSCAR_DESC4')}`, value: `${data[n].type.toUpperCase()}`, inline: true });
                        }
                        if (data[n].payload.aired) {
                            embed.addFields({ name: `${guild.translate('Animes/anisearch:ABUSCAR_DESC5')}`, value: `${data[n].payload.aired}`, inline: true });
                        }
                        if (data[n].payload.status) {
                            embed.addFields({ name: `${guild.translate('Animes/anisearch:ABUSCAR_DESC6')}`, value: `${data[n].payload.status}`, inline: true });
                        }
                        if (data[n].payload.media_type) {
                            embed.addFields({ name: `${guild.translate('Animes/anisearch:ABUSCAR_DESC7')}`, value: `${data[n].payload.media_type}`, inline: true });
                        }
                        if (data[n].payload.start_year) {
                            embed.addFields({ name: `${guild.translate('Animes/anisearch:ABUSCAR_DESC8')}`, value: `${data[n].payload.start_year}`, inline: true });
                        }
                        if (data[n].payload.score) {
                            embed.addFields({ name: `${guild.translate('Animes/anisearch:ABUSCAR_DESC9')}`, value: `${data[n].payload.score}`, inline: true });
                        }
                        return embed
                    }

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('1')
                                .setLabel('\u200b')
                                .setEmoji('1033761542258299032')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('2')
                                .setLabel('\u200b')
                                .setEmoji('1033761544732942417')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('3')
                                .setLabel('\u200b')
                                .setEmoji('1033761540756746340')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('4')
                                .setLabel('\u200b')
                                .setEmoji('1033761543583703070')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('5')
                                .setLabel('🗒')
                                .setStyle(ButtonStyle.Secondary),
                        );

                    const interactiveMessage = await interaction.editReply({ embeds: [embedder(data)], components: [row] });

                    const buttonCollector = await interactiveMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

                    // find out what emoji was reacted on to update pages
                    buttonCollector.on('collect', async (i) => {
                        if (i.user.id !== member.id) return;
                        switch (Number(i.customId)) {
                            case 1:
                                n = 0;
                                await interactiveMessage.edit({ embeds: [embedder(data)], components: [row] });
                                break;
                            case 2:
                                if (!(n < 1)) {
                                    n--;
                                    await interactiveMessage.edit({ embeds: [embedder(data)], components: [row] });
                                }
                                break;
                            case 3:
                                if (n < (data.length - 1)) {
                                    n++;
                                    await interactiveMessage.edit({ embeds: [embedder(data)], components: [row] });
                                }
                                break;
                            case 4:
                                n = data.length - 1;
                                await interactiveMessage.edit({ embeds: [embedder(data)], components: [row] });
                                break;
                            case 5:
                                let c;
                                let list = new Embed(bot, guild)
                                    .setColor(65475)
                                for (let c = 0; c < data.length; c++) {
                                    list.addFields({ name: `${c + 1}. ${data[c].name}`, value: `${guild.translate('Animes/anisearch:ABUSCAR_DESC4')} ${"["}${data[c].type ? data[c].type.toUpperCase() : 'Anime'}${"]"}(${data[c].url}) | ${guild.translate('Animes/anisearch:ABUSCAR_DESC10')} ${data[c].payload.aired ? data[c].payload.aired : `${guild.translate('Animes/anisearch:ABUSCAR_DESC11')}`} | ${guild.translate('Animes/anisearch:ABUSCAR_DESC6')}: ${data[c].payload.status ? data[c].payload.status : `${guild.translate('Animes/anisearch:ABUSCAR_DESC11')}`} | ${guild.translate('Animes/anisearch:ABUSCAR_DESC12')} ${data[c].payload.score ? data[c].payload.score : `${guild.translate('Animes/anisearch:ABUSCAR_DESC13')}`}\n\n`, inline: false })
                                }
                                list.setAuthor({ name: `${guild.translate('Animes/anisearch:ABUSCAR_AUTHOR1')} ${query}` })
                                    .setFooter({ text: guild.translate('Animes/anisearch:ABUSCAR_DESC14') });
                                await interactiveMessage.edit({ embeds: [list], components: [row] });
                                // gera o error: Interaction has already been acknowledged.
                                // i.update({ embeds: [list] });
                                break;
                            default:
                                break;
                        }
                        i.deferUpdate();
                    });

                    // when timer runs out remove all reactions to show end of pageinator
                    buttonCollector.on('end', () => interactiveMessage.edit({ embeds: [embedder(data)], components: [] }));
                })
            })
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
}