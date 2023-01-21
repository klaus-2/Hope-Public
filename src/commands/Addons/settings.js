// Dependências
const { Embed } = require(`../../utils`),
    { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Settings extends Command {
    constructor(bot) {
        super(bot, {
            name: 'settings',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['config', 'settings'],
            userPermissions: [Flags.ManageGuild],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Displays all Hope add-ons settings',
            usage: '<prefix><commandName> [option]',
            cooldown: 5000,
            examples: ['/settings', '.settings ticket', '!config system', '?configurações twitch'],
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        // msg de espera
        // const msg = await message.channel.send(message.translate("Pesquisas/twitch:TWITCH"));

        switch (message.args[0]) {
            case 's':
            case 'sist':
            case 'sistema':
            case 'system':
            case 't':
            case 'ticket':
            case 'tickets':
            case 'app':
            case 'application':
            case 'applications':
            case 'mod':
            case 'moderação':
            case 'moderacao':
            case 'moderation':
            case 'l':
            case 'lvl':
            case 'level':
            case 'nivel':
            case 'bv':
            case 'boasvindas':
            case 'boas-vindas':
            case 'bemvindo':
            case 'welcome':
            case 'm':
            case 'musica':
            case 'music':
            case 'ac':
            case 'covid':
            case 'auto-covid':
            case 'autocovid':
            case 'autocorona':
            case 'aut-covid':
            case 'vf':
            case 'verificar':
            case 'verificação':
            case 'verification':
            case 'vef':
            case 'ar':
            case 'autoresposta':
            case 'autoresponse':
            case 'auto-resposta':
            case 'auto-respostas':
            case 'auto-response':
            case 'sticky':
            case 'stickie':
            case 'stick':
            case 'stck':
            case 'sticke':
            case 'rep':
            case 'reputations':
            case 'reputação':
            case 'reputações':
            case 'reputation':
            case 'niver':
            case 'aniversariantes':
            case 'aniversario':
            case 'birthdays':
            case 'birthday':
            case 'twitch':
            case 'autotwitch':
            case 'auto-twitch':
            case 'auto-twt':
            case 'auto-ttw':
            case 'youtube':
            case 'autoyoutube':
            case 'auto-youtube':
            case 'auto-yout':
            case 'auto-you':
            case 'reddit':
            case 'autoreddit':
            case 'auto-reditt':
            case 'auto-subreddit':
            case 'subreddit':
            case 'animes':
            case 'autoanimes':
            case 'auto-animes':
            case 'auto-anime':
            case 'anime':
            case 'mensagem':
            case 'message':
            case 'auto-mensagem':
            case 'auto-message':
            case 'nick':
            case 'nicks':
            case 'auto-nick':
            case 'auto-nicks':
            case 'rr':
            case 'reactionrole':
            case 'reactionroles':
            case 'reaction-role':
            case 'rr-role':
            case 'su':
            case 'sugestao':
            case 'sugestão':
            case 'suggestion':
            case 'sugestões':

                const row = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('options')
                            .setPlaceholder(message.translate('Misc/ajuda:AJUDA'))
                            .addOptions([
                                {
                                    label: message.translate('Misc/ajuda:AJUDA60'),
                                    description: message.translate('Misc/ajuda:AJUDA61'),
                                    value: 'app',
                                    emoji: '<:applications:897903410135851009>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA19'),
                                    description: message.translate('Misc/ajuda:AJUDA20'),
                                    value: 'autoanimes',
                                    emoji: '<:anime:830174554012778587>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA21'),
                                    description: message.translate('Misc/ajuda:AJUDA22'),
                                    value: "automod",
                                    emoji: '<:automod:896720524284166184>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA23'),
                                    description: message.translate('Misc/ajuda:AJUDA24'),
                                    value: "autocovid",
                                    emoji: '<:autocovid:896720952988172309>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA25'),
                                    description: message.translate('Misc/ajuda:AJUDA26'),
                                    value: "autoresponse",
                                    emoji: '<:autoresponse:896721652530962472>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA27'),
                                    description: message.translate('Misc/ajuda:AJUDA28'),
                                    value: "autotwitch",
                                    emoji: '<:autotwitch:896722126613123093>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA29'),
                                    description: message.translate('Misc/ajuda:AJUDA30'),
                                    value: "autoyoutube",
                                    emoji: '<:autoyoutube:896722997598097409>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA33'),
                                    description: message.translate('Misc/ajuda:AJUDA34'),
                                    value: "autonick",
                                    emoji: '<:autonick:896723882675957840>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA35'),
                                    description: message.translate('Misc/ajuda:AJUDA36'),
                                    value: "automessage",
                                    emoji: '<:automessage:896724725798174751>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA62'),
                                    description: message.translate('Misc/ajuda:AJUDA63'),
                                    value: 'birth',
                                    emoji: '<:birthday:897904377120030730>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA37'),
                                    description: message.translate('Misc/ajuda:AJUDA38'),
                                    value: "welcome",
                                    emoji: '<:welcome:896725138492522506>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA39'),
                                    description: message.translate('Misc/ajuda:AJUDA40'),
                                    value: "level",
                                    emoji: '<:level:896727226760953896>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA41'),
                                    description: message.translate('Misc/ajuda:AJUDA42'),
                                    value: "moderation",
                                    emoji: '<:moderation:896730204121235507>',
                                },
                                /* {
                                    label: message.translate('Misc/ajuda:AJUDA64'),
                                    description: message.translate('Misc/ajuda:AJUDA65'),
                                    value: 'ss',
                                    emoji: '<:stats:897904377153613844>',
                                }, */
                                {
                                    label: message.translate('Misc/ajuda:AJUDA43'),
                                    description: message.translate('Misc/ajuda:AJUDA44'),
                                    value: "suggestion",
                                    emoji: '<:suggestion:896730918193094717>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA45'),
                                    description: message.translate('Misc/ajuda:AJUDA46'),
                                    value: "system",
                                    emoji: '<:system:896732249469378660>',
                                },
                                /* {
                                                label: message.translate('Misc/ajuda:AJUDA47'),
                                                description: message.translate('Misc/ajuda:AJUDA48'),
                                                value: "sticky",
                                                emoji: '<:sticky:896732586171301888>',
                                            }, */
                                {
                                    label: message.translate('Misc/ajuda:AJUDA49'),
                                    description: message.translate('Misc/ajuda:AJUDA50'),
                                    value: "reputation",
                                    emoji: '<:reputation:896733497622949898>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA51'),
                                    description: message.translate('Misc/ajuda:AJUDA52'),
                                    value: "ticket",
                                    emoji: '<:ticket:896730680506085396>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA53'),
                                    description: message.translate('Misc/ajuda:AJUDA54'),
                                    value: "verify",
                                    emoji: '<:verify:896734198486958121>',
                                },
                                {
                                    label: message.translate('Misc/ajuda:AJUDA55'),
                                    description: message.translate('Misc/ajuda:AJUDA56'),
                                    value: "rr",
                                    emoji: '<:reactionrole:896734822922330202>',
                                },
                            ]),
                    );
                const roww = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('inicio')
                            .setLabel(message.translate('Misc/ajuda:AJUDA16'))
                            .setEmoji(`<:inicio:896451813367250974>`)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('addons')
                            .setLabel(message.translate('Misc/ajuda:AJUDA17'))
                            .setEmoji(`<:addon:896441362856173619>`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('delete')
                            .setLabel(message.translate('Misc/ajuda:AJUDA18'))
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji(`<:close:896442104912412724>`)
                    );

                const embed = new Embed(bot, message.guild)
                    .setTitle(`Uh-oh! Command in Updating`)
                    .setDescription(`Dear user, this command is currently being updated for __implementation__ of *new enhancements and fixes*.\n\nDon't worry, you can still use it normally through the **Hope Dashboard**: [https://hopebot.top/dashboard/${message.guild.id}/auto-anime](https://hopebot.top/dashboard/${message.guild.id}/auto-anime).`)
                    .setFooter({ text: `Soon this command will be available again, thank you for your understanding.` })
                    .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true }))
                    .setTimestamp()
                    .setColor(5334012);

                return message.channel.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                    if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 120000 }) };
                    // Create collector
                    const filter = i => i.message.id === m.id;

                    const collector = message.channel.createMessageComponentCollector({ filter: filter, time: 300000 });
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
                        } else if (value === 'autoreddit') {
                            m.delete()
                            message.args[0] = 'reddit';
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
                            const row = new MessageActionRow()
                                .addComponents(
                                    new MessageSelectMenu()
                                        .setCustomId('options')
                                        .setPlaceholder(message.translate('Misc/ajuda:AJUDA'))
                                        .addOptions([
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA1'),
                                                description: message.translate('Misc/ajuda:AAJUDA2'),
                                                value: 'animes',
                                                emoji: '<:anime:830174554012778587>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA5'),
                                                description: message.translate('Misc/ajuda:AAJUDA6'),
                                                value: "ações",
                                                emoji: '<:acao:830841929359949884>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA7'),
                                                description: message.translate('Misc/ajuda:AAJUDA8'),
                                                value: "diversão",
                                                emoji: '<:Fun:823004802107703327>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA9'),
                                                description: message.translate('Misc/ajuda:AAJUDA10'),
                                                value: "economia",
                                                emoji: '<:economia:830175433140076544>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA11'),
                                                description: message.translate('Misc/ajuda:AAJUDA12'),
                                                value: "extras",
                                                emoji: '<:Extra:823008067368124476>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA13'),
                                                description: message.translate('Misc/ajuda:AAJUDA14'),
                                                value: "imagem",
                                                emoji: '<:Imagem:823004649781985311>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA15'),
                                                description: message.translate('Misc/ajuda:AAJUDA16'),
                                                value: "jogos",
                                                emoji: '<:jogos:824720991288295504>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA17'),
                                                description: message.translate('Misc/ajuda:AAJUDA18'),
                                                value: "moderação",
                                                emoji: '<:Moderao:823004537756844073>',
                                            },
                                            /* {
                                              label: message.translate('Misc/ajuda:AAJUDA19'),
                                              description: message.translate('Misc/ajuda:AAJUDA20'),
                                              value: "nsfw",
                                              emoji: '<:18:823003678557470781>',
                                            },
                                            {
                                              label: message.translate('Misc/ajuda:AAJUDA21'),
                                              description: message.translate('Misc/ajuda:AAJUDA22'),
                                              value: "musica",
                                              emoji: '<:Skyedj:875040358311026749>',
                                            }, */
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA23'),
                                                description: message.translate('Misc/ajuda:AAJUDA24'),
                                                value: "pesquisas",
                                                emoji: '<:Pesquisas:823004382127849513>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA25'),
                                                description: message.translate('Misc/ajuda:AAJUDA26'),
                                                value: "servidor",
                                                emoji: '<:Servidor:823004266981621779>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA27'),
                                                description: message.translate('Misc/ajuda:AAJUDA28'),
                                                value: "sorteio",
                                                emoji: '<:Sorteio:823004188292022303>',
                                            },
                                            {
                                                label: message.translate('Misc/ajuda:AAJUDA29'),
                                                description: message.translate('Misc/ajuda:AAJUDA30'),
                                                value: "ticket",
                                                emoji: '🎟️',
                                            },
                                        ]),
                                );
                            const roww = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('inicio')
                                        .setLabel(message.translate('Misc/ajuda:AJUDA16'))
                                        .setEmoji(`<:inicio:896451813367250974>`)
                                        .setStyle(2),
                                    new MessageButton()
                                        .setCustomId('addons')
                                        .setLabel(message.translate('Misc/ajuda:AJUDA17'))
                                        .setEmoji(`<:addon:896441362856173619>`)
                                        .setStyle('SUCCESS'),
                                    new MessageButton()
                                        .setCustomId('delete')
                                        .setLabel(message.translate('Misc/ajuda:AJUDA18'))
                                        .setStyle('DANGER')
                                        .setEmoji(`<:close:896442104912412724>`)
                                );

                            const embed = new Embed(bot, message.guild)
                                .setThumbnail('https://i.imgur.com/tpeRrsT.png')
                                .setColor(65475)
                                .setDescription(message.translate('Misc/ajuda:ANIME_DESCRIÇÃO', { prefix: settings.prefix }))
                                .setAuthor({ name: message.translate('Misc/ajuda:AJUDA_AUTHOR', { username: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                                .setImage('https://i.imgur.com/MLpn37k.png');
                            // If no channels, it will dm the owner.
                            message.channel.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                                m.timedDelete({ timeout: 300005 })
                                // Create collector
                                const filter = i => i.message.id === m.id;

                                const collector = message.channel.createMessageComponentCollector({ filter: filter, time: 300000 });
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
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:AÇÕES_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/DZKqnWL.png')] });
                                        // i.deferUpdate();
                                    } else if (value === 'animes') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/tpeRrsT.png')] });
                                        m.edit({ embeds: [embed.setColor(65475)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:ANIME_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/MLpn37k.png')] });
                                        // i.deferUpdate();
                                    } else if (value === 'addons') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/Ht02t2U.png')] });
                                        m.edit({ embeds: [embed.setColor(5334012)] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/nAirjGv.png')] });
                                        if (message.guild.id == '333949691962195969') {
                                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:ADDONS_TOPGG', { prefix: settings.prefix }))] });
                                        } else {
                                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:ADDONS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        }
                                    } else if (value === 'diversão') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/jzOE29T.png')] });
                                        m.edit({ embeds: [embed.setColor(16279836)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:DIVERSÃO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/J0fFkj0.png')] });
                                    } else if (value === 'economia') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/sY40tlL.png')] });
                                        m.edit({ embeds: [embed.setColor(327424)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:ECONOMIA_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/FWgUj2B.png')] });
                                    } else if (value === 'extras') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/xrENyIs.png')] });
                                        m.edit({ embeds: [embed.setColor(16775424)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:EXTRAS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/wMh9ZOx.png')] });
                                    } else if (value === 'imagem') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/whTAgD0.png')] });
                                        m.edit({ embeds: [embed.setColor(16711902)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:IMAGEM_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/UPFzv63.png')] });
                                    } else if (value === 'jogos') {
                                        // sot img https://i.imgur.com/BlBktvi.png
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/2kJHrio.png')] });
                                        m.edit({ embeds: [embed.setColor(13210623)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:JOGOS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/s5Fk6gg.png')] });
                                    } else if (value === 'moderação') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/mPdaiV5.png')] });
                                        m.edit({ embeds: [embed.setColor(16711709)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:MODERAÇÃO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/n30jUDZ.png')] });
                                    } else if (value === 'nsfw') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/WJWDw2P.png')] });
                                        m.edit({ embeds: [embed.setColor(1)] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/gIJ1sof.png')] });
                                        if (message.guild.id == '333949691962195969') {
                                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:NSFW_TOPGG', { prefix: settings.prefix }))] });
                                        } else {
                                            m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:NSFW_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        }
                                    } else if (value === 'musica') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/iJawoRC.png')] });
                                        m.edit({ embeds: [embed.setColor(16651084)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:HopeDJ_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/WZ2zB5i.png')] });
                                    } else if (value === 'pesquisas') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/7HuMF3g.png')] });
                                        m.edit({ embeds: [embed.setColor(12317183)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:PESQUISAS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/tTbTOFf.png')] });
                                    } else if (value === 'servidor') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/L2vHLKK.png')] });
                                        m.edit({ embeds: [embed.setColor(1)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:SERVIDOR_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/oiYZlQB.png')] });
                                    } else if (value === 'sorteio') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/3DM9Nxj.png')] });
                                        m.edit({ embeds: [embed.setColor(12118406)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:SORTEIO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                        m.edit({ embeds: [embed.setImage('https://i.imgur.com/qbFBr2d.png')] });
                                    } else if (value === 'ticket') {
                                        m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/RinEXHZ.png')] });
                                        m.edit({ embeds: [embed.setColor(9442302)] });
                                        m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:TICKET_DESCRIÇÃO', { prefix: settings.prefix }))] });
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
                                        const row = new MessageActionRow()
                                            .addComponents(
                                                new MessageSelectMenu()
                                                    .setCustomId('options')
                                                    .setPlaceholder(message.translate('Misc/ajuda:AJUDA'))
                                                    .addOptions([
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA60'),
                                                            description: message.translate('Misc/ajuda:AJUDA61'),
                                                            value: 'app',
                                                            emoji: '<:applications:897903410135851009>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA19'),
                                                            description: message.translate('Misc/ajuda:AJUDA20'),
                                                            value: 'autoanimes',
                                                            emoji: '<:anime:830174554012778587>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA21'),
                                                            description: message.translate('Misc/ajuda:AJUDA22'),
                                                            value: "automod",
                                                            emoji: '<:automod:896720524284166184>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA23'),
                                                            description: message.translate('Misc/ajuda:AJUDA24'),
                                                            value: "autocovid",
                                                            emoji: '<:autocovid:896720952988172309>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA25'),
                                                            description: message.translate('Misc/ajuda:AJUDA26'),
                                                            value: "autoresponse",
                                                            emoji: '<:autoresponse:896721652530962472>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA27'),
                                                            description: message.translate('Misc/ajuda:AJUDA28'),
                                                            value: "autotwitch",
                                                            emoji: '<:autotwitch:896722126613123093>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA29'),
                                                            description: message.translate('Misc/ajuda:AJUDA30'),
                                                            value: "autoyoutube",
                                                            emoji: '<:autoyoutube:896722997598097409>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA33'),
                                                            description: message.translate('Misc/ajuda:AJUDA34'),
                                                            value: "autonick",
                                                            emoji: '<:autonick:896723882675957840>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA35'),
                                                            description: message.translate('Misc/ajuda:AJUDA36'),
                                                            value: "automessage",
                                                            emoji: '<:automessage:896724725798174751>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA62'),
                                                            description: message.translate('Misc/ajuda:AJUDA63'),
                                                            value: 'birth',
                                                            emoji: '<:birthday:897904377120030730>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA37'),
                                                            description: message.translate('Misc/ajuda:AJUDA38'),
                                                            value: "welcome",
                                                            emoji: '<:welcome:896725138492522506>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA39'),
                                                            description: message.translate('Misc/ajuda:AJUDA40'),
                                                            value: "level",
                                                            emoji: '<:level:896727226760953896>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA41'),
                                                            description: message.translate('Misc/ajuda:AJUDA42'),
                                                            value: "moderation",
                                                            emoji: '<:moderation:896730204121235507>',
                                                        },
                                                        /* {
                                                            label: message.translate('Misc/ajuda:AJUDA64'),
                                                            description: message.translate('Misc/ajuda:AJUDA65'),
                                                            value: 'ss',
                                                            emoji: '<:stats:897904377153613844>',
                                                        }, */
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA43'),
                                                            description: message.translate('Misc/ajuda:AJUDA44'),
                                                            value: "suggestion",
                                                            emoji: '<:suggestion:896730918193094717>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA45'),
                                                            description: message.translate('Misc/ajuda:AJUDA46'),
                                                            value: "system",
                                                            emoji: '<:system:896732249469378660>',
                                                        },
                                                        /* {
                                                                        label: message.translate('Misc/ajuda:AJUDA47'),
                                                                        description: message.translate('Misc/ajuda:AJUDA48'),
                                                                        value: "sticky",
                                                                        emoji: '<:sticky:896732586171301888>',
                                                                    }, */
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA49'),
                                                            description: message.translate('Misc/ajuda:AJUDA50'),
                                                            value: "reputation",
                                                            emoji: '<:reputation:896733497622949898>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA51'),
                                                            description: message.translate('Misc/ajuda:AJUDA52'),
                                                            value: "ticket",
                                                            emoji: '<:ticket:896730680506085396>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA53'),
                                                            description: message.translate('Misc/ajuda:AJUDA54'),
                                                            value: "verify",
                                                            emoji: '<:verify:896734198486958121>',
                                                        },
                                                        {
                                                            label: message.translate('Misc/ajuda:AJUDA55'),
                                                            description: message.translate('Misc/ajuda:AJUDA56'),
                                                            value: "rr",
                                                            emoji: '<:reactionrole:896734822922330202>',
                                                        },
                                                    ]),
                                            );
                                        const roww = new MessageActionRow()
                                            .addComponents(
                                                new MessageButton()
                                                    .setCustomId('inicio')
                                                    .setLabel(message.translate('Misc/ajuda:AJUDA57'))
                                                    .setEmoji(`<:inicio:896451813367250974>`)
                                                    .setStyle(2),
                                                new MessageButton()
                                                    .setCustomId('commands')
                                                    .setLabel(message.translate('Misc/ajuda:AJUDA58'))
                                                    .setEmoji(`<:addon:896441362856173619>`)
                                                    .setStyle('SUCCESS'),
                                                new MessageButton()
                                                    .setCustomId('delete')
                                                    .setLabel(message.translate('Misc/ajuda:AJUDA59'))
                                                    .setStyle('DANGER')
                                                    .setEmoji(`<:close:896442104912412724>`)
                                            );

                                        const embed = new Embed(bot, message.guild)
                                            .setTitle('Addons/configurações:ANIMES_TITULO')
                                            .addFields(
                                                { name: '\u200b', value: `${message.translate('Addons/configurações:ANIMES_FIELD')}`, inline: false },
                                                { name: `${message.translate('Addons/configurações:ANIMES_FIELD1')}`, value: `${stats[animesToggle]}`, inline: true },
                                                { name: `${message.translate('Addons/configurações:ANIMES_FIELD2')}`, value: `${animesCanal || `${info3}`}`, inline: true },
                                                { name: `${message.translate('Addons/configurações:ANIMES_FIELD5')}`, value: `${animesLista.join(" - ") || `${info3}`}`, inline: false },
                                                { name: `${message.translate('Addons/configurações:ANIMES_FIELD3')}`, value: `${message.translate('Addons/configurações:ANIMES_FIELD4', { prefix: settings.prefix })}`, inline: false });
                                        // If no channels, it will dm the owner.
                                        message.channel.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                                            m.timedDelete({ timeout: 300005 })
                                            // Create collector
                                            const filter = i => i.message.id === m.id;

                                            const collector = message.channel.createMessageComponentCollector({ filter: filter, time: 300000 });
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
                                                } else if (value === 'autoreddit') {
                                                    m.delete()
                                                    message.args[0] = 'reddit';
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
                                                    const row = new MessageActionRow()
                                                        .addComponents(
                                                            new MessageSelectMenu()
                                                                .setCustomId('options')
                                                                .setPlaceholder(message.translate('Misc/ajuda:AJUDA'))
                                                                .addOptions([
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA1'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA2'),
                                                                        value: 'animes',
                                                                        emoji: '<:anime:830174554012778587>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA5'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA6'),
                                                                        value: "ações",
                                                                        emoji: '<:acao:830841929359949884>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA7'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA8'),
                                                                        value: "diversão",
                                                                        emoji: '<:Fun:823004802107703327>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA9'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA10'),
                                                                        value: "economia",
                                                                        emoji: '<:economia:830175433140076544>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA11'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA12'),
                                                                        value: "extras",
                                                                        emoji: '<:Extra:823008067368124476>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA13'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA14'),
                                                                        value: "imagem",
                                                                        emoji: '<:Imagem:823004649781985311>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA15'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA16'),
                                                                        value: "jogos",
                                                                        emoji: '<:jogos:824720991288295504>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA17'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA18'),
                                                                        value: "moderação",
                                                                        emoji: '<:Moderao:823004537756844073>',
                                                                    },
                                                                    /* {
                                                          label: message.translate('Misc/ajuda:AAJUDA19'),
                                                          description: message.translate('Misc/ajuda:AAJUDA20'),
                                                          value: "nsfw",
                                                          emoji: '<:18:823003678557470781>',
                                                        },
                                                        {
                                                          label: message.translate('Misc/ajuda:AAJUDA21'),
                                                          description: message.translate('Misc/ajuda:AAJUDA22'),
                                                          value: "musica",
                                                          emoji: '<:Skyedj:875040358311026749>',
                                                        }, */
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA23'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA24'),
                                                                        value: "pesquisas",
                                                                        emoji: '<:Pesquisas:823004382127849513>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA25'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA26'),
                                                                        value: "servidor",
                                                                        emoji: '<:Servidor:823004266981621779>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA27'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA28'),
                                                                        value: "sorteio",
                                                                        emoji: '<:Sorteio:823004188292022303>',
                                                                    },
                                                                    {
                                                                        label: message.translate('Misc/ajuda:AAJUDA29'),
                                                                        description: message.translate('Misc/ajuda:AAJUDA30'),
                                                                        value: "ticket",
                                                                        emoji: '🎟️',
                                                                    },
                                                                ]),
                                                        );
                                                    const roww = new MessageActionRow()
                                                        .addComponents(
                                                            new MessageButton()
                                                                .setCustomId('inicio')
                                                                .setLabel(message.translate('Misc/ajuda:AJUDA16'))
                                                                .setEmoji(`<:inicio:896451813367250974>`)
                                                                .setStyle(2),
                                                            new MessageButton()
                                                                .setCustomId('addons')
                                                                .setLabel(message.translate('Misc/ajuda:AJUDA17'))
                                                                .setEmoji(`<:addon:896441362856173619>`)
                                                                .setStyle('SUCCESS'),
                                                            new MessageButton()
                                                                .setCustomId('delete')
                                                                .setLabel(message.translate('Misc/ajuda:AJUDA18'))
                                                                .setStyle('DANGER')
                                                                .setEmoji(`<:close:896442104912412724>`)
                                                        );

                                                    const embed = new Embed(bot, message.guild)
                                                        .setThumbnail('https://i.imgur.com/tpeRrsT.png')
                                                        .setColor(65475)
                                                        .setDescription(message.translate('Misc/ajuda:ANIME_DESCRIÇÃO', { prefix: settings.prefix }))
                                                        .setAuthor({ name: message.translate('Misc/ajuda:AJUDA_AUTHOR', { username: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                                                        .setImage('https://i.imgur.com/MLpn37k.png');
                                                    // If no channels, it will dm the owner.
                                                    message.channel.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                                                        m.timedDelete({ timeout: 300005 })
                                                        // Create collector
                                                        const filter = i => i.message.id === m.id;

                                                        const collector = message.channel.createMessageComponentCollector({ filter: filter, time: 300000 });
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
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:AÇÕES_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/DZKqnWL.png')] });
                                                                // i.deferUpdate();
                                                            } else if (value === 'animes') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/tpeRrsT.png')] });
                                                                m.edit({ embeds: [embed.setColor(65475)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:ANIME_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/MLpn37k.png')] });
                                                                // i.deferUpdate();
                                                            } else if (value === 'addons') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/Ht02t2U.png')] });
                                                                m.edit({ embeds: [embed.setColor(5334012)] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/nAirjGv.png')] });
                                                                if (message.guild.id == '333949691962195969') {
                                                                    m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:ADDONS_TOPGG', { prefix: settings.prefix }))] });
                                                                } else {
                                                                    m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:ADDONS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                }
                                                            } else if (value === 'diversão') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/jzOE29T.png')] });
                                                                m.edit({ embeds: [embed.setColor(16279836)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:DIVERSÃO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/J0fFkj0.png')] });
                                                            } else if (value === 'economia') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/sY40tlL.png')] });
                                                                m.edit({ embeds: [embed.setColor(327424)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:ECONOMIA_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/FWgUj2B.png')] });
                                                            } else if (value === 'extras') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/xrENyIs.png')] });
                                                                m.edit({ embeds: [embed.setColor(16775424)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:EXTRAS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/wMh9ZOx.png')] });
                                                            } else if (value === 'imagem') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/whTAgD0.png')] });
                                                                m.edit({ embeds: [embed.setColor(16711902)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:IMAGEM_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/UPFzv63.png')] });
                                                            } else if (value === 'jogos') {
                                                                // sot img https://i.imgur.com/BlBktvi.png
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/2kJHrio.png')] });
                                                                m.edit({ embeds: [embed.setColor(13210623)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:JOGOS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/s5Fk6gg.png')] });
                                                            } else if (value === 'moderação') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/mPdaiV5.png')] });
                                                                m.edit({ embeds: [embed.setColor(16711709)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:MODERAÇÃO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/n30jUDZ.png')] });
                                                            } else if (value === 'nsfw') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/WJWDw2P.png')] });
                                                                m.edit({ embeds: [embed.setColor(1)] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/gIJ1sof.png')] });
                                                                if (message.guild.id == '333949691962195969') {
                                                                    m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:NSFW_TOPGG', { prefix: settings.prefix }))] });
                                                                } else {
                                                                    m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:NSFW_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                }
                                                            } else if (value === 'musica') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/iJawoRC.png')] });
                                                                m.edit({ embeds: [embed.setColor(16651084)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:HopeDJ_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/WZ2zB5i.png')] });
                                                            } else if (value === 'pesquisas') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/7HuMF3g.png')] });
                                                                m.edit({ embeds: [embed.setColor(12317183)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:PESQUISAS_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/tTbTOFf.png')] });
                                                            } else if (value === 'servidor') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/L2vHLKK.png')] });
                                                                m.edit({ embeds: [embed.setColor(1)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:SERVIDOR_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/oiYZlQB.png')] });
                                                            } else if (value === 'sorteio') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/3DM9Nxj.png')] });
                                                                m.edit({ embeds: [embed.setColor(12118406)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:SORTEIO_DESCRIÇÃO', { prefix: settings.prefix }))] });
                                                                m.edit({ embeds: [embed.setImage('https://i.imgur.com/qbFBr2d.png')] });
                                                            } else if (value === 'ticket') {
                                                                m.edit({ embeds: [embed.setThumbnail('https://i.imgur.com/RinEXHZ.png')] });
                                                                m.edit({ embeds: [embed.setColor(9442302)] });
                                                                m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:TICKET_DESCRIÇÃO', { prefix: settings.prefix }))] });
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
                                                                const row = new MessageActionRow()
                                                                    .addComponents(
                                                                        new MessageSelectMenu()
                                                                            .setCustomId('options')
                                                                            .setPlaceholder(message.translate('Misc/ajuda:AJUDA'))
                                                                            .addOptions([
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA60'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA61'),
                                                                                    value: 'app',
                                                                                    emoji: '<:applications:897903410135851009>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA19'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA20'),
                                                                                    value: 'autoanimes',
                                                                                    emoji: '<:anime:830174554012778587>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA21'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA22'),
                                                                                    value: "automod",
                                                                                    emoji: '<:automod:896720524284166184>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA23'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA24'),
                                                                                    value: "autocovid",
                                                                                    emoji: '<:autocovid:896720952988172309>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA25'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA26'),
                                                                                    value: "autoresponse",
                                                                                    emoji: '<:autoresponse:896721652530962472>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA27'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA28'),
                                                                                    value: "autotwitch",
                                                                                    emoji: '<:autotwitch:896722126613123093>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA29'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA30'),
                                                                                    value: "autoyoutube",
                                                                                    emoji: '<:autoyoutube:896722997598097409>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA33'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA34'),
                                                                                    value: "autonick",
                                                                                    emoji: '<:autonick:896723882675957840>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA35'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA36'),
                                                                                    value: "automessage",
                                                                                    emoji: '<:automessage:896724725798174751>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA62'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA63'),
                                                                                    value: 'birth',
                                                                                    emoji: '<:birthday:897904377120030730>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA37'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA38'),
                                                                                    value: "welcome",
                                                                                    emoji: '<:welcome:896725138492522506>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA39'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA40'),
                                                                                    value: "level",
                                                                                    emoji: '<:level:896727226760953896>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA41'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA42'),
                                                                                    value: "moderation",
                                                                                    emoji: '<:moderation:896730204121235507>',
                                                                                },
                                                                                /* {
                                                                                    label: message.translate('Misc/ajuda:AJUDA64'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA65'),
                                                                                    value: 'ss',
                                                                                    emoji: '<:stats:897904377153613844>',
                                                                                }, */
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA43'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA44'),
                                                                                    value: "suggestion",
                                                                                    emoji: '<:suggestion:896730918193094717>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA45'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA46'),
                                                                                    value: "system",
                                                                                    emoji: '<:system:896732249469378660>',
                                                                                },
                                                                                /* {
                                                                                                label: message.translate('Misc/ajuda:AJUDA47'),
                                                                                                description: message.translate('Misc/ajuda:AJUDA48'),
                                                                                                value: "sticky",
                                                                                                emoji: '<:sticky:896732586171301888>',
                                                                                            }, */
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA49'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA50'),
                                                                                    value: "reputation",
                                                                                    emoji: '<:reputation:896733497622949898>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA51'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA52'),
                                                                                    value: "ticket",
                                                                                    emoji: '<:ticket:896730680506085396>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA53'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA54'),
                                                                                    value: "verify",
                                                                                    emoji: '<:verify:896734198486958121>',
                                                                                },
                                                                                {
                                                                                    label: message.translate('Misc/ajuda:AJUDA55'),
                                                                                    description: message.translate('Misc/ajuda:AJUDA56'),
                                                                                    value: "rr",
                                                                                    emoji: '<:reactionrole:896734822922330202>',
                                                                                },
                                                                            ]),
                                                                    );
                                                                const roww = new MessageActionRow()
                                                                    .addComponents(
                                                                        new MessageButton()
                                                                            .setCustomId('inicio')
                                                                            .setLabel(message.translate('Misc/ajuda:AJUDA57'))
                                                                            .setEmoji(`<:inicio:896451813367250974>`)
                                                                            .setStyle(2),
                                                                        new MessageButton()
                                                                            .setCustomId('commands')
                                                                            .setLabel(message.translate('Misc/ajuda:AJUDA58'))
                                                                            .setEmoji(`<:addon:896441362856173619>`)
                                                                            .setStyle('SUCCESS'),
                                                                        new MessageButton()
                                                                            .setCustomId('delete')
                                                                            .setLabel(message.translate('Misc/ajuda:AJUDA59'))
                                                                            .setStyle('DANGER')
                                                                            .setEmoji(`<:close:896442104912412724>`)
                                                                    );

                                                                const embed = new Embed(bot, message.guild)
                                                                    .setTitle('Addons/configurações:ANIMES_TITULO')
                                                                    .addFields(
                                                                        { name: '\u200b', value: `${message.translate('Addons/configurações:ANIMES_FIELD')}`, inline: false },
                                                                        { name: `${message.translate('Addons/configurações:ANIMES_FIELD1')}`, value: `${stats[animesToggle]}`, inline: true },
                                                                        { name: `${message.translate('Addons/configurações:ANIMES_FIELD2')}`, value: `${animesCanal || `${info3}`}`, inline: true },
                                                                        { name: `${message.translate('Addons/configurações:ANIMES_FIELD5')}`, value: `${animesLista.join(" - ") || `${info3}`}`, inline: false },
                                                                        { name: `${message.translate('Addons/configurações:ANIMES_FIELD3')}`, value: `${message.translate('Addons/configurações:ANIMES_FIELD4', { prefix: settings.prefix })}`, inline: false });
                                                                // If no channels, it will dm the owner.
                                                                message.channel.send({ embeds: [embed], components: [row, roww] }).then(async (m) => {
                                                                    m.timedDelete({ timeout: 300005 })
                                                                    // Create collector
                                                                    const filter = i => i.message.id === m.id;

                                                                    const collector = message.channel.createMessageComponentCollector({ filter: filter, time: 300000 });
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
                                                                        } else if (value === 'autoreddit') {
                                                                            m.delete()
                                                                            message.args[0] = 'reddit';
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
                                                                        collector.on('end', collected => {
                                                                            m.delete().catch(() => {
                                                                                // do nothing.
                                                                            });
                                                                            // m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:AJUDA34'))], components: [] })
                                                                        });
                                                                    });
                                                                });
                                                            }
                                                            i.deferUpdate();
                                                            collector.on('end', collected => {
                                                                m.delete().catch(() => {
                                                                    // do nothing.
                                                                });
                                                                // m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:AJUDA34'))], components: [] })
                                                            });
                                                        });
                                                    });
                                                }
                                                i.deferUpdate();
                                                collector.on('end', collected => {
                                                    m.delete().catch(() => {
                                                        // do nothing.
                                                    });
                                                    // m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:AJUDA34'))], components: [] })
                                                });
                                            });
                                        });
                                    }
                                    i.deferUpdate();
                                    collector.on('end', collected => {
                                        m.delete().catch(() => {
                                            // do nothing.
                                        });
                                        // m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:AJUDA34'))], components: [] })
                                    });
                                });
                            });
                        }
                        i.deferUpdate();
                        collector.on('end', collected => {
                            m.delete().catch(() => {
                                // do nothing.
                            });
                            // m.edit({ embeds: [embed.setDescription(message.translate('Misc/ajuda:AJUDA34'))], components: [] })
                        });
                    });
                });

                break;

            default:
                const embedd = new Embed(bot, message.guild)
                    .setTitle('Addons/configurações:CONFIG_TITULO', { guild: message.guild.name })
                    .setDescription(message.translate('Addons/configurações:CONFIG_FIELD', { prefix: settings.prefix }))
                    .addFields(
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD41')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD42')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD25')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD26')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD19')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD20')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD15')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD16')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD27')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD28')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD29')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD30')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD31')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD32')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD33')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD34')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD35')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD36')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD37')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD38')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD1')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD2')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD3')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD4')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD5')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD6')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD7')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD8')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD9')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD10')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD11')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD12')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD43')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD44')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD17')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD18')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD13')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD14')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD21')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD22')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD23')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD34')}`, inline: true },
                        { name: `${message.translate('Addons/configurações:CONFIG_FIELD39')}`, value: `${message.translate('Addons/configurações:CONFIG_FIELD40')}`, inline: true }
                    )
                if (settings.ModerationClearToggle && message.deletable) message.delete();
                message.channel.send({ embeds: [embedd] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                break;
        }

    }
};
