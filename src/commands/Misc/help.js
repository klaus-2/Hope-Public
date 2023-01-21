// Dependências
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
    { Embed, func: { genInviteLink } } = require(`../../utils`),
    { AutoAnimes } = require('../../database/models/index'),
    Guild = require(`../../database/models/Hope.js`),
    moment = require("moment"),
    Command = require('../../structures/Command.js');
moment.suppressDeprecationWarnings = true;

module.exports = class Help extends Command {
    constructor(bot) {
        super(bot, {
            name: 'help',
            aliases: ['help'],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
            userPermissions: [Flags.SendMessages],
            description: 'Displays the list of Hope commands and add-ons.',
            usage: '<prefix><commandName> <option>',
            examples: [
                '/help',
                '.help'
            ],
            cooldown: 3000,
            slash: false,
            options: [{
                name: 'command',
                description: 'Name of command to look up.',
                type: ApplicationCommandOptionType.String,
                required: false,
                autocomplete: true,
            }]
        });
    }

    /** ------------------------------------------------------------------------------------------------
    * EXECUTA O COMANDO @AJUDA
    * ------------------------------------------------------------------------------------------------ */
    async run(bot, message, settings) {

        /** ------------------------------------------------------------------------------------------------
        * SE ATIVADO, DELETARÁ A MENSAGEM DE COMANDO ENVIADO PELO USUARIO
        * ------------------------------------------------------------------------------------------------ */
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        /** ------------------------------------------------------------------------------------------------
        * DADOS NECESSARIOS FUNCIONAMENTO DE ALGUMAS PARTES
        * ------------------------------------------------------------------------------------------------ */
        const guildDB = await Guild.findOne({
            tag: '622812963572809771',
        });

        const stats = {
            true: '<:online:823004429317570570>',
            false: '<:dnd:823008160540262430>',
            undefined: '<:dnd:823008160540262430>'
        };
        const info3 = message.translate('Addons/configurações:CONFIG_DESC');
        const anime = await AutoAnimes.findOne({ _id: message.guild.id });
        let animesCanal;
        let animesToggle;
        let animesLista = [];
        if (anime) {
            const getCanal = message.guild.channels.cache.get(anime.channelID) || `${info3}`;
            animesCanal = getCanal;
            animesToggle = true;
            animesLista.push(anime.animes);
        } else {
            animesCanal = info3;
            animesToggle = false;
            animesLista.push(info3);
        }

        /** ------------------------------------------------------------------------------------------------
        * EMBED MENU INICIAL
        * ------------------------------------------------------------------------------------------------ */
        const chan = message.channel;
        const roww = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(message.translate('Misc/help:AJUDA1'))
                    .setEmoji(`<:command:896440492655542302>`)
                    .setURL('https://hopebot.top/commands')
                    .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                    .setLabel('GUIDES')
                    .setEmoji(`<:guides:1031667790408581130>`)
                    .setURL('https://hopebot.top/helper-center')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setCustomId('addons')
                    .setLabel(message.translate('Misc/help:AJUDA2'))
                    .setEmoji(`<:addon:896441362856173619>`)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('delete')
                    .setLabel(message.translate('Misc/help:AJUDA3'))
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(`<:close:896442104912412724>`)
            );
        const embed = new Embed(bot, message.guild)
            .setTitle(`<:hnew:936647247653920778> <:onew:936647247666503700> <:pnew:936647247590989936> <:enew:936647247708450927>`)
            .setThumbnail('https://i.imgur.com/yj0dlAI.png')
            .setColor(16722829)
            .setDescription(`Commands in this server start with \`${settings.prefix}\`\n\n${message.translate('Misc/help:AJUDA_DESCRIÇÃOO')} ${message.translate('Misc/help:AJUDA_DATA', { moment: moment(guildDB.time).format("L") })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOOOO', { moment: moment(guildDB.time).fromNow() })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOO', { news: guildDB.news })}`)
            .addFields(
                { name: message.translate('Misc/help:AJUDA5'), value: message.translate('Misc/help:AJUDA6', { prefix: settings.prefix }), inline: true },
                { name: message.translate('Misc/help:AJUDA7'), value: message.translate('Misc/help:AJUDA8', { prefix: settings.prefix }), inline: true },
                { name: message.translate('Misc/help:AJUDA9'), value: message.translate('Misc/help:AJUDA10'), inline: false },
                { name: message.translate('Misc/help:AJUDA11'), value: message.translate('Misc/help:AJUDA12', { prefix: settings.prefix }), inline: true },
                { name: message.translate('Misc/help:AJUDA13'), value: `[Invite Hope](${genInviteLink(bot)}) to your server`, inline: true },
                { name: 'Premium', value: 'Unlock more features and commands with [Premium](https://hopebot.top/premium)', inline: false },
                { name: 'Dashboard', value: 'Manage Hope easily with the [dashboard](https://hopebot.top/)', inline: false },
            )
            .setFooter({ text: message.translate('Misc/help:AJUDA15') })

        const editthis = await chan.send({ embeds: [embed], components: [roww] });

        // CRIA O COLLETOR
        const filter = i => i.message.id === editthis.id;

        /* if (i.user.id !== message.author.id) {
            return;
        } */

        const collector = chan.createMessageComponentCollector({ filter, time: 150000 });
        let value;
        collector.on('collect', async i => {
            if (i.values) {
                value = i.values[0];
            } else {
                value = null
            }
            /** ------------------------------------------------------------------------------------------------
            * INTERAÇÃO DO GUIA COMANDOS @MENU_INICIAL
            * ------------------------------------------------------------------------------------------------ */
            if (i?.customId === 'comandos') {
                editthis.delete();
                const row = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('options')
                            .setPlaceholder(message.translate('Misc/help:AJUDA'))
                            .addOptions([
                                {
                                    label: message.translate('Misc/help:AAJUDA1'),
                                    description: message.translate('Misc/help:AAJUDA2'),
                                    value: 'animes',
                                    emoji: '<:anime:830174554012778587>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA5'),
                                    description: message.translate('Misc/help:AAJUDA6'),
                                    value: "ações",
                                    emoji: '<:acao:830841929359949884>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA7'),
                                    description: message.translate('Misc/help:AAJUDA8'),
                                    value: "diversão",
                                    emoji: '<:Fun:823004802107703327>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA9'),
                                    description: message.translate('Misc/help:AAJUDA10'),
                                    value: "economia",
                                    emoji: '<:economia:830175433140076544>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA11'),
                                    description: message.translate('Misc/help:AAJUDA12'),
                                    value: "extras",
                                    emoji: '<:Extra:823008067368124476>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA13'),
                                    description: message.translate('Misc/help:AAJUDA14'),
                                    value: "imagem",
                                    emoji: '<:Imagem:823004649781985311>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA15'),
                                    description: message.translate('Misc/help:AAJUDA16'),
                                    value: "jogos",
                                    emoji: '<:jogos:824720991288295504>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA17'),
                                    description: message.translate('Misc/help:AAJUDA18'),
                                    value: "moderação",
                                    emoji: '<:Moderao:823004537756844073>',
                                },
                                /* {
                                    label: message.translate('Misc/help:AAJUDA19'),
                                    description: message.translate('Misc/help:AAJUDA20'),
                                    value: "nsfw",
                                    emoji: '<:18:823003678557470781>',
                                }, */
                                {
                                    label: message.translate('Misc/help:AAJUDA21'),
                                    description: message.translate('Misc/help:AAJUDA22'),
                                    value: "musica",
                                    emoji: '<:Skyedj:875040358311026749>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA23'),
                                    description: message.translate('Misc/help:AAJUDA24'),
                                    value: "pesquisas",
                                    emoji: '<:Pesquisas:823004382127849513>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA25'),
                                    description: message.translate('Misc/help:AAJUDA26'),
                                    value: "servidor",
                                    emoji: '<:Servidor:823004266981621779>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA27'),
                                    description: message.translate('Misc/help:AAJUDA28'),
                                    value: "sorteio",
                                    emoji: '<:Sorteio:823004188292022303>',
                                },
                                {
                                    label: message.translate('Misc/help:AAJUDA29'),
                                    description: message.translate('Misc/help:AAJUDA30'),
                                    value: "ticket",
                                    emoji: '🎟️',
                                },
                            ]),
                    );
                const roww = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('inicio')
                            .setLabel(message.translate('Misc/help:AJUDA16'))
                            .setEmoji(`<:inicio:896451813367250974>`)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('addons')
                            .setLabel(message.translate('Misc/help:AJUDA17'))
                            .setEmoji(`<:addon:896441362856173619>`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('delete')
                            .setLabel(message.translate('Misc/help:AJUDA18'))
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji(`<:close:896442104912412724>`)
                    );

                const embed = new Embed(bot, message.guild)
                    .setThumbnail('https://i.imgur.com/tpeRrsT.png')
                    .setColor(65475)
                    .setDescription(message.translate('Misc/help:ANIME_DESCRIÇÃO', { prefix: settings.prefix }))
                    .setAuthor({ name: message.translate('Misc/help:AJUDA_AUTHOR', { username: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setImage('https://i.imgur.com/MLpn37k.png');
                // If no channels, it will dm the owner.
                chan.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                    m.timedDelete({ timeout: 300005 })
                    // Create collector
                    const filter = i => i.message.id === m.id;

                    const collector = chan.createMessageComponentCollector({ filter: filter, time: 300000 });
                    let value;
                    collector.on('collect', async i => {
                        if (i.values) {
                            value = i.values[0];
                        } else {
                            value = null
                        }
                        /* async function reply(t) {
                            const tt = { "1": sembed, "2": rembed, "3": bembed };
            
                            await i.reply({ embeds: [tt[t]], ephemeral: true })
            
                            return null;
                        } */
                        if (value === 'ações') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/1MHabT6.png')] });
                            m.edit({ embeds: [embed.setColor(16248815)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:AÇÕES_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/DZKqnWL.png')] });
                            // i.deferUpdate();
                        } else if (value === 'animes') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/tpeRrsT.png')] });
                            m.edit({ embeds: [embed.setColor(65475)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:ANIME_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/MLpn37k.png')] });
                            // i.deferUpdate();
                        } else if (value === 'addons') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/Ht02t2U.png')] });
                            m.edit({ embeds: [embed.setColor(5334012)] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/nAirjGv.png')] });
                            if (message.guild.id == '333949691962195969') {
                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:ADDONS_TOPGG', { prefix: settings.prefix }))] });
                            } else {
                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:ADDONS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            }
                        } else if (value === 'diversão') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/jzOE29T.png')] });
                            m.edit({ embeds: [embed.setColor(16279836)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:DIVERSÃO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/J0fFkj0.png')] });
                        } else if (value === 'economia') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/sY40tlL.png')] });
                            m.edit({ embeds: [embed.setColor(327424)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:ECONOMIA_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/FWgUj2B.png')] });
                        } else if (value === 'extras') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/xrENyIs.png')] });
                            m.edit({ embeds: [embed.setColor(16775424)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:EXTRAS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/wMh9ZOx.png')] });
                        } else if (value === 'imagem') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/whTAgD0.png')] });
                            m.edit({ embeds: [embed.setColor(16711902)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:IMAGEM_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/UPFzv63.png')] });
                        } else if (value === 'jogos') {
                            // sot img https://i.imgur.com/BlBktvi.png
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/2kJHrio.png')] });
                            m.edit({ embeds: [embed.setColor(13210623)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:JOGOS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/s5Fk6gg.png')] });
                        } else if (value === 'moderação') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/mPdaiV5.png')] });
                            m.edit({ embeds: [embed.setColor(16711709)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:MODERAÇÃO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/n30jUDZ.png')] });
                        } else if (value === 'nsfw') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/WJWDw2P.png')] });
                            m.edit({ embeds: [embed.setColor(1)] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/gIJ1sof.png')] });
                            if (message.guild.id == '333949691962195969') {
                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:NSFW_TOPGG', { prefix: settings.prefix }))] });
                            } else {
                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:NSFW_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            }
                        } else if (value === 'musica') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/iJawoRC.png')] });
                            m.edit({ embeds: [embed.setColor(16651084)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:HopeDJ_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/WZ2zB5i.png')] });
                        } else if (value === 'pesquisas') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/7HuMF3g.png')] });
                            m.edit({ embeds: [embed.setColor(12317183)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:PESQUISAS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/tTbTOFf.png')] });
                        } else if (value === 'servidor') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/L2vHLKK.png')] });
                            m.edit({ embeds: [embed.setColor(1)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:SERVIDOR_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/oiYZlQB.png')] });
                        } else if (value === 'sorteio') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/3DM9Nxj.png')] });
                            m.edit({ embeds: [embed.setColor(12118406)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:SORTEIO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/qbFBr2d.png')] });
                        } else if (value === 'ticket') {
                            m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/RinEXHZ.png')] });
                            m.edit({ embeds: [embed.setColor(9442302)] });
                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:TICKET_DESCRIÇÃO', { prefix: settings.prefix }))] });
                            m.edit({ embeds: [embed.setImage('https://i.imgur.com/rffOlJ3.png')] });
                        } else if (i?.customId === 'inicio') {
                            m.delete().catch(() => {
                                // do nothing.
                            });
                            await bot.commands.get('help').run(bot, message, settings);
                        } else if (i?.customId === 'delete') {
                            m.delete().catch(() => {
                                // do nothing.
                            });
                        } else if (i?.customId === 'addons') {
                            m.delete().catch(() => {
                                // do nothing.
                            });
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new SelectMenuBuilder()
                                        .setCustomId('options')
                                        .setPlaceholder(message.translate('Misc/help:AJUDA'))
                                        .addOptions([
                                            {
                                                label: message.translate('Misc/help:AJUDA60'),
                                                description: message.translate('Misc/help:AJUDA61'),
                                                value: 'app',
                                                emoji: '<:applications:897903410135851009>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA19'),
                                                description: message.translate('Misc/help:AJUDA20'),
                                                value: 'autoanimes',
                                                emoji: '<:anime:830174554012778587>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA21'),
                                                description: message.translate('Misc/help:AJUDA22'),
                                                value: "automod",
                                                emoji: '<:automod:896720524284166184>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA23'),
                                                description: message.translate('Misc/help:AJUDA24'),
                                                value: "autocovid",
                                                emoji: '<:autocovid:896720952988172309>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA25'),
                                                description: message.translate('Misc/help:AJUDA26'),
                                                value: "autoresponse",
                                                emoji: '<:autoresponse:896721652530962472>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA27'),
                                                description: message.translate('Misc/help:AJUDA28'),
                                                value: "autotwitch",
                                                emoji: '<:autotwitch:896722126613123093>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA29'),
                                                description: message.translate('Misc/help:AJUDA30'),
                                                value: "autoyoutube",
                                                emoji: '<:autoyoutube:896722997598097409>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA33'),
                                                description: message.translate('Misc/help:AJUDA34'),
                                                value: "autonick",
                                                emoji: '<:autonick:896723882675957840>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA35'),
                                                description: message.translate('Misc/help:AJUDA36'),
                                                value: "automessage",
                                                emoji: '<:automessage:896724725798174751>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA62'),
                                                description: message.translate('Misc/help:AJUDA63'),
                                                value: 'birth',
                                                emoji: '<:birthday:897904377120030730>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA37'),
                                                description: message.translate('Misc/help:AJUDA38'),
                                                value: "welcome",
                                                emoji: '<:welcome:896725138492522506>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA39'),
                                                description: message.translate('Misc/help:AJUDA40'),
                                                value: "level",
                                                emoji: '<:level:896727226760953896>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA41'),
                                                description: message.translate('Misc/help:AJUDA42'),
                                                value: "moderation",
                                                emoji: '<:moderation:896730204121235507>',
                                            },
                                            /* {
                                                label: message.translate('Misc/help:AJUDA64'),
                                                description: message.translate('Misc/help:AJUDA65'),
                                                value: 'ss',
                                                emoji: '<:stats:897904377153613844>',
                                            }, */
                                            {
                                                label: message.translate('Misc/help:AJUDA43'),
                                                description: message.translate('Misc/help:AJUDA44'),
                                                value: "suggestion",
                                                emoji: '<:suggestion:896730918193094717>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA45'),
                                                description: message.translate('Misc/help:AJUDA46'),
                                                value: "system",
                                                emoji: '<:system:896732249469378660>',
                                            },
                                            /* {
                                                label: message.translate('Misc/help:AJUDA47'),
                                                description: message.translate('Misc/help:AJUDA48'),
                                                value: "sticky",
                                                emoji: '<:sticky:896732586171301888>',
                                            }, */
                                            {
                                                label: message.translate('Misc/help:AJUDA49'),
                                                description: message.translate('Misc/help:AJUDA50'),
                                                value: "reputation",
                                                emoji: '<:reputation:896733497622949898>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA51'),
                                                description: message.translate('Misc/help:AJUDA52'),
                                                value: "ticket",
                                                emoji: '<:ticket:896730680506085396>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA53'),
                                                description: message.translate('Misc/help:AJUDA54'),
                                                value: "verify",
                                                emoji: '<:verify:896734198486958121>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AJUDA55'),
                                                description: message.translate('Misc/help:AJUDA56'),
                                                value: "rr",
                                                emoji: '<:reactionrole:896734822922330202>',
                                            },
                                        ]),
                                );
                            const roww = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('inicio')
                                        .setLabel(message.translate('Misc/help:AJUDA57'))
                                        .setEmoji(`<:inicio:896451813367250974>`)
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId('commands')
                                        .setLabel(message.translate('Misc/help:AJUDA58'))
                                        .setEmoji(`<:addon:896441362856173619>`)
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId('delete')
                                        .setLabel(message.translate('Misc/help:AJUDA59'))
                                        .setStyle(ButtonStyle.Danger)
                                        .setEmoji(`<:close:896442104912412724>`)
                                );

                            /* const embed = new Embed(bot, message.guild)
                                .setTitle('Addons/configurações:ANIMES_TITULO')
                                .addFields(
                                    { name: '\u200b', value: `${message.translate('Addons/configurações:ANIMES_FIELD')}`, inline: false },
                                    { name: `${message.translate('Addons/configurações:ANIMES_FIELD1')}`, value: `${stats[animesToggle]}`, inline: true },
                                    { name: `${message.translate('Addons/configurações:ANIMES_FIELD2')}`, value: animesCanal || `${info3}`, inline: true },
                                    { name: `${message.translate('Addons/configurações:ANIMES_FIELD5')}`, value: animesLista.join(" - ") || `${info3}`, inline: false },
                                    { name: `${message.translate('Addons/configurações:ANIMES_FIELD3')}`, value: message.translate('Addons/configurações:ANIMES_FIELD4', { prefix: settings.prefix }), inline: false }); */

                            const embed = new Embed(bot, message.guild)
                                .setTitle(`Uh-oh! Comando em Atualização`)
                                .setDescription(`Caro usuario, atualmente este comando está em atualização para __implementação__ de *novas melhorias e correções*.\nNão se preocupe, você ainda pode utiliza-lo normalmente pelo **Dashboard da Hope**: Porfavor, acesse o link: [https://hopebot.top/dashboard/${message.guild.id}/auto-anime](https://hopebot.top/dashboard/${message.guild.id}/auto-anime).`)
                                .setFooter({ text: `Soon this command will be available again, thank you for your understanding.` })

                            // If no channels, it will dm the owner.
                            chan.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                                m.timedDelete({ timeout: 300005 })
                                // Create collector
                                const filter = i => i.message.id === m.id;

                                const collector = chan.createMessageComponentCollector({ filter: filter, time: 300000 });
                                let value;
                                collector.on('collect', async i => {
                                    if (i.values) {
                                        value = i.values[0];
                                    } else {
                                        value = null
                                    }
                                    /* async function reply(t) {
                                        const tt = { "1": sembed, "2": rembed, "3": bembed };
                        
                                        await i.reply({ embeds: [tt[t]], ephemeral: true })
                        
                                        return null;
                                    } */
                                    if (value === 'autoanimes') {
                                        m.delete()
                                        message.args[0] = 'anime';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                        // i.deferUpdate();
                                    } else if (value === 'app') {
                                        m.delete()
                                        message.args[0] = 'app';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                        // i.deferUpdate();
                                    } else if (value === 'birth') {
                                        m.delete()
                                        message.args[0] = 'birthday';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                        // i.deferUpdate();
                                        /* } else if (value === 'ss') {
                                            m.delete()
                                            message.args[0] = 'ss';
                                            await bot.commands.get('settings').run(bot, message, settings);
                                            // i.deferUpdate(); */
                                    } else if (value === 'automod') {
                                        m.delete()
                                        // message.args[0] = 'anime';
                                        await bot.commands.get('auto-mod').run(bot, message, settings);
                                        // i.deferUpdate();
                                    } else if (value === 'autocovid') {
                                        m.delete()
                                        message.args[0] = 'covid';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'autoresponse') {
                                        m.delete()
                                        message.args[0] = 'ar';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'autotwitch') {
                                        m.delete()
                                        message.args[0] = 'twitch';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'autoyoutube') {
                                        m.delete()
                                        message.args[0] = 'youtube';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'autonick') {
                                        m.delete()
                                        message.args[0] = 'nick';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'automessage') {
                                        m.delete()
                                        message.args[0] = 'message';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'welcome') {
                                        m.delete()
                                        message.args[0] = 'welcome';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'level') {
                                        m.delete()
                                        message.args[0] = 'level';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'moderation') {
                                        m.delete()
                                        message.args[0] = 'moderation';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'ticket') {
                                        m.delete()
                                        message.args[0] = 'ticket';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'suggestion') {
                                        m.delete()
                                        message.args[0] = 'suggestion';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'ticket') {
                                        m.delete()
                                        message.args[0] = 'ticket';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'system') {
                                        m.delete()
                                        message.args[0] = 'system';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'sticky') {
                                        m.delete()
                                        message.args[0] = 'sticky';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'reputation') {
                                        m.delete()
                                        message.args[0] = 'rep';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'ticket') {
                                        m.delete()
                                        message.args[0] = 'ticket';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'verify') {
                                        m.delete()
                                        message.args[0] = 'vf';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (value === 'rr') {
                                        m.delete()
                                        message.args[0] = 'rr';
                                        await bot.commands.get('settings').run(bot, message, settings);
                                    } else if (i?.customId === 'inicio') {
                                        m.delete().catch(() => {
                                            // do nothing.
                                        });
                                        await bot.commands.get('help').run(bot, message, settings);
                                    } else if (i?.customId === 'delete') {
                                        m.delete().catch(() => {
                                            // do nothing.
                                        });
                                    } else if (i?.customId === 'commands') {
                                        m.delete().catch(() => {
                                            // do nothing.
                                        });
                                    }
                                    i.deferUpdate();
                                    collector.on('end', async collected => {
                                        const embedd = new Embed(bot, message.guild)
                                            .setTitle(`<:h:902714203775860786> <:o:902714203499008032> <:p:902714203834548224> <:e:902714203645829172>`)
                                            .setThumbnail('https://i.imgur.com/sbTZHbT.png')
                                            .setColor(16722829)
                                            .setDescription(`__**Useful links:**__ [Privacy policy](https://hopebot.top/privacy-policy) | [Status](https://hopebot.top/status) | [Become a Partner](https://hopebot.top/news/become-a-partner) | [Website](https://hopebot.top/)\n\n${message.translate('Misc/help:AJUDA_DESCRIÇÃOO')} ${message.translate('Misc/help:AJUDA_DATA', { moment: moment(guildDB.time).format("L") })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOOOO', { moment: moment(guildDB.time).fromNow() })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOO', { news: guildDB.news })}`)
                                            .addFields(
                                                { name: message.translate('Misc/help:AJUDA5'), value: message.translate('Misc/help:AJUDA6', { prefix: settings.prefix }), inline: true },
                                                { name: message.translate('Misc/help:AJUDA7'), value: message.translate('Misc/help:AJUDA8', { prefix: settings.prefix }), inline: true },
                                                { name: message.translate('Misc/help:AJUDA9'), value: message.translate('Misc/help:AJUDA10'), inline: false },
                                                { name: message.translate('Misc/help:AJUDA11'), value: message.translate('Misc/help:AJUDA12', { prefix: settings.prefix }), inline: true },
                                                { name: message.translate('Misc/help:AJUDA13'), value: message.translate('Misc/help:AJUDA14', { invite: genInviteLink(bot) }), inline: true }
                                                // { name: 'You get more control from the website, https://hopebot.top/', `⠀⠀⠀⠀⠀⠀⠀⠀⠀`, false)
                                            )
                                            .setFooter({ text: message.translate('Misc/help:AJUDA15') })

                                        const targetMessage = await message.channel.messages.fetch(m.id, false, true)
                                        embedd.addFields({ name: 'You get more control from the website, https://hopebot.top/', value: `\`\`\`Session ended, please say "${settings.prefix}help" again.\`\`\``, inline: false })
                                        targetMessage.edit({ embeds: [embedd], components: [] })
                                    });
                                });
                            });
                        }
                        i.deferUpdate();
                        collector.on('end', async collected => {
                            const embedd = new Embed(bot, message.guild)
                                .setTitle(`<:h:902714203775860786> <:o:902714203499008032> <:p:902714203834548224> <:e:902714203645829172>`)
                                .setThumbnail('https://i.imgur.com/sbTZHbT.png')
                                .setColor(16722829)
                                .setDescription(`__**Useful links:**__ [Privacy policy](https://hopebot.top/privacy-policy) | [Status](https://hopebot.top/status) | [Become a Partner](https://hopebot.top/news/become-a-partner) | [Website](https://hopebot.top/)\n\n${message.translate('Misc/help:AJUDA_DESCRIÇÃOO')} ${message.translate('Misc/help:AJUDA_DATA', { moment: moment(guildDB.time).format("L") })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOOOO', { moment: moment(guildDB.time).fromNow() })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOO', { news: guildDB.news })}`)
                                .addFields(
                                    { name: message.translate('Misc/help:AJUDA5'), value: message.translate('Misc/help:AJUDA6', { prefix: settings.prefix }), inline: true },
                                    { name: message.translate('Misc/help:AJUDA7'), value: message.translate('Misc/help:AJUDA8', { prefix: settings.prefix }), inline: true },
                                    { name: message.translate('Misc/help:AJUDA9'), value: message.translate('Misc/help:AJUDA10'), inline: false },
                                    { name: message.translate('Misc/help:AJUDA11'), value: message.translate('Misc/help:AJUDA12', { prefix: settings.prefix }), inline: true },
                                    { name: message.translate('Misc/help:AJUDA13'), value: message.translate('Misc/help:AJUDA14', { invite: genInviteLink(bot) }), inline: true })
                                // { name: 'You get more control from the website, https://hopebot.top/', `⠀⠀⠀⠀⠀⠀⠀⠀⠀`, false)
                                .setFooter({ text: message.translate('Misc/help:AJUDA15') })

                            const targetMessage = await message.channel.messages.fetch(m.id, false, true)
                            embedd.addFields({ name: 'You get more control from the website, https://hopebot.top/', value: `\`\`\`Session ended, please say "${settings.prefix}help" again.\`\`\``, inline: false })
                            targetMessage.edit({ embeds: [embedd], components: [] })
                        });
                    });
                });
                /** ------------------------------------------------------------------------------------------------
                * INTERAÇÃO DO GUIA DELETE @MENU_INICIAL
                * ------------------------------------------------------------------------------------------------ */
            } else if (i?.customId === 'delete') {
                editthis.delete();
                /** ------------------------------------------------------------------------------------------------
                * INTERAÇÃO DO GUIA ADDONS @MENU_INICIAL
                * ------------------------------------------------------------------------------------------------ */
            } else if (i?.customId === 'addons') {
                editthis.delete();
                const row = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('options')
                            .setPlaceholder(message.translate('Misc/help:AJUDA'))
                            .addOptions([
                                {
                                    label: message.translate('Misc/help:AJUDA60'),
                                    description: message.translate('Misc/help:AJUDA61'),
                                    value: 'app',
                                    emoji: '<:applications:897903410135851009>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA19'),
                                    description: message.translate('Misc/help:AJUDA20'),
                                    value: 'autoanimes',
                                    emoji: '<:anime:830174554012778587>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA21'),
                                    description: message.translate('Misc/help:AJUDA22'),
                                    value: "automod",
                                    emoji: '<:automod:896720524284166184>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA23'),
                                    description: message.translate('Misc/help:AJUDA24'),
                                    value: "autocovid",
                                    emoji: '<:autocovid:896720952988172309>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA25'),
                                    description: message.translate('Misc/help:AJUDA26'),
                                    value: "autoresponse",
                                    emoji: '<:autoresponse:896721652530962472>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA27'),
                                    description: message.translate('Misc/help:AJUDA28'),
                                    value: "autotwitch",
                                    emoji: '<:autotwitch:896722126613123093>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA29'),
                                    description: message.translate('Misc/help:AJUDA30'),
                                    value: "autoyoutube",
                                    emoji: '<:autoyoutube:896722997598097409>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA33'),
                                    description: message.translate('Misc/help:AJUDA34'),
                                    value: "autonick",
                                    emoji: '<:autonick:896723882675957840>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA35'),
                                    description: message.translate('Misc/help:AJUDA36'),
                                    value: "automessage",
                                    emoji: '<:automessage:896724725798174751>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA62'),
                                    description: message.translate('Misc/help:AJUDA63'),
                                    value: 'birth',
                                    emoji: '<:birthday:897904377120030730>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA37'),
                                    description: message.translate('Misc/help:AJUDA38'),
                                    value: "welcome",
                                    emoji: '<:welcome:896725138492522506>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA39'),
                                    description: message.translate('Misc/help:AJUDA40'),
                                    value: "level",
                                    emoji: '<:level:896727226760953896>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA41'),
                                    description: message.translate('Misc/help:AJUDA42'),
                                    value: "moderation",
                                    emoji: '<:moderation:896730204121235507>',
                                },
                                /* {
                                    label: message.translate('Misc/help:AJUDA64'),
                                    description: message.translate('Misc/help:AJUDA65'),
                                    value: 'ss',
                                    emoji: '<:stats:897904377153613844>',
                                }, */
                                {
                                    label: message.translate('Misc/help:AJUDA43'),
                                    description: message.translate('Misc/help:AJUDA44'),
                                    value: "suggestion",
                                    emoji: '<:suggestion:896730918193094717>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA45'),
                                    description: message.translate('Misc/help:AJUDA46'),
                                    value: "system",
                                    emoji: '<:system:896732249469378660>',
                                },
                                /* {
                                                label: message.translate('Misc/help:AJUDA47'),
                                                description: message.translate('Misc/help:AJUDA48'),
                                                value: "sticky",
                                                emoji: '<:sticky:896732586171301888>',
                                            }, */
                                {
                                    label: message.translate('Misc/help:AJUDA49'),
                                    description: message.translate('Misc/help:AJUDA50'),
                                    value: "reputation",
                                    emoji: '<:reputation:896733497622949898>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA51'),
                                    description: message.translate('Misc/help:AJUDA52'),
                                    value: "ticket",
                                    emoji: '<:ticket:896730680506085396>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA53'),
                                    description: message.translate('Misc/help:AJUDA54'),
                                    value: "verify",
                                    emoji: '<:verify:896734198486958121>',
                                },
                                {
                                    label: message.translate('Misc/help:AJUDA55'),
                                    description: message.translate('Misc/help:AJUDA56'),
                                    value: "rr",
                                    emoji: '<:reactionrole:896734822922330202>',
                                },
                            ]),
                    );
                const roww = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('inicio')
                            .setLabel(message.translate('Misc/help:AJUDA57'))
                            .setEmoji(`<:inicio:896451813367250974>`)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('commands')
                            .setLabel(message.translate('Misc/help:AJUDA58'))
                            .setEmoji(`<:addon:896441362856173619>`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('delete')
                            .setLabel(message.translate('Misc/help:AJUDA59'))
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji(`<:close:896442104912412724>`)
                    );

                /* const embed = new Embed(bot, message.guild)
                    .setTitle('Addons/configurações:ANIMES_TITULO')
                    .addFields(
                        { name: '\u200b', value: message.translate('Addons/configurações:ANIMES_FIELD'), inline: false },
                        { name: message.translate('Addons/configurações:ANIMES_FIELD1'), value: stats[animesToggle], inline: true },
                        { name: message.translate('Addons/configurações:ANIMES_FIELD2'), value: animesCanal || info3, inline: true },
                        { name: message.translate('Addons/configurações:ANIMES_FIELD5'), value: animesLista.join(" - ") || info3, inline: false },
                        { name: message.translate('Addons/configurações:ANIMES_FIELD3'), value: message.translate('Addons/configurações:ANIMES_FIELD4', { prefix: settings.prefix }), inline: false },
                    ); */

                const embed = new Embed(bot, message.guild)
                    .setTitle(`Uh-oh! Command in Updating`)
                    .setDescription(`Dear user, this command is currently being updated for __implementation__ of *new enhancements and fixes*.\n\nDon't worry, you can still use it normally through the **Hope Dashboard**: [https://hopebot.top/dashboard/${message.guild.id}/auto-anime](https://hopebot.top/dashboard/${message.guild.id}/auto-anime).`)
                    .setFooter({ text: `Soon this command will be available again, thank you for your understanding.` })

                // If no channels, it will dm the owner.
                chan.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                    m.timedDelete({ timeout: 300005 })
                    // Create collector
                    const filter = i => i.message.id === m.id;

                    const collector = chan.createMessageComponentCollector({ filter: filter, time: 300000 });
                    let value;
                    collector.on('collect', async i => {
                        if (i.values) {
                            value = i.values[0];
                        } else {
                            value = null
                        }
                        /* async function reply(t) {
                            const tt = { "1": sembed, "2": rembed, "3": bembed };
            
                            await i.reply({ embeds: [tt[t]], ephemeral: true })
            
                            return null;
                        } */
                        if (value === 'autoanimes') {
                            m.delete()
                            message.args[0] = 'anime';
                            await bot.commands.get('settings').run(bot, message, settings);
                            // i.deferUpdate();
                        } else if (value === 'app') {
                            m.delete()
                            message.args[0] = 'app';
                            await bot.commands.get('settings').run(bot, message, settings);
                            // i.deferUpdate();
                        } else if (value === 'birth') {
                            m.delete()
                            message.args[0] = 'birthday';
                            await bot.commands.get('settings').run(bot, message, settings);
                            // i.deferUpdate();
                            /* } else if (value === 'ss') {
                                            m.delete()
                                            message.args[0] = 'ss';
                                            await bot.commands.get('settings').run(bot, message, settings);
                                            // i.deferUpdate(); */
                        } else if (value === 'automod') {
                            m.delete()
                            // message.args[0] = 'anime';
                            await bot.commands.get('auto-mod').run(bot, message, settings);
                            // i.deferUpdate();
                        } else if (value === 'autocovid') {
                            m.delete()
                            message.args[0] = 'covid';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'autoresponse') {
                            m.delete()
                            message.args[0] = 'ar';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'autotwitch') {
                            m.delete()
                            message.args[0] = 'twitch';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'autoyoutube') {
                            m.delete()
                            message.args[0] = 'youtube';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'autonick') {
                            m.delete()
                            message.args[0] = 'nick';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'automessage') {
                            m.delete()
                            message.args[0] = 'message';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'welcome') {
                            m.delete()
                            message.args[0] = 'welcome';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'level') {
                            m.delete()
                            message.args[0] = 'level';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'moderation') {
                            m.delete()
                            message.args[0] = 'moderation';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'ticket') {
                            m.delete()
                            message.args[0] = 'ticket';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'suggestion') {
                            m.delete()
                            message.args[0] = 'suggestion';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'ticket') {
                            m.delete()
                            message.args[0] = 'ticket';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'system') {
                            m.delete()
                            message.args[0] = 'system';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'sticky') {
                            m.delete()
                            message.args[0] = 'sticky';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'reputation') {
                            m.delete()
                            message.args[0] = 'rep';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'ticket') {
                            m.delete()
                            message.args[0] = 'ticket';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'verify') {
                            m.delete()
                            message.args[0] = 'vf';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (value === 'rr') {
                            m.delete()
                            message.args[0] = 'rr';
                            await bot.commands.get('settings').run(bot, message, settings);
                        } else if (i?.customId === 'inicio') {
                            m.delete().catch(() => {
                                // do nothing.
                            });
                            await bot.commands.get('help').run(bot, message, settings);
                        } else if (i?.customId === 'delete') {
                            m.delete().catch(() => {
                                // do nothing.
                            });
                        } else if (i?.customId === 'commands') {
                            m.delete().catch(() => {
                                // do nothing.
                            });
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new SelectMenuBuilder()
                                        .setCustomId('options')
                                        .setPlaceholder(message.translate('Misc/help:AJUDA'))
                                        .addOptions([
                                            {
                                                label: message.translate('Misc/help:AAJUDA1'),
                                                description: message.translate('Misc/help:AAJUDA2'),
                                                value: 'animes',
                                                emoji: '<:anime:830174554012778587>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA5'),
                                                description: message.translate('Misc/help:AAJUDA6'),
                                                value: "ações",
                                                emoji: '<:acao:830841929359949884>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA7'),
                                                description: message.translate('Misc/help:AAJUDA8'),
                                                value: "diversão",
                                                emoji: '<:Fun:823004802107703327>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA9'),
                                                description: message.translate('Misc/help:AAJUDA10'),
                                                value: "economia",
                                                emoji: '<:economia:830175433140076544>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA11'),
                                                description: message.translate('Misc/help:AAJUDA12'),
                                                value: "extras",
                                                emoji: '<:Extra:823008067368124476>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA13'),
                                                description: message.translate('Misc/help:AAJUDA14'),
                                                value: "imagem",
                                                emoji: '<:Imagem:823004649781985311>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA15'),
                                                description: message.translate('Misc/help:AAJUDA16'),
                                                value: "jogos",
                                                emoji: '<:jogos:824720991288295504>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA17'),
                                                description: message.translate('Misc/help:AAJUDA18'),
                                                value: "moderação",
                                                emoji: '<:Moderao:823004537756844073>',
                                            },
                                            /* {
                                                label: message.translate('Misc/help:AAJUDA19'),
                                                description: message.translate('Misc/help:AAJUDA20'),
                                                value: "nsfw",
                                                emoji: '<:18:823003678557470781>',
                                            }, */
                                            {
                                                label: message.translate('Misc/help:AAJUDA21'),
                                                description: message.translate('Misc/help:AAJUDA22'),
                                                value: "musica",
                                                emoji: '<:Skyedj:875040358311026749>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA23'),
                                                description: message.translate('Misc/help:AAJUDA24'),
                                                value: "pesquisas",
                                                emoji: '<:Pesquisas:823004382127849513>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA25'),
                                                description: message.translate('Misc/help:AAJUDA26'),
                                                value: "servidor",
                                                emoji: '<:Servidor:823004266981621779>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA27'),
                                                description: message.translate('Misc/help:AAJUDA28'),
                                                value: "sorteio",
                                                emoji: '<:Sorteio:823004188292022303>',
                                            },
                                            {
                                                label: message.translate('Misc/help:AAJUDA29'),
                                                description: message.translate('Misc/help:AAJUDA30'),
                                                value: "ticket",
                                                emoji: '🎟️',
                                            },
                                        ]),
                                );
                            const roww = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('inicio')
                                        .setLabel(message.translate('Misc/help:AJUDA16'))
                                        .setEmoji(`<:inicio:896451813367250974>`)
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId('addons')
                                        .setLabel(message.translate('Misc/help:AJUDA17'))
                                        .setEmoji(`<:addon:896441362856173619>`)
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId('delete')
                                        .setLabel(message.translate('Misc/help:AJUDA18'))
                                        .setStyle(ButtonStyle.Danger)
                                        .setEmoji(`<:close:896442104912412724>`)
                                );

                            /* const embed = new Embed(bot, message.guild)
                                .setThumbnail('https://i.imgur.com/tpeRrsT.png')
                                .setColor(65475)
                                .setDescription(message.translate('Misc/help:ANIME_DESCRIÇÃO', { prefix: settings.prefix }))
                                .setAuthor({ name: message.translate('Misc/help:AJUDA_AUTHOR', { username: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                                .setImage('https://i.imgur.com/MLpn37k.png'); */
                            const embed = new Embed(bot, message.guild)
                                .setTitle(`Uh-oh! Command in Updating`)
                                .setDescription(`Dear user, this command is currently being updated for __implementation__ of *new enhancements and fixes*.\n\nDon't worry, you can still use it normally through the **Hope Dashboard**: [https://hopebot.top/dashboard/${message.guild.id}/auto-anime](https://hopebot.top/dashboard/${message.guild.id}/auto-anime).`)
                                .setFooter({ text: `Soon this command will be available again, thank you for your understanding.` })
                            // If no channels, it will dm the owner.
                            chan.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                                m.timedDelete({ timeout: 300005 })
                                // Create collector
                                const filter = i => i.message.id === m.id;

                                const collector = chan.createMessageComponentCollector({ filter: filter, time: 300000 });
                                let value;
                                collector.on('collect', async i => {
                                    if (i.values) {
                                        value = i.values[0];
                                    } else {
                                        value = null
                                    }
                                    /* async function reply(t) {
                                        const tt = { "1": sembed, "2": rembed, "3": bembed };
                        
                                        await i.reply({ embeds: [tt[t]], ephemeral: true })
                        
                                        return null;
                                    } */
                                    if (value === 'ações') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/1MHabT6.png')] });
                                        m.edit({ embeds: [embed.setColor(16248815)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:AÇÕES_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/DZKqnWL.png')] });
                                        // i.deferUpdate();
                                    } else if (value === 'animes') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/tpeRrsT.png')] });
                                        m.edit({ embeds: [embed.setColor(65475)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:ANIME_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/MLpn37k.png')] });
                                        // i.deferUpdate();
                                    } else if (value === 'addons') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/Ht02t2U.png')] });
                                        m.edit({ embeds: [embed.setColor(5334012)] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/nAirjGv.png')] });
                                        if (message.guild.id == '333949691962195969') {
                                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:ADDONS_TOPGG', { prefix: settings.prefix }))] });
                                        } else {
                                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:ADDONS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        }
                                    } else if (value === 'diversão') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/jzOE29T.png')] });
                                        m.edit({ embeds: [embed.setColor(16279836)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:DIVERSÃO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/J0fFkj0.png')] });
                                    } else if (value === 'economia') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/sY40tlL.png')] });
                                        m.edit({ embeds: [embed.setColor(327424)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:ECONOMIA_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/FWgUj2B.png')] });
                                    } else if (value === 'extras') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/xrENyIs.png')] });
                                        m.edit({ embeds: [embed.setColor(16775424)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:EXTRAS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/wMh9ZOx.png')] });
                                    } else if (value === 'imagem') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/whTAgD0.png')] });
                                        m.edit({ embeds: [embed.setColor(16711902)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:IMAGEM_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/UPFzv63.png')] });
                                    } else if (value === 'jogos') {
                                        // sot img https://i.imgur.com/BlBktvi.png
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/2kJHrio.png')] });
                                        m.edit({ embeds: [embed.setColor(13210623)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:JOGOS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/s5Fk6gg.png')] });
                                    } else if (value === 'moderação') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/mPdaiV5.png')] });
                                        m.edit({ embeds: [embed.setColor(16711709)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:MODERAÇÃO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/n30jUDZ.png')] });
                                    } else if (value === 'nsfw') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/WJWDw2P.png')] });
                                        m.edit({ embeds: [embed.setColor(1)] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/gIJ1sof.png')] });
                                        if (message.guild.id == '333949691962195969') {
                                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:NSFW_TOPGG', { prefix: settings.prefix }))] });
                                        } else {
                                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:NSFW_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        }
                                    } else if (value === 'musica') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/iJawoRC.png')] });
                                        m.edit({ embeds: [embed.setColor(16651084)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:HopeDJ_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/WZ2zB5i.png')] });
                                    } else if (value === 'pesquisas') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/7HuMF3g.png')] });
                                        m.edit({ embeds: [embed.setColor(12317183)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:PESQUISAS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/tTbTOFf.png')] });
                                    } else if (value === 'servidor') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/L2vHLKK.png')] });
                                        m.edit({ embeds: [embed.setColor(1)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:SERVIDOR_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/oiYZlQB.png')] });
                                    } else if (value === 'sorteio') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/3DM9Nxj.png')] });
                                        m.edit({ embeds: [embed.setColor(12118406)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:SORTEIO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/qbFBr2d.png')] });
                                    } else if (value === 'ticket') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/RinEXHZ.png')] });
                                        m.edit({ embeds: [embed.setColor(9442302)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/help:TICKET_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/rffOlJ3.png')] });
                                    } else if (i?.customId === 'inicio') {
                                        m.delete().catch(() => {
                                            // do nothing.
                                        });
                                        await bot.commands.get('help').run(bot, message, settings);
                                    } else if (i?.customId === 'delete') {
                                        m.delete().catch(() => {
                                            // do nothing.
                                        });
                                    } else if (i?.customId === 'addons') {
                                        m.delete().catch(() => {
                                            // do nothing.
                                        });
                                        const row = new ActionRowBuilder()
                                            .addComponents(
                                                new SelectMenuBuilder()
                                                    .setCustomId('options')
                                                    .setPlaceholder(message.translate('Misc/help:AJUDA'))
                                                    .addOptions([
                                                        {
                                                            label: message.translate('Misc/help:AJUDA60'),
                                                            description: message.translate('Misc/help:AJUDA61'),
                                                            value: 'app',
                                                            emoji: '<:applications:897903410135851009>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA19'),
                                                            description: message.translate('Misc/help:AJUDA20'),
                                                            value: 'autoanimes',
                                                            emoji: '<:anime:830174554012778587>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA21'),
                                                            description: message.translate('Misc/help:AJUDA22'),
                                                            value: "automod",
                                                            emoji: '<:automod:896720524284166184>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA23'),
                                                            description: message.translate('Misc/help:AJUDA24'),
                                                            value: "autocovid",
                                                            emoji: '<:autocovid:896720952988172309>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA25'),
                                                            description: message.translate('Misc/help:AJUDA26'),
                                                            value: "autoresponse",
                                                            emoji: '<:autoresponse:896721652530962472>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA27'),
                                                            description: message.translate('Misc/help:AJUDA28'),
                                                            value: "autotwitch",
                                                            emoji: '<:autotwitch:896722126613123093>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA29'),
                                                            description: message.translate('Misc/help:AJUDA30'),
                                                            value: "autoyoutube",
                                                            emoji: '<:autoyoutube:896722997598097409>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA33'),
                                                            description: message.translate('Misc/help:AJUDA34'),
                                                            value: "autonick",
                                                            emoji: '<:autonick:896723882675957840>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA35'),
                                                            description: message.translate('Misc/help:AJUDA36'),
                                                            value: "automessage",
                                                            emoji: '<:automessage:896724725798174751>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA62'),
                                                            description: message.translate('Misc/help:AJUDA63'),
                                                            value: 'birth',
                                                            emoji: '<:birthday:897904377120030730>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA37'),
                                                            description: message.translate('Misc/help:AJUDA38'),
                                                            value: "welcome",
                                                            emoji: '<:welcome:896725138492522506>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA39'),
                                                            description: message.translate('Misc/help:AJUDA40'),
                                                            value: "level",
                                                            emoji: '<:level:896727226760953896>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA41'),
                                                            description: message.translate('Misc/help:AJUDA42'),
                                                            value: "moderation",
                                                            emoji: '<:moderation:896730204121235507>',
                                                        },
                                                        /* {
                                                            label: message.translate('Misc/help:AJUDA64'),
                                                            description: message.translate('Misc/help:AJUDA65'),
                                                            value: 'ss',
                                                            emoji: '<:stats:897904377153613844>',
                                                        }, */
                                                        {
                                                            label: message.translate('Misc/help:AJUDA43'),
                                                            description: message.translate('Misc/help:AJUDA44'),
                                                            value: "suggestion",
                                                            emoji: '<:suggestion:896730918193094717>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA45'),
                                                            description: message.translate('Misc/help:AJUDA46'),
                                                            value: "system",
                                                            emoji: '<:system:896732249469378660>',
                                                        },
                                                        /* {
                                                label: message.translate('Misc/help:AJUDA47'),
                                                description: message.translate('Misc/help:AJUDA48'),
                                                value: "sticky",
                                                emoji: '<:sticky:896732586171301888>',
                                            }, */
                                                        {
                                                            label: message.translate('Misc/help:AJUDA49'),
                                                            description: message.translate('Misc/help:AJUDA50'),
                                                            value: "reputation",
                                                            emoji: '<:reputation:896733497622949898>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA51'),
                                                            description: message.translate('Misc/help:AJUDA52'),
                                                            value: "ticket",
                                                            emoji: '<:ticket:896730680506085396>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA53'),
                                                            description: message.translate('Misc/help:AJUDA54'),
                                                            value: "verify",
                                                            emoji: '<:verify:896734198486958121>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/help:AJUDA55'),
                                                            description: message.translate('Misc/help:AJUDA56'),
                                                            value: "rr",
                                                            emoji: '<:reactionrole:896734822922330202>',
                                                        },
                                                    ]),
                                            );
                                        const roww = new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId('inicio')
                                                    .setLabel(message.translate('Misc/help:AJUDA57'))
                                                    .setEmoji(`<:inicio:896451813367250974>`)
                                                    .setStyle(ButtonStyle.Secondary),
                                                new ButtonBuilder()
                                                    .setCustomId('commands')
                                                    .setLabel(message.translate('Misc/help:AJUDA58'))
                                                    .setEmoji(`<:addon:896441362856173619>`)
                                                    .setStyle(ButtonStyle.Success),
                                                new ButtonBuilder()
                                                    .setCustomId('delete')
                                                    .setLabel(message.translate('Misc/help:AJUDA59'))
                                                    .setStyle(ButtonStyle.Danger)
                                                    .setEmoji(`<:close:896442104912412724>`)
                                            );

                                        /* const embed = new Embed(bot, message.guild)
                                            .setTitle('Addons/configurações:ANIMES_TITULO')
                                            .addFields(
                                                { name: '\u200b', value: `${message.translate('Addons/configurações:ANIMES_FIELD')}`, inline: false },
                                                { name: message.translate('Addons/configurações:ANIMES_FIELD1'), value: stats[animesToggle], inline: true },
                                                { name: `${message.translate('Addons/configurações:ANIMES_FIELD2')}`, value: animesCanal || `${info3}`, inline: true },
                                                { name: `${message.translate('Addons/configurações:ANIMES_FIELD5')}`, value: animesLista.join(" - ") || `${info3}`, inline: false },
                                                { name: `${message.translate('Addons/configurações:ANIMES_FIELD3')}`, value: message.translate('Addons/configurações:ANIMES_FIELD4', { prefix: settings.prefix }) }); */
                                        const embed = new Embed(bot, message.guild)
                                            .setTitle(`Uh-oh! Command in Updating`)
                                            .setDescription(`Dear user, this command is currently being updated for __implementation__ of *new enhancements and fixes*.\n\nDon't worry, you can still use it normally through the **Hope Dashboard**: [https://hopebot.top/dashboard/${message.guild.id}/auto-anime](https://hopebot.top/dashboard/${message.guild.id}/auto-anime).`)
                                            .setFooter({ text: `Soon this command will be available again, thank you for your understanding.` })
                                        // If no channels, it will dm the owner.
                                        chan.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                                            m.timedDelete({ timeout: 300005 })
                                            // Create collector
                                            const filter = i => i.message.id === m.id;

                                            const collector = chan.createMessageComponentCollector({ filter: filter, time: 300000 });
                                            let value;
                                            collector.on('collect', async i => {
                                                if (i.values) {
                                                    value = i.values[0];
                                                } else {
                                                    value = null
                                                }
                                                /* async function reply(t) {
                                                    const tt = { "1": sembed, "2": rembed, "3": bembed };
                                    
                                                    await i.reply({ embeds: [tt[t]], ephemeral: true })
                                    
                                                    return null;
                                                } */
                                                if (value === 'autoanimes') {
                                                    m.delete()
                                                    message.args[0] = 'anime';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                    // i.deferUpdate();
                                                } else if (value === 'app') {
                                                    m.delete()
                                                    message.args[0] = 'app';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                    // i.deferUpdate();
                                                } else if (value === 'birth') {
                                                    m.delete()
                                                    message.args[0] = 'birthday';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                    // i.deferUpdate();
                                                    /* } else if (value === 'ss') {
                                            m.delete()
                                            message.args[0] = 'ss';
                                            await bot.commands.get('settings').run(bot, message, settings);
                                            // i.deferUpdate(); */
                                                } else if (value === 'automod') {
                                                    m.delete()
                                                    // message.args[0] = 'anime';
                                                    await bot.commands.get('auto-mod').run(bot, message, settings);
                                                    // i.deferUpdate();
                                                } else if (value === 'autocovid') {
                                                    m.delete()
                                                    message.args[0] = 'covid';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'autoresponse') {
                                                    m.delete()
                                                    message.args[0] = 'ar';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'autotwitch') {
                                                    m.delete()
                                                    message.args[0] = 'twitch';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'autoyoutube') {
                                                    m.delete()
                                                    message.args[0] = 'youtube';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'autonick') {
                                                    m.delete()
                                                    message.args[0] = 'nick';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'automessage') {
                                                    m.delete()
                                                    message.args[0] = 'message';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'welcome') {
                                                    m.delete()
                                                    message.args[0] = 'welcome';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'level') {
                                                    m.delete()
                                                    message.args[0] = 'level';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'moderation') {
                                                    m.delete()
                                                    message.args[0] = 'moderation';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'ticket') {
                                                    m.delete()
                                                    message.args[0] = 'ticket';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'suggestion') {
                                                    m.delete()
                                                    message.args[0] = 'suggestion';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'ticket') {
                                                    m.delete()
                                                    message.args[0] = 'ticket';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'system') {
                                                    m.delete()
                                                    message.args[0] = 'system';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'sticky') {
                                                    m.delete()
                                                    message.args[0] = 'sticky';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'reputation') {
                                                    m.delete()
                                                    message.args[0] = 'rep';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'ticket') {
                                                    m.delete()
                                                    message.args[0] = 'ticket';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'verify') {
                                                    m.delete()
                                                    message.args[0] = 'vf';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (value === 'rr') {
                                                    m.delete()
                                                    message.args[0] = 'rr';
                                                    await bot.commands.get('settings').run(bot, message, settings);
                                                } else if (i?.customId === 'inicio') {
                                                    m.delete().catch(() => {
                                                        // do nothing.
                                                    });
                                                    await bot.commands.get('help').run(bot, message, settings);
                                                } else if (i?.customId === 'delete') {
                                                    m.delete().catch(() => {
                                                        // do nothing.
                                                    });
                                                } else if (i?.customId === 'commands') {
                                                    m.delete().catch(() => {
                                                        // do nothing.
                                                    });
                                                }
                                                i.deferUpdate();
                                                collector.on('end', async collected => {
                                                    const embedd = new Embed(bot, message.guild)
                                                        .setTitle(`<:h:902714203775860786> <:o:902714203499008032> <:p:902714203834548224> <:e:902714203645829172>`)
                                                        .setThumbnail('https://i.imgur.com/sbTZHbT.png')
                                                        .setColor(16722829)
                                                        .setDescription(`__**Useful links:**__ [Privacy policy](https://hopebot.top/privacy-policy) | [Status](https://hopebot.top/status) | [Become a Partner](https://hopebot.top/news/become-a-partner) | [Website](https://hopebot.top/)\n\n${message.translate('Misc/help:AJUDA_DESCRIÇÃOO')} ${message.translate('Misc/help:AJUDA_DATA', { moment: moment(guildDB.time).format("L") })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOOOO', { moment: moment(guildDB.time).fromNow() })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOO', { news: guildDB.news })}`)
                                                        .addFields(
                                                            { name: message.translate('Misc/help:AJUDA5'), value: message.translate('Misc/help:AJUDA6', { prefix: settings.prefix }), inline: true },
                                                            { name: message.translate('Misc/help:AJUDA7'), value: message.translate('Misc/help:AJUDA8', { prefix: settings.prefix }), inline: true },
                                                            { name: message.translate('Misc/help:AJUDA9'), value: message.translate('Misc/help:AJUDA10'), inline: false },
                                                            { name: message.translate('Misc/help:AJUDA11'), value: message.translate('Misc/help:AJUDA12', { prefix: settings.prefix }), inline: true },
                                                            { name: message.translate('Misc/help:AJUDA13'), value: message.translate('Misc/help:AJUDA14', { invite: genInviteLink(bot) }), inline: true })
                                                        .setFooter({ text: message.translate('Misc/help:AJUDA15') })

                                                    const targetMessage = await message.channel.messages.fetch(m.id, false, true);
                                                    embedd.addFields({ name: 'You get more control from the website, https://hopebot.top/', value: `\`\`\`Session ended, please say "${settings.prefix}help" again.\`\`\``, inline: false })
                                                    targetMessage.edit({ embeds: [embedd], components: [] })
                                                });
                                            });
                                        });
                                    }
                                    i.deferUpdate();
                                    collector.on('end', async collected => {
                                        const embedd = new Embed(bot, message.guild)
                                            .setTitle(`<:h:902714203775860786> <:o:902714203499008032> <:p:902714203834548224> <:e:902714203645829172>`)
                                            .setThumbnail('https://i.imgur.com/sbTZHbT.png')
                                            .setColor(16722829)
                                            .setDescription(`__**Useful links:**__ [Privacy policy](https://hopebot.top/privacy-policy) | [Status](https://hopebot.top/status) | [Become a Partner](https://hopebot.top/news/become-a-partner) | [Website](https://hopebot.top/)\n\n${message.translate('Misc/help:AJUDA_DESCRIÇÃOO')} ${message.translate('Misc/help:AJUDA_DATA', { moment: moment(guildDB.time).format("L") })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOOOO', { moment: moment(guildDB.time).fromNow() })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOO', { news: guildDB.news })}`)
                                            .addFields(
                                                { name: message.translate('Misc/help:AJUDA5'), value: message.translate('Misc/help:AJUDA6', { prefix: settings.prefix }), inline: true },
                                                { name: message.translate('Misc/help:AJUDA7'), value: message.translate('Misc/help:AJUDA8', { prefix: settings.prefix }), inline: true },
                                                { name: message.translate('Misc/help:AJUDA9'), value: message.translate('Misc/help:AJUDA10'), inline: false },
                                                { name: message.translate('Misc/help:AJUDA11'), value: message.translate('Misc/help:AJUDA12', { prefix: settings.prefix }), inline: true },
                                                { name: message.translate('Misc/help:AJUDA13'), value: message.translate('Misc/help:AJUDA14', { invite: genInviteLink(bot) }), inline: true })
                                            // { name: 'You get more control from the website, https://hopebot.top/', `⠀⠀⠀⠀⠀⠀⠀⠀⠀`, false)
                                            .setFooter({ text: message.translate('Misc/help:AJUDA15') })

                                        const targetMessage = await message.channel.messages.fetch(m.id, false, true)
                                        embedd.addFields({ name: 'You get more control from the website, https://hopebot.top/', value: `\`\`\`Session ended, please say "${settings.prefix}help" again.\`\`\``, inline: false })
                                        targetMessage.edit({ embeds: [embedd], components: [] })
                                    });
                                });
                            });
                        }
                        i.deferUpdate();
                        collector.on('end', async collected => {
                            const embedd = new Embed(bot, message.guild)
                                .setTitle(`<:h:902714203775860786> <:o:902714203499008032> <:p:902714203834548224> <:e:902714203645829172>`)
                                .setThumbnail('https://i.imgur.com/sbTZHbT.png')
                                .setColor(16722829)
                                .setDescription(`__**Useful links:**__ [Privacy policy](https://hopebot.top/privacy-policy) | [Status](https://hopebot.top/status) | [Become a Partner](https://hopebot.top/news/become-a-partner) | [Website](https://hopebot.top/)\n\n${message.translate('Misc/help:AJUDA_DESCRIÇÃOO')} ${message.translate('Misc/help:AJUDA_DATA', { moment: moment(guildDB.time).format("L") })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOOOO', { moment: moment(guildDB.time).fromNow() })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOO', { news: guildDB.news })}`)
                                .addFields(
                                    { name: message.translate('Misc/help:AJUDA5'), value: message.translate('Misc/help:AJUDA6', { prefix: settings.prefix }), inline: true },
                                    { name: message.translate('Misc/help:AJUDA7'), value: message.translate('Misc/help:AJUDA8', { prefix: settings.prefix }), inline: true },
                                    { name: message.translate('Misc/help:AJUDA9'), value: message.translate('Misc/help:AJUDA10'), inline: false },
                                    { name: message.translate('Misc/help:AJUDA11'), value: message.translate('Misc/help:AJUDA12', { prefix: settings.prefix }), inline: true },
                                    { name: message.translate('Misc/help:AJUDA13'), value: message.translate('Misc/help:AJUDA14', { invite: genInviteLink(bot) }), inline: true })
                                // { name: 'You get more control from the website, https://hopebot.top/', `⠀⠀⠀⠀⠀⠀⠀⠀⠀`, false)
                                .setFooter({ text: message.translate('Misc/help:AJUDA15') })

                            const targetMessage = await message.channel.messages.fetch(m.id, false, true)
                            embedd.addFields({ name: 'You get more control from the website, https://hopebot.top/', value: `\`\`\`Session ended, please say "${settings.prefix}help" again.\`\`\``, inline: false })
                            targetMessage.edit({ embeds: [embedd], components: [] })
                        });
                    });
                });
            }
        });
        collector.on('end', async collected => {
            const embedd = new Embed(bot, message.guild)
            .setTitle(`<:hnew:936647247653920778> <:onew:936647247666503700> <:pnew:936647247590989936> <:enew:936647247708450927>`)
            .setThumbnail('https://i.imgur.com/yj0dlAI.png')
            .setColor(16722829)
            .setDescription(`Commands in this server start with \`${settings.prefix}\`\n\n${message.translate('Misc/help:AJUDA_DESCRIÇÃOO')} ${message.translate('Misc/help:AJUDA_DATA', { moment: moment(guildDB.time).format("L") })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOOOO', { moment: moment(guildDB.time).fromNow() })} ${message.translate('Misc/help:AJUDA_DESCRIÇÃOOO', { news: guildDB.news })}`)
            .addFields(
                { name: message.translate('Misc/help:AJUDA5'), value: message.translate('Misc/help:AJUDA6', { prefix: settings.prefix }), inline: true },
                { name: message.translate('Misc/help:AJUDA7'), value: message.translate('Misc/help:AJUDA8', { prefix: settings.prefix }), inline: true },
                { name: message.translate('Misc/help:AJUDA9'), value: message.translate('Misc/help:AJUDA10'), inline: false },
                { name: message.translate('Misc/help:AJUDA11'), value: message.translate('Misc/help:AJUDA12', { prefix: settings.prefix }), inline: true },
                { name: message.translate('Misc/help:AJUDA13'), value: `[Invite Hope](${genInviteLink(bot)}) to your server`, inline: true },
                { name: 'Premium', value: 'Unlock more features and commands with [Premium](https://hopebot.top/premium)', inline: false },
                { name: 'Dashboard', value: 'Manage Hope easily with the [dashboard](https://hopebot.top/)', inline: false },
            )
            .setFooter({ text: message.translate('Misc/help:AJUDA15') })

            const targetMessage = await message.channel.messages.fetch(editthis.id, false, false)
            embedd.addFields({ name: '\u200B', value: `\`\`\`Session ended, please use "${settings.prefix}help" again.\`\`\``, inline: false })
            targetMessage.edit({ embeds: [embedd], components: [] })
        });
    }
};