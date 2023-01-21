// Dependencies
const { Embed } = require('../../utils'),
    { Collection, PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
    { ChannelType } = require('discord-api-types/v10'),
    { ticketFunçõesSchema, ticketEmbedSchema, transcript, ReactionRoleSchema } = require('../../database/models'),
    cooldowns = new Collection(),
    randoStrings = require("randostrings"),
    random = new randoStrings,
    moment = require('moment'),
    Event = require('../../structures/Event');

module.exports = class clickButton extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    // Exec event
    async run(bot, button) {
        const { customId: ID, guildId, channelId, member } = button,
            guild = bot.guilds.cache.get(guildId),
            channel = bot.channels.cache.get(channelId);

        if (ID == 'ticket') {
            // Se conecta a Database pelo ID do usuario
            let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guildId });
            if (!dbEmbed) {
                const newSettings = new ticketEmbedSchema({
                    tembed_sID: guildId
                });
                await newSettings.save();
                dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guildId });
            }

            // Make sure user isn't on cooldown from making a ticket
            const now = Date.now();
            const cooldownAmount = 900000;

            if (cooldowns.has(member.user.id)) {
                const expirationTime = cooldowns.get(member.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000 / 60;
                    return button.reply({ embeds: [channel.error('Ticket/tcreate:COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
                }
            }

            //ticket stuff
            let db = await ticketEmbedSchema.findOne({ tembed_sID: guildId });
            if (!db) {
                const newSettings = new ticketEmbedSchema({
                    tembed_sID: guildId
                });
                await newSettings.save();
                db = await ticketEmbedSchema.findOne({ tembed_sID: guildId });
            }

            // Verificando se o servidor ja está com o addon Ticket configurado e ativo
            if (!db.categoryID || db.ticketToggle === false) return button.reply({ embeds: [channel.error(`Uh-oh! The **Administrators** of this server have not yet configured the **Ticket** addon. Please feel free to remind them to configure it.`, {}, true)], ephemeral: true });

            let serverCase = db.ticketCase;
            if (!serverCase || serverCase === null) serverCase = '1';

            // VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
            let chann;
            let ticketLog = guild.channels.cache.get(db.ticketModlogID);
            let ticketRole = guild.roles.cache.get(db.supportRoleID);
            let id = member.user.id.toString().substr(0, 4) + member.user.discriminator;
            if (db.ticketNameType == "1") chann = `🟢｜ticket-${id}`;
            if (db.ticketNameType == "2") chann = `🟢｜ticket-${serverCase + 1}`;

            // CRIA UM ARRAY TEMPORARIO PARA JUNTAR TODOS CANAIS ENCONTRADOS
            let array = [];

            const type1 = `🟢｜ticket-${id}`;
            const type2 = `Ticket Author Information: **ID:** ${member.user.id} | **Tag:** ${member.user.username}#${member.user.discriminator}`;

            // VERIFICA TODOS CANAIS PELO TIPO 1
            guild.channels.cache.forEach(channel => {
                if (channel.name == type1) array.push(channel.id)
            });

            // VERIFICA TODOS CANAIS PELO TIPO 2
            guild.channels.cache.forEach(channel => {
                if (channel.topic == type2) array.push(channel.id)
            });

            // OBTEM O LIMITE DE TICKETS DEFINIDO QUE UM USUARIO PODE CRIAR
            let ticketlimit = db.maxTicket;
            if (!ticketlimit) ticketlimit = 1;

            // OBTEM O TAMANHO DA ARRAY TEMPORARIA
            let arraylength = array.length;

            // VERIFICAR NA ARRAY SE HÁ MAIS DO QUE O LIMITE DEFINIDO
            if (arraylength > ticketlimit || arraylength == ticketlimit) {

                if (!channel.permissionsFor(guild.members.me).has(Flags.SendMessages)) return;
                if (!channel.permissionsFor(guild.members.me).has(Flags.EmbedLinks)) return;

                // SE SIM, IMPEDE O USUARIO DE ABRIR OUTRO TICKET
                const limitEmbed = new Embed(bot, guild)
                    .setDescription(`You cannot open more than ${ticketlimit} ticket at the moment, as you already have ${arraylength} ticket open!\n\nTo open a new ticket, go to (<#${array[0]}>) and close your ticket or ask a server moderator to close it for you.`)
                    .setAuthor({ name: `Hello ${member.user.username}`, iconURL: member.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }) })
                    .setFooter({ text: 'Powered by hopebot.top' })

                return button.reply({ embeds: [limitEmbed], ephemeral: true });
            }

            // make sure ticket has been set-up properly
            // create perm array
            const perms = [
                { id: member, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions] },
                { id: guild.roles.everyone, deny: [Flags.ViewChannel, Flags.SendMessages] },
                { id: bot.user, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions, Flags.ManageChannels] },
            ];

            if (guild.roles.cache.get(guild.settings.TicketSupportRole)) perms.push({ id: guild.settings.TicketSupportRole, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions] });

            let reason = 'No reason provided';

            // create channel
            guild.channels.create({
                name: chann,
                type: ChannelType.GuildText,
                permissionOverwrites: perms,
                parent: db.categoryID,
                reason: `Ticket Addon`,
                topic: `Ticket Author Information: **ID:** ${member.user.id} | **Tag:** ${member.user.username}#${member.user.discriminator}`,
            }).then(async (chan) => {

                await chan.permissionOverwrites.create(member.user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true });
                await db.updateOne({ ticketCase: serverCase + 1 });

                let color = db.embedticket.Cor;
                if (color == "#000000") color = guild.members.me.displayHexColor

                if (db.ticketPing == true) {
                    if (chan) {
                        if (!chan.permissionsFor(bot.user).has(Flags.SendMessages) && !chan.permissionsFor(bot.user).has(Flags.EmbedLinks)) return;
                        chan.send({ content: `${member} ${ticketRole}` }).then(m => m.timedDelete({ timeout: 1000 }));
                    }
                }

                const botões = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('fechar_ticket')
                            .setLabel(guild.translate('Events/clickButton:button'))
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('<:lock:853017312734740500>'),
                        new ButtonBuilder()
                            .setCustomId('voice_ticket')
                            .setLabel(guild.translate('Events/clickButton:button1'))
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('<:voicechannel:853639025729863680>'),
                        new ButtonBuilder()
                            .setCustomId('transcript_ticket')
                            .setLabel(guild.translate('Events/clickButton:button2'))
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('<:transcript:853348232858959902>'),
                        new ButtonBuilder()
                            .setCustomId('deletar_ticket')
                            .setLabel(guild.translate('Events/clickButton:button3'))
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('<:delete:853017312033505281>')
                    );

                let reasonx = 'No reason provided';
                if (!reasonx) reasonx = `No reason provided`;
                if (reasonx.length > 1024) reasonx = `Reason Too Long`;
                if (reason.length > 1024) reasonx = `Reason Too Long`;

                const ticketMessage = await chan.send({
                    embeds: [new Embed(bot, guild)
                        .setAuthor({ name: db.embedticket.author.name ?? guild.translate('Ticket/tcreate:TICKET_CRIAR3', { author: member.user.username }), iconURL: `${db.embedticket.author.icon || bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                        .setThumbnail(db.embedticket.thumbnail || bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }))
                        .setDescription(db.embedticket?.description
                            .replace(/{user}/g, `${member}`)
                            .replace(/{user_tag}/g, `${member.user.username}#${member.user.discriminator}`)
                            .replace(/{user_name}/g, `${member.user.username}`)
                            .replace(/{reason}/g, `${reasonx}`)
                            .replace(/{user_ID}/g, `${member.user.id}`) ?? `${guild.translate('Ticket/tcreate:TICKET_CRIAR4')} ${guild.roles.cache.get(db.supportRoleID) ? `, <@&${db.supportRoleID}>` : 'Support'} ${guild.translate('Ticket/tcreate:TICKET_CRIAR5')} ${guild.roles.cache.get(db.supportRoleID) ? `, <@&${db.supportRoleID}>` : 'SUPPORT'}, ${guild.translate('Ticket/tcreate:TICKET_CRIAR6')}`)
                        .setColor(db.embedticket.color || 9442302)
                        .setFooter({ text: db.embedticket.footer ?? 'Powered by hopebot.top' })
                    ], components: [botões]
                });

                // reply to user saying that channel has been created
                const successEmbed = new Embed(bot, guild)
                    .setTitle('Ticket/tcreate:TICKET_CRIAR1')
                    .setDescription(guild.translate('Ticket/tcreate:TICKET_CRIAR2', { channel: chan.id }));

                button.reply({ embeds: [successEmbed] }).then(() => {
                    setTimeout(function () {
                        button.deleteReply();
                    }, 10000);
                });

                cooldowns.set(member.user.id, now);
                setTimeout(() => cooldowns.delete(member.user.id), cooldownAmount);

                let novo_ticket = new ticketFunçõesSchema({
                    guildID: guildId,
                    messageID: ticketMessage.id,
                    channelID: ticketMessage.channel.id,
                    voiceID: null,
                    authorID: member.user.id,
                    tag: member.user.tag,
                    discriminator: member.user.discriminator,
                    ticketNameType: db.ticketNameType,
                    ticketCase: serverCase + 1,
                })

                await novo_ticket.save().catch(err => button.reply({ embeds: [channel.error('ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true }));

                let color2 = db.ticketLogColor
                if (color2 == "#000000") color2 = `#36393f`;

                const embedLog = new Embed(bot, guild)
                    // .setColor(color2)
                    .setFooter({ text: 'Powered by hopebot.top' })
                    .setTitle("Ticket Created")
                    .setTimestamp()

                if (db.requireReason == true) embedLog.addFields({ name: "Information", value: `**User:** ${member}\n**Ticket Channel: **${chan.name}\n**Ticket:** #${serverCase + 1}\n**Reason:** ${reasonx}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")} `, inline: false })
                if (db.requireReason == false) embedLog.addFields({ name: "Information", value: `**User:** ${member}\n**Ticket Channel: **${chan.name}\n**Ticket:** #${serverCase + 1}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")} `, inline: false })

                if (ticketLog) {
                    ticketLog.send({ embeds: [embedLog] })
                }

                // run ticketcreate event
                // await bot.emit('ticketCreate', ticketLog, embedLog);
            });
        } else if (ID == 'fechar_ticket') {
            let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
            if (!dbEmbed) {
                const newSettings = new ticketEmbedSchema({
                    tembed_sID: guild.id
                });
                await newSettings.save();
                dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
            }

            const ticketTrancar = await ticketFunçõesSchema.findOne({
                channelID: channel.id,
                guildID: guild.id,
            });

            if (!ticketTrancar) return button.reply({ embeds: [channel.error(`Uh-oh! This command does not work on normal channels. Please try again by running this command on a ticket channel.\n**Tip**: Ticket channels start with \`🟢｜ticket-\``, {}, true)], ephemeral: true });

            // VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
            let serverCase = ticketTrancar.ticketCase;
            if (!serverCase || serverCase == null) serverCase = '1';
            let chann;
            let id = ticketTrancar.authorID.toString().substr(0, 4) + ticketTrancar.discriminator;
            if (ticketTrancar.ticketNameType == "1") chann = `${id}`;
            if (ticketTrancar.ticketNameType == "2") chann = `${serverCase}`;
            let author = guild.members.cache.get(ticketTrancar.authorID);

            const role = guild.roles.cache.get(dbEmbed.supportRoleID);
            if (dbEmbed.ticketClose == false) {
                if (role) {
                    if (!member.roles.cache.find(r => r.name.toLowerCase() == role.name.toLowerCase())) return button.reply({ embeds: [channel.error(`Uh-oh! Sorry, but only users with the **support team role** (${role}) can close this Ticket.`, {}, true)], ephemeral: true });
                }
            };

            // fecha o canal
            if (guild.channels.cache.find(c => c.name === `🟢｜ticket-${chann}`)) {
                button.reply({ content: guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD7', { user: member.user.username }) })
                setTimeout(() => channel.permissionOverwrites.edit(author, {
                    SendMessages: false, ViewChannel: false,
                }), 5000), channel.edit({ name: `🔴｜ticket-${chann}`, topic: `Ticket closed by: ${member.user.username}.\nTicket Author Information: **ID:** ${ticketTrancar.authorID} | **Tag:** ${ticketTrancar.tag}` }), 5000;
            } else if (guild.channels.cache.find(c => c.name === `🔴｜ticket-${chann}`)) {
                button.reply({ content: guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD14') });
                setTimeout(() => button.editReply({ content: `${member.user.username}#${member.user.discriminator} reopened the ticket-${chann}.` }), 5000);
                setTimeout(() => channel.permissionOverwrites.edit(author, {
                    SendMessages: true, ViewChannel: true,
                }), 5000), channel.edit({ name: `🟢｜ticket-${chann}`, topic: `Ticket Author Information: **ID:** ${ticketTrancar.authorID} | **Tag:** ${ticketTrancar.tag}` }), 5000;
            } else {
                return button.reply({ embeds: [channel.error(`Uh-oh! It seems that the **channel name** of this ticket has changed and for this reason *I will not be able to perform this action*.\n\nPlease make sure to take back the original name (\`🟢｜ticket-${chann}\`) and try again.\n\nAnd Remember **it is necessary** to keep the *original name* on the ticket channels for my functions to *work properly*!`, {}, true)], ephemeral: true });
            }
            // CRIA CANAL DE VOZ/FECHA CANAL DE VOZ
        } else if (ID == 'voice_ticket') {
            let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
            if (!dbEmbed) {
                const newSettings = new ticketEmbedSchema({
                    tembed_sID: guild.id
                });
                await newSettings.save();
                dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
            }

            const ticketMember = await ticketFunçõesSchema.findOne({
                channelID: channel.id,
                guildID: guild.id,
            });

            if (!ticketMember) return button.reply({ embeds: [channel.error(`Uh-oh! This command does not work on normal channels. Please try again by running this command on a ticket channel.\n**Tip**: Ticket channels start with \`:green_circle:｜ticket-\``, {}, true)], ephemeral: true });

            // VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
            let serverCase = ticketMember.ticketCase;
            if (!serverCase || serverCase === null) serverCase = '1';
            let chann;
            let id = ticketMember.authorID.toString().substr(0, 4) + ticketMember.discriminator;
            if (ticketMember.ticketNameType == 1) {
                chann = `${id}`;
            } else if (ticketMember.ticketNameType == 2) {
                chann = `${serverCase}`;
            }
            let author = guild.members.cache.get(ticketMember.authorID);

            if (channel.name !== `🟢｜ticket-${chann}` && channel.name !== `🔴｜ticket-${chann}`) {
                return button.reply({ embeds: [channel.error(`Uh-oh! It seems that the **channel name** of this ticket has changed and for this reason *I will not be able to perform this action*.\n\nPlease make sure to take back the original name (\`🟢｜ticket-${chann}\`) and try again.\n\nAnd Remember **it is necessary** to keep the *original name* on the ticket channels for my functions to *work properly*!`, {}, true)], ephemeral: true });
            }

            // VERIFICA SE O JA POSSUI UM CANAL DE VOZ CRIADO
            if (!guild.channels.cache.find(canal => canal.name == `🟠｜voice-${chann}`)) {

                // Check if a ticket channel is already open
                if (guild.channels.cache.find(channel => channel.name == `🟠｜voice-${channel.name.split('-')[1]}`)) return button.reply({ embeds: [channel.error('misc:TICKET_EXISTS', {}, true)], ephemeral: true });

                // VERIFICA SE O USUARIO TEM AS PERMISSÕES NECESSARIAS PARA ABRIR UM CANAL DE VOZ
                const supportRole = guild.roles.cache.get(dbEmbed.supportRoleID);
                if (!supportRole) return button.reply({ embeds: [channel.error('misc:NO_SUPPORT_ROLE', {}, true)], ephemeral: true });
                const category = guild.channels.cache.get(dbEmbed.categoryID);
                if (!category) return button.reply({ embeds: [channel.error('misc:NO_CATEGORY', {}, true)], ephemeral: true });

                // CRIA UM CANAL DE VOZ
                guild.channels.create({
                    name: `🟠｜voice-${chann}`,
                    type: ChannelType.GuildVoice,
                    permissionOverwrites: [
                        { id: author, allow: [Flags.SendMessages, Flags.ViewChannel] },
                        { id: supportRole, allow: [Flags.SendMessages, Flags.ViewChannel] },
                        { id: guild.roles.everyone, deny: [Flags.SendMessages, Flags.ViewChannel] },
                        { id: bot.user, allow: [Flags.SendMessages, Flags.ViewChannel, Flags.EmbedLinks] }],
                    parent: category.id,
                    reason: 'User created a voice channel for the ticket',
                    topic: `Ticket Author Information: **ID:** ${member.id} | **Tag:** ${member.tag}`,
                })

                const delay = ms => new Promise(res => setTimeout(res, ms));
                await delay(2000);
                const voice = guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`);
                if (voice) {
                    ticketMember.voiceID = voice.id;
                    button.reply(guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD10', { user: member.user.username, voice: voice.id }))
                    await ticketMember.save().catch(err => message.channel.error('ERROR_MESSAGE', { err: err.message }));
                }
            } else if (guild.channels.cache.find(canal => canal.name == `🟠｜voice-${chann}`)) {
                // VERIFICA AS PERMISSÕES NECESSARIAS
                const supportRole = guild.roles.cache.get(dbEmbed.supportRoleID);
                if (!supportRole) return button.reply({ embeds: [channel.error('misc:NO_SUPPORT_ROLE', {}, true)], ephemeral: true });
                const category = guild.channels.cache.get(dbEmbed.categoryID);
                if (!category) return button.reply({ embeds: [channel.error('misc:NO_CATEGORY', {}, true)], ephemeral: true });

                // DELETA O CANAL
                // const voice = guild.channels.cache.find(canal => canal.name === `🟠｜voice-${message.channel.name.split('-')[1]}`);
                button.reply(guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD11', { user: member.user.username }))
                setTimeout(() => guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`).delete(), 5000);
            }

            // make sure ticket has been set-up properly
            const supportRole = guild.roles.cache.get(dbEmbed.supportRoleID);
            if (!supportRole) return button.reply({ embeds: [channel.error('misc:NO_SUPPORT_ROLE', {}, true)], ephemeral: true });
            const category = guild.channels.cache.get(dbEmbed.categoryID);
            if (!category) return button.reply({ embeds: [channel.error('misc:NO_CATEGORY', {}, true)], ephemeral: true });

            // create channel
            guild.channels.create({
                name: `🟠｜voice-${channel.name.split('-')[1]}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    { id: channel.name.split('-')[1], allow: [Flags.SendMessages, Flags.ViewChannel] },
                    { id: supportRole, allow: [Flags.SendMessages, Flags.ViewChannel] },
                    { id: guild.roles.everyone, deny: [Flags.SendMessages, Flags.ViewChannel] },
                    { id: bot.user, allow: [Flags.SendMessages, Flags.ViewChannel, Flags.EmbedLinks] }],
                parent: category.id,
                reason: 'User created a voice channel for the ticket',
                topic: `Ticket Author Information: **ID:** ${member.user.id} | **Tag:** ${member.user.username}#${member.user.discriminator}`,
            })
        } else if (ID == 'transcript_ticket') {
            // Se conecta a Database pelo ID do usuario
            let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guildId });
            if (!dbEmbed) {
                const newSettings = new ticketEmbedSchema({
                    tembed_sID: guildId
                });
                await newSettings.save();
                dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guildId });
            }
            // Defer aqui para evitar error na interação, pq não captura a interação dentro do fetch
            await button.deferUpdate();
            const ticketTranscript = await ticketFunçõesSchema.findOne({
                channelID: channelId,
                guildID: guildId,
            });
            // VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
            let serverCase = dbEmbed.ticketCase;
            if (!serverCase || serverCase === null) serverCase = '1';
            let chann;
            let id = ticketTranscript.authorID.toString().substr(0, 4) + ticketTranscript.discriminator;
            if (ticketTranscript.ticketNameType == "1") chann = `${id}`;
            if (ticketTranscript.ticketNameType == "2") chann = `${serverCase}`;
            // ticket found
            if (ticketTranscript) {
                const user = member.user.id;
                // alterar dps para verificar pelo cargo de suporte
                if (!guild.members.cache.find((membro) => membro.id === user).permissions.has(Flags.ManageGuild)) {
                    return button.reply({ embeds: [channel.error('Events/messageReactionAdd:MESSAGE_REACTION_ADD12', {}, true)], ephemeral: true });
                } else {
                    // if (!channel) return;
                    await channel.messages.fetch().then(async (messages) => {

                        let text;
                        text = "";

                        let ticketID = random.password({
                            length: 8,
                            string: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
                        })

                        const paste = new transcript({
                            _id: ticketID,
                            type: "ticket",
                            by: ticketTranscript.authorID,
                            expiresAt: new Date(Date.now() + (1036800000))
                        });

                        for (const message of [...messages.values()].reverse()) {
                            if (message && message.content && member.user.id) {
                                paste.paste.push(`${message.content}`)
                                paste.paste2.push(member.user.id)
                            } else if (message && message.embeds && member.user.id) {
                                paste.paste.push(`(embed sent)`)
                                paste.paste2.push(member.user.id)
                            }
                            await paste.save()
                        }

                        let reasonx = dbEmbed.requireReason;
                        if (!reasonx) reasonx = `No reason Provided`;
                        if (reasonx.length > 1024) reasonx = `Reason Too Long`;


                        let color2 = `#36393f`;
                        if (color2 == "#000000") color2 = `#36393f`;

                        let closeEmbed = new Embed(bot, guild)
                            .setColor(color2)
                            .setTitle("Hope • Ticket Transcript")

                        if (dbEmbed.requireReason == true) closeEmbed.addFields({ name: "Information", value: `**User:** ${member.user}\n**Ticket Channel:** <#${channel.id}>\n**Reason:** ${reasonx}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")}\n**Transcript:** [#${ticketID}](https://hopebot.top/transcript/${ticketID})`, inline: false })
                        if (dbEmbed.requireReason == false) closeEmbed.addFields({ name: "Information", value: `**User:** ${member.user}\n**Ticket Channel:** <#${channel.id}>\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")}\n**Transcript:** [#${ticketID}](https://hopebot.top/transcript/${ticketID})`, inline: false })

                        member.user.send({ embeds: [closeEmbed] })
                        const ticketauthor = guild.members.cache.get(ticketTranscript.authorID);
                        ticketauthor.send({ embeds: [closeEmbed] });
                        return channel.send({ embeds: [closeEmbed], ephemeral: false });
                    })
                    // button.deferUpdate();
                }
            }
        } else if (ID == 'deletar_ticket') {
            const ticketDeletar = await ticketFunçõesSchema.findOne({
                channelID: channelId,
                guildID: guildId,
            });
            // VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
            let serverCase = ticketDeletar.ticketCase;
            if (!serverCase || serverCase === null) serverCase = '1';
            let chann;
            let id = ticketDeletar.authorID.toString().substr(0, 4) + ticketDeletar.discriminator;
            if (ticketDeletar.ticketNameType == 1) {
                chann = `${id}`;
            } else if (ticketDeletar.ticketNameType == 2) {
                chann = `${serverCase}`;
            }

            const user = member.user.id;

            // Check if bot has permission to add reactions
            if (!channel.permissionsFor(bot.user).has(Flags.ManageChannels)) {
                bot.logger.error(`Faltando permissões: \`MANAGE_CHANNELS\` em [${guild.id}].`);
                return channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: Flags.ManageChannels }).then(m => m.timedDelete({ timeout: 10000 }));
            }

            if (!guild.members.cache.find((membro) => membro.id === user).permissions.has(Flags.ManageGuild)) {
                return button.reply({ embeds: [channel.error('Events/messageReactionAdd:MESSAGE_REACTION_ADD8', {}, true)], ephemeral: true })
            }

            if (guild.members.cache.find((membro) => membro.id === user).permissions.has(Flags.ManageGuild)) {
                await ticketFunçõesSchema.findOneAndRemove({ messageID: ticketDeletar.msgID, channelID: channel.id, guildID: guild.id });
                button.reply(guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD9'));
                setTimeout(() => channel.delete(), 5000);
                // button.deferUpdate();
                const voice = guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`);
                if (voice) {
                    setTimeout(() => guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`).delete(), 5000);
                    // button.deferUpdate();
                }
            }
            /* } else if (ID == 'voltar_musica') {
                 // check for DJ role, same VC and that a song is actually playing
                 const playable = checkMusic(member, bot);
                 if (typeof (playable) !== 'boolean') return button.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });
     
                 // Make sure there was a previous song
                 const player = bot.manager?.players.get(member.guild.id);
                 if (player.queue.previous == null) return button.reply({ content: guild.translate('misc:MUSIC_ANT') }).then(() => {
                     if (guild.settings.ModerationClearReplyToggle === true) {
                         setTimeout(function () {
                             button.deleteReply();
                         }, 15000);
                     }
                 });
     
                 // Start playing the previous song
                 player.queue.unshift(player.queue.previous);
                 player.stop();
                 await button.deferReply();
                 await button.deleteReply();
             } else if (ID == 'pausar_musica') {
                 // check for DJ role, same VC and that a song is actually playing
                 const playable = checkMusic(member, bot);
                 if (typeof (playable) !== 'boolean') return button.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });
     
                 // checks whether the player is paused or not
                 const player = bot.manager?.players.get(member.guild.id);
                 if (!player.paused) {
                     // Pauses the music
                     player.pause(true);
                     return button.reply({ embeds: [channel.success('misc:SUCCESFULL_PAUSE', {}, true)] }).then(() => {
                         if (guild.settings.ModerationClearReplyToggle === true) {
                             setTimeout(function () {
                                 button.deleteReply();
                             }, 15000);
                         }
                     });
                 } else {
                     // Resumes the music
                     player.pause(false);
                     return button.reply({ embeds: [channel.success('misc:SUCCESFULL_RESUME', {}, true)] }).then(() => {
                         if (guild.settings.ModerationClearReplyToggle === true) {
                             setTimeout(function () {
                                 button.deleteReply();
                             }, 15000);
                         }
                     });
                 }
             } else if (ID == 'pular_musica') {
                 // check for DJ role, same VC and that a song is actually playing
                 const playable = checkMusic(member, bot);
                 if (typeof (playable) !== 'boolean') return button.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });
     
                 // skip song
                 const player = bot.manager?.players.get(guild.id);
                 player.stop();
                 return button.reply({ embeds: [channel.success('Skipped song!', {}, true)], ephemeral: false }).then(() => {
                     if (guild.settings.ModerationClearReplyToggle === true) {
                         setTimeout(function () {
                             button.deleteReply();
                         }, 15000);
                     }
                 });
             } else if (ID == 'loop_musica') {
                 // button.deferUpdate();
                 const type = 'song';
                 // check for DJ role, same VC and that a song is actually playing
                 const playable = checkMusic(member, bot);
                 if (typeof (playable) !== 'boolean') return button.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });
     
                 let embed = new Embed(bot, guild)
                     .setColor(10147968)
     
                 // Check what to loop (queue or song) - default to song
                 const player = bot.manager?.players.get(guild.id);
                 if (!type || type == 'song') {
                     // (un)loop the song
                     player.setTrackRepeat(!player.trackRepeat);
                     const trackRepeat = guild.translate(`Musica/repetir:${player.trackRepeat ? 'ENABLED' : 'DISABLED'}`);
                     return button.reply({ embeds: [embed.setDescription(guild.translate('Music/repetir:REPETIR3', { trackRepeat: trackRepeat }, true))], ephemeral: false }).then(() => {
                         if (guild.settings.ModerationClearReplyToggle === true) {
                             setTimeout(function () {
                                 button.deleteReply();
                             }, 15000);
                         }
                     });
                 } else if (type == 'queue') {
                     // (un)loop the queue
                     player.setQueueRepeat(!player.queueRepeat);
                     const queueRepeat = guild.translate(`Musica/repetir:${player.queueRepeat ? 'ENABLED' : 'DISABLED'}`);
                     return button.reply({ embeds: [embed.setDescription(guild.translate('Music/repetir:REPETIR7', { queueRepeat: queueRepeat }, true))], ephemeral: false }).then(() => {
                         if (guild.settings.ModerationClearReplyToggle === true) {
                             setTimeout(function () {
                                 button.deleteReply();
                             }, 15000);
                         }
                     });
                 }
             } else if (ID == 'stop') {
                 // check for DJ role, same VC and that a song is actually playing
                 const playable = checkMusic(member, bot);
                 if (typeof (playable) !== 'boolean') return button.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });
     
                 // Destory player (clears queue & leaves channel)
                 const player = bot.manager?.players.get(guild.id);
                 player.destroy();
                 return button.reply({ embeds: [channel.success('misc:LEFT_VOICE', {}, true)] }).then(() => {
                     if (guild.settings.ModerationClearReplyToggle === true) {
                         setTimeout(function () {
                             button.deleteReply();
                         }, 10000);
                     }
                 }); */
        } else if (ID == 'verify') {
            // const member = guild.members.cache.get(button.user.id);
            const role = guild.roles.cache.get(guild.settings.VerificarCargo);
            // const user = message.member;
            if (role) {
                if (member.roles.cache.has(role.id)) {
                    return button.reply({ embeds: [channel.error('Moderation/verificar:VEF11', {}, true)], ephemeral: true });
                }
                member.roles.add(role);
                return button.reply({ embeds: [channel.success('Guild/vf-opção:VF_OP7', {}, true)], ephemeral: true });

            } else if (!role) {
                return button.reply({ content: guild.translate('Guild/vf-opção:VF_OP8') }).then(() => {
                    setTimeout(function () {
                        button.deleteReply();
                    }, 10000);
                });
            }
            button.deferUpdate();
        } else if (ID == 'rrButton') {
            const dbReaction = await ReactionRoleSchema.findOne({
                guildID: guild.id,
                messageID: button.message.id,
            });

            if (dbReaction) {
                for (const btn of dbReaction.buttons) {

                    const cargo = await guild.roles.fetch(btn.roleID);
                    // console.log(cargo)

                    if (cargo) {

                        let addEmbed = new Embed(bot, guild)
                            .setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET5'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif` })
                            .setDescription(guild.translate('Events/messageReactionAdd:TICKET6', { cargo: cargo.name, guild: guild.name }))
                            .setFooter({ text: `Powered by hopebot.top` })
                            .setColor(12118406)

                        let addEmbed2 = new Embed(bot, guild)
                            .setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET5'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif` })
                            .setDescription(`You have successfully received the role **${cargo.name}** (${cargo}).`)
                            .setFooter({ text: `Powered by hopebot.top` })
                            .setColor(12118406)

                        let remEmbed = new Embed(bot, guild)
                            .setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET7'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif` })
                            .setDescription(guild.translate('Events/messageReactionAdd:TICKET8', { cargo: cargo.name, guild: guild.name }))
                            .setFooter({ text: `Powered by hopebot.top` })
                            .setColor(16734058)

                        let errorReaction = new Embed(bot, guild)
                            .setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET9'), iconURL: `https://cdn.dribbble.com/users/6425/screenshots/5039369/error-glitch-gif-3.gif` })
                            .setDescription(guild.translate('Events/messageReactionAdd:TICKET10'))
                            .setFooter({ text: `Powered by hopebot.top` })
                            .setColor(16711710)

                        if (dbReaction.option === 1) {
                            try {
                                if (!member.roles.cache.has(btn.roleID)) {
                                    member.roles.add(btn.roleID);
                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [addEmbed] })
                                    } else {
                                        return button.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                } else {
                                    return button.reply({ embeds: [channel.error(`Uh-oh! You already have this role. No need to click here again.`, {}, true)], ephemeral: true });
                                }
                            } catch (err) {
                                console.log(err)
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 2) {
                            try {
                                if (!member.roles.cache.has(btn.roleID)) {
                                    await member.roles.add(btn.roleID)
                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [addEmbed] })
                                    } else {
                                        return button.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 3) {
                            try {
                                if (!member.roles.cache.has(btn.roleID)) {
                                    await member.roles.remove(btn.roleID)
                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [remEmbed] })
                                    } else {
                                        return button.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                if (!guild.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 4) {
                            try {
                                if (!member.roles.cache.has(btn.roleID)) {
                                    await member.roles.remove(btn.roleID)
                                    reactionCooldown.add(user.id);
                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [remEmbed] })
                                    } else {
                                        return button.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 5) {
                            try {
                                if (!member.roles.cache.has(btn.roleID)) {
                                    await member.roles.remove(btn.roleID);
                                    guild.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id)

                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [remEmbed] })
                                    } else {
                                        return button.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                if (!guild.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 6) {

                            try {
                                if (!member.roles.cache.has(btn.roleID)) {

                                    guild.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id)
                                    await member.roles.remove(btn.roleID)
                                    return;
                                } else if (!member.roles.cache.has(btn.roleID)) {

                                    guild.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id)
                                    await member.roles.add(btn.roleID)

                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [addEmbed] })
                                    } else {
                                        return button.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                if (!guild.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
                                return member.send({ embeds: [errorReaction] })
                            }
                        }
                    } else {
                        return button.reply({ embeds: [channel.error(`Uh-oh! The role of this reaction has been **deleted** and **no longer exists** on this server. Please **notify** any *moderation member* about this.`, {}, true)], ephemeral: true });
                    }
                    button.deferUpdate();
                }
            }
        }
    }
};