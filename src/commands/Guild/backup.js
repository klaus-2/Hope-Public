// Dependências
const { Embed } = require(`../../utils`),
    { ApplicationCommandOptionType, PermissionsBitField: { Flags }, parseEmoji, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
    { Backup } = require(`../../database/models`),
    DiscordBackup = require("../../packages/discord-backup"),
    path = require('path'),
    { random } = require('random-code-gen'),
    Command = require('../../structures/Command.js');

module.exports = class Backups extends Command {
    constructor(bot) {
        super(bot, {
            name: 'backup',
            aliases: ['e-backup-delete'],
            dirname: __dirname,
            userPermissions: [Flags.ManageGuild],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Create and manage a backup of your server or your emojis',
            usage: '<prefix><commandName> <emoji | server> <create | delete | load | list> [backupID]',
            examples: [
                '/backup emoji create',
                '/backup emoji delete Cg267T',
                '.backup server load Cg267T',
                '!backup server create',
                '?backup emoji list'
            ],
            cooldown: 60000,
            slash: true,
            options: [{
                name: 'type',
                description: 'Choose Backup type',
                type: ApplicationCommandOptionType.String,
                choices: [...['emoji', 'server'].map(opt => ({ name: opt, value: opt }))].slice(0, 24),
                required: true,
            },
            {
                name: 'option',
                description: 'type',
                type: ApplicationCommandOptionType.String,
                choices: [...['create', 'delete', 'load', 'list'].map(opt => ({ name: opt, value: opt }))].slice(0, 24),
                required: true,
            },
            {
                name: 'backupid',
                description: 'The Backup ID',
                type: ApplicationCommandOptionType.String,
                required: false,
            }],
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        let code, backup, arr, embed, backupID;

        switch (message.args[0]) {
            case 'server':

                switch (message.args[1]) {
                    case 'create':

                        // if (settings.isPremium === false) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

                        const msg = await message.channel.send(message.translate('Guild/s-backup-criar:S_BACKUP_CRIAR2'));

                        DiscordBackup.setStorageFolder(path.resolve(__dirname, '../../../assets/backups'));
                        DiscordBackup.create(message.guild, {
                            jsonBeautify: true,
                            saveImages: "base64",
                            maxMessagesPerChannel: '10',
                            doNotBackup: ["emojis", "bans"],
                            clearGuildBeforeRestore: true,
                        }).then((backupData) => {
                            try {
                                embed = new Embed(bot, message.guild)
                                    .setAuthor({ name: `Hello ${message.author.username}`, iconURL: bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }) })
                                    .setColor(1)
                                    .setDescription(`O Backup do servidor **${message.guild.name}** foi gerado com sucesso!\n\n
                                    _Informações_
                                    **Backup Id:** ${backupData.id}
                                    **Data de expiração** -/-`)
                                    .setFooter({ text: `To prevent this backup from automatically expiring, get ${settings.prefix}premium`, iconURL: `https://cdn.discordapp.com/emojis/823004619805294643.webp?size=128&quality=lossless` })
                                message.author.send({ embeds: [embed] });
                            } catch (err) {
                                return message.channel.error('Uh-oh! Sorry, but I was unable to send dm to you, make sure your DM is **enabled**.').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                            }

                            embed = new Embed(bot, message.guild)
                                .setAuthor({ name: message.translate('Guild/e-backup-criar:E_BACKUP_CRIAR', { author: message.author.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setDescription(message.translate('Guild/e-backup-criar:E_BACKUP_CRIAR4'))
                                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setColor(1)
                                .setTimestamp()

                            msg.edit({ content: ' ', embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        });
                        break;

                    case 'delete':
                        backupID = message.args[2];

                        // if (settings.isPremium === false) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        if (!backupID) return message.channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **${settings.prefix.concat('backup server list')}**`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                        DiscordBackup.fetch(backupID).then((backupInfos) => {
                            DiscordBackup.remove(backupID);
                            // bot.channels.cache.get('806932976398893087').send(message.translate('Guild/s-backup-apagar:S_BACKUP_APAGAR5', { author: message.author.username }))
                            message.channel.success(`Backup \`${backupID}\` was deleted successfully!`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        }).catch((err) => {
                            return message.channel.error(`Uh-oh! **BackupID** invalid or does not exist on my database. Please check and try again.`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                        });
                        break;

                    case 'load':
                        backupID = message.args[2];

                        // if (settings.isPremium === false) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                        if (!backupID) return message.channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **${settings.prefix.concat('backup server list')}**`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('1')
                                    .setLabel('Yes')
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId('2')
                                    .setLabel('No')
                                    .setStyle(ButtonStyle.Secondary),
                            );

                        let yus = new Embed(bot, message.guild)
                            .setTitle('Guild/e-backup-carregar:E_BACKUP_CARREGAR')
                            .setAuthor({ name: message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR1', { author: message.author.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                            .setDescription(`Before proceeding, are you really sure you want to perform this action?\n\n*By clicking "**Yes**" there will be no way back from this choice, the whole server will be reset to the current state of the backup.*\n\nYou can click "**No**" to cancel this operation.`)
                            .setColor(1)
                            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Servidor/e-backup-carregar:USAGEE`)}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                            .setThumbnail(message.guild.iconURL({ dynamic: true }))

                        const interactiveMessage = await message.channel.send({ embeds: [yus], components: [row] });

                        const buttonCollector = await interactiveMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000, errors: ['time'] });

                        // find out what emoji was reacted on to update pages
                        buttonCollector.on('collect', async (i) => {
                            if (i.user.id !== message.author.id) return;
                            switch (Number(i.customId)) {
                                case 1:
                                    await i.deferReply();
                                    DiscordBackup.fetch(backupID).then((backupInfos) => {
                                        DiscordBackup.load(backupID, message.guild);
                                        // bot.channels.cache.get('806932976398893087').send(message.translate('Guild/s-backup-apagar:S_BACKUP_APAGAR5', { author: message.author.username }))
                                        message.channel.success(`Backup \`${backupID}\` was uploaded successfully!`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                                    }).catch((err) => {
                                        return message.channel.error(`Uh-oh! **BackupID** invalid or does not exist on my database. Please check and try again.`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                                    });
                                    break;
                                case 2:
                                    await i.deferReply();
                                    i.editReply({ content: message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR3'), embeds: null }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                                    break;
                                default:
                                    break;
                            }
                        });

                        // when timer runs out remove all reactions to show end of pageinator
                        buttonCollector.on('end', () => interactiveMessage.deleteReply());

                        break;

                    case 'list':
                        backupID = message.args[2];
                        // backupIDl = message.args[0]

                        // if (settings.isPremium === false) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

                        if (!backupID) return message.channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **${settings.prefix.concat('backup server list')}**`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                        DiscordBackup.fetch(backupID).then((backupInfos) => {
                            const date = new Date(backupInfos.data.createdTimestamp);
                            const yyyy = date.getFullYear().toString(), mm = (date.getMonth() + 1).toString(), dd = date.getDate().toString();
                            const formatedDate = `${yyyy}/${(mm[1] ? mm : "0" + mm[0])}/${(dd[1] ? dd : "0" + dd[0])}`;
                            let backups = new Embed(bot, message.guild)
                                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                                .setColor(1)
                                .setDescription(`${message.translate('Guild/s-backup-info:S_BACKUP_INFO1')} ${backupInfos.id} \n ${message.translate('Guild/s-backup-info:S_BACKUP_INFO2')} ${backupInfos.data.name} \n ${message.translate('Guild/s-backup-info:S_BACKUP_INFO3')} ${backupInfos.size} ${message.translate('Guild/s-backup-info:S_BACKUP_INFO4')} ${formatedDate}`)
                                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Guild/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ dynamic: true })}` })
                            message.channel.send({ embeds: [backups] })
                        }).catch((err) => {
                            return message.channel.error(`Uh-oh! **BackupID** invalid or does not exist on my database. Please check and try again.`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                        });
                        break;

                    default:
                        message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: message.translate(`Guild/${this.help.name}:USAGE`, { EXAMPLE: message.translate(`Guild/${this.help.name}:EXAMPLE`, { prefix: settings.prefix }) }) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                        break;
                }

                break;

            case 'emoji':

                switch (message.args[1]) {
                    case 'create':
                        code = message.author.id.toString().substr(0, 2) + '-' + random(4) + '-' + message.author.id.toString().substr(2, 2);

                        if (!message.channel.permissionsFor(message.member).has(Flags.Administrator)) return message.channel.error('USER_PERMISSION', { PERMISSIONS: 'ADMINISTRATOR' }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                        let emojis = message.guild.emojis.cache;
                        if (emojis.size === 0) {
                            embed = new Embed(bot, message.guild)
                                .setAuthor({ name: message.translate('Guild/e-backup-criar:E_BACKUP_CRIAR', { author: message.author.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setDescription(message.translate('Guild/e-backup-criar:E_BACKUP_CRIAR1'))
                                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setColor(1)
                                .setTimestamp()

                            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                        }
                        try {
                            message.author.send(`${message.translate('Guild/e-backup-criar:E_BACKUP_CRIAR2')}** ` + code + `**`);
                        } catch (err) {
                            return message.channel.send(message.translate('Guild/e-backup-criar:E_BACKUP_CRIAR3')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                        }
                        arr = new Array();
                        emojis.forEach(e => arr.push(e.toString()));

                        await new Backup({
                            userID: message.author.id,
                            guildID: message.guild.id,
                            guildName: message.guild.name,
                            code: code,
                            emojis: arr,
                        }).save()

                        embed = new Embed(bot, message.guild)
                            .setAuthor({ name: message.translate('Guild/e-backup-criar:E_BACKUP_CRIAR', { author: message.author.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                            .setDescription(message.translate('Guild/e-backup-criar:E_BACKUP_CRIAR4'))
                            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                            .setColor(1)
                            .setTimestamp()

                        message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        break;

                    case 'delete':
                        code = message.args[2];
                        if (!code) return message.channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **${settings.prefix.concat('backup emoji list')}**`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                        backup = await Backup.findOne({ userID: message.author.id, guildID: message.guild.id, code: code });
                        if (backup) {
                            await Backup.findOneAndRemove({ userID: message.author.id, guildID: message.guild.id, code: code });

                            embed = new Embed(bot, message.guild)
                                .setAuthor({ name: message.translate('Guild/e-backup-apagar:E_BACKUP_APAGAR', { author: message.author.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setDescription(message.translate('Guild/e-backup-apagar:E_BACKUP_APAGAR2'))
                                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setColor(1)
                                .setTimestamp()

                            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        } else {
                            embed = new Embed(bot, message.guild)
                                .setAuthor({ name: message.translate('Guild/e-backup-apagar:E_BACKUP_APAGAR', { author: message.author.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setDescription(message.translate('Guild/e-backup-apagar:E_BACKUP_APAGAR3'))
                                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setColor(1)
                                .setTimestamp()

                            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                        }
                        break;

                    case 'load':
                        code = message.args[2];
                        if (!code) return message.channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **${settings.prefix.concat('backup emoji list')}**`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('1')
                                    .setLabel('⏮')
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId('2')
                                    .setLabel('◀️')
                                    .setStyle(ButtonStyle.Secondary),
                            );

                        backup = await Backup.findOne({ userID: message.author.id, guildID: message.guild.id, code: code });

                        let yus = new Embed(bot, message.guild)
                            .setTitle('Guild/e-backup-carregar:E_BACKUP_CARREGAR')
                            .setAuthor({ name: message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR1', { author: message.author.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                            .setDescription(message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR2'))
                            .setColor(1)
                            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Servidor/e-backup-carregar:USAGEE`)}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                            .setThumbnail(message.guild.iconURL({ dynamic: true }))

                        const interactiveMessage = await message.channel.send({ embeds: [yus], components: [row] });

                        const buttonCollector = await interactiveMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000, errors: ['time'] });

                        // find out what emoji was reacted on to update pages
                        buttonCollector.on('collect', async (i) => {
                            if (i.user.id !== message.author.id) return;
                            switch (Number(i.customId)) {
                                case 1:
                                    await i.deferReply();
                                    if (backup) {
                                        if (!backup.emojis) return i.editReply(message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR5')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                                        try {
                                            backup.emojis.forEach(emote => {
                                                let emoji = parseEmoji(emote);
                                                if (emoji.id) {
                                                    const Link = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
                                                    message.guild.emojis.create({ attachment: Link, name: emoji.name })
                                                }
                                            });
                                        } catch (err) {
                                            bot.logger.error(`Comando: 'e-backup-carregar' ocorreu um error: ${err.message}.`);
                                            i.editReply(settings.Language, 'ERROR_MESSAGE', message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR6')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                                        }
                                        i.editReply(message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR7')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                                    } else {
                                        embed = new Embed(bot, message.guild)
                                            .setAuthor({ name: message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR'), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                            .setDescription(message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR8'))
                                            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Servidor/e-backup-carregar:USAGEE`)}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                            .setColor(1)
                                            .setTimestamp();

                                        return i.editReply({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                                    }
                                    break;
                                case 2:
                                    await i.deferReply();
                                    i.editReply({ content: message.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR3'), embeds: null }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                                    break;
                                default:
                                    break;
                            }
                        });

                        // when timer runs out remove all reactions to show end of pageinator
                        buttonCollector.on('end', () => interactiveMessage.deleteReply());
                        break;

                    case 'list':
                        backup = await Backup.find({ userID: message.author.id });
                        if (!backup || backup === null) return message.channel.send(message.translate('Guild/e-backup-lista:E_BACKUP_LISTA'));
                        if (!backup.toString()) return message.channel.send(message.translate('Guild/e-backup-lista:E_BACKUP_LISTA1'));

                        arr = new Array()

                        for (const back of backup) {
                            arr.push(`${back.guildName} | ${back.code} | ${back.emojis.length}`)
                        }

                        embed = new Embed(bot, message.guild)
                            .setTitle('Guild/e-backup-lista:E_BACKUP_LISTA2')
                            .setDescription(`${message.translate('Guild/e-backup-lista:E_BACKUP_LISTA3')}\n${arr.join("\n")}`)
                            .setAuthor({ name: message.translate('Guild/e-backup-lista:E_BACKUP_LISTA4', { author: message.author.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                            .setColor(1)
                            .setTimestamp()

                        message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        break;
                    default:
                        message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: message.translate(`Guild/${this.help.name}:USAGE`, { EXAMPLE: message.translate(`Guild/${this.help.name}:EXAMPLE`, { prefix: settings.prefix }) }) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                        break;
                }
                break;

            default:
                message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: message.translate(`Guild/${this.help.name}:USAGE`, { EXAMPLE: message.translate(`Guild/${this.help.name}:EXAMPLE`, { prefix: settings.prefix }) }) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                break;
        }
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = interaction.user,
            channel = guild.channels.cache.get(interaction.channelId),
            type = args.get('type')?.value,
            option = args.get('option')?.value,
            backupid = args.get('backupid')?.value;

        try {
            // Get Interaction Message Data
            await interaction.deferReply();
            let code, backup, arr, embed, backupID;

            switch (type) {
                case 'server':

                    switch (option) {
                        case 'create':

                            // if (settings.isPremium === false) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

                            await interaction.editReply(guild.translate('Guild/s-backup-criar:S_BACKUP_CRIAR2'));

                            DiscordBackup.setStorageFolder(path.resolve(__dirname, '../../../assets/backups'));
                            DiscordBackup.create(guild, {
                                jsonBeautify: true,
                                saveImages: "base64",
                                maxMessagesPerChannel: '10',
                                doNotBackup: ["emojis", "bans"],
                                clearGuildBeforeRestore: true,
                            }).then((backupData) => {
                                try {
                                    embed = new Embed(bot, guild)
                                        .setAuthor({ name: `Hello ${member.username}`, iconURL: bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }) })
                                        .setColor(1)
                                        .setDescription(`O Backup do servidor **${guild.name}** foi gerado com sucesso!\n\n
                                        _Informações_
                                        **Backup Id:** ${backupData.id}
                                        **Data de expiração** -/-`)
                                        .setFooter({ text: `To prevent this backup from automatically expiring, get /premium`, iconURL: `https://cdn.discordapp.com/emojis/823004619805294643.webp?size=128&quality=lossless` })
                                    member.send({ embeds: [embed] });
                                } catch (err) {
                                    return interaction.editReply('Uh-oh! Sorry, but I was unable to send dm to you, make sure your DM is **enabled**.').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                                }

                                embed = new Embed(bot, guild)
                                    .setAuthor({ name: guild.translate('Guild/e-backup-criar:E_BACKUP_CRIAR', { author: member.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                    .setDescription(guild.translate('Guild/e-backup-criar:E_BACKUP_CRIAR4'))
                                    .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                    .setColor(1)
                                    .setTimestamp()

                                interaction.editReply({ content: ' ', embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                            });
                            break;

                        case 'delete':
                            // if (settings.isPremium === false) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                            if (!backupid) return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **/backup server list**`, {}, true)] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                            DiscordBackup.fetch(backupid).then((backupInfos) => {
                                DiscordBackup.remove(backupid);
                                // bot.channels.cache.get('806932976398893087').send(message.translate('Guild/s-backup-apagar:S_BACKUP_APAGAR5', { author: message.author.username }))
                                interaction.editReply({ content: ' ', embeds: [channel.success(`Backup \`${backupid}\` was deleted successfully!`, {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                            }).catch((err) => {
                                return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! **BackupID** invalid or does not exist on my database. Please check and try again.`, {}, true)], ephemeral: true });
                            });
                            break;

                        case 'load':
                            // if (settings.isPremium === false) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                            if (!backupid) return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **/backup server list**`, {}, true)] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('1')
                                        .setLabel('Yes')
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId('2')
                                        .setLabel('No')
                                        .setStyle(ButtonStyle.Danger),
                                );

                            let yus = new Embed(bot, guild)
                                .setTitle('Guild/e-backup-carregar:E_BACKUP_CARREGAR')
                                .setAuthor({ name: guild.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR1', { author: member.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setDescription(`Before proceeding, are you really sure you want to perform this action?\n\n*By clicking "**Yes**" there will be no way back from this choice, the whole server will be reset to the current state of the backup.*\n\nYou can click "**No**" to cancel this operation.`)
                                .setColor(1)
                                .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setThumbnail(guild.iconURL({ dynamic: true }))

                            const interactiveMessage = await interaction.editReply({ embeds: [yus], components: [row] });

                            const buttonCollector = await interactiveMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000, errors: ['time'] });

                            // find out what emoji was reacted on to update pages
                            buttonCollector.on('collect', async (i) => {
                                if (i.user.id !== member.id) return;
                                switch (Number(i.customId)) {
                                    case 1:
                                        // await i.deferReply();
                                        DiscordBackup.fetch(backupid).then((backupInfos) => {
                                            DiscordBackup.load(backupid, guild);
                                            // bot.channels.cache.get('806932976398893087').send(message.translate('Guild/s-backup-apagar:S_BACKUP_APAGAR5', { author: message.author.username }))
                                            interaction.editReply({ content: ' ', embeds: [channel.success(`Backup \`${backupid}\` was uploaded successfully!`, {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                                        }).catch((err) => {
                                            return interaction.editReply({ content: ' ', embeds: [channel.error`Uh-oh! **BackupID** invalid or does not exist on my database. Please check and try again.`, {}, true] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                                        });
                                        break;
                                    case 2:
                                        // await i.deferReply();
                                        interaction.editReply({ content: guild.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR3'), embeds: [], components: [] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                                        break;
                                    default:
                                        break;
                                }
                            });

                            // when timer runs out remove all reactions to show end of pageinator
                            buttonCollector.on('end', () => interaction.deleteReply());

                            break;

                        case 'list':

                            // if (settings.isPremium === false) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

                            if (!backupid) return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **/backup server list**`, {}, true)] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                            DiscordBackup.fetch(backupid).then((backupInfos) => {
                                const date = new Date(backupInfos.data.createdTimestamp);
                                const yyyy = date.getFullYear().toString(), mm = (date.getMonth() + 1).toString(), dd = date.getDate().toString();
                                const formatedDate = `${yyyy}/${(mm[1] ? mm : "0" + mm[0])}/${(dd[1] ? dd : "0" + dd[0])}`;
                                let backups = new Embed(bot, guild)
                                    .setAuthor({ name: member.username, iconURL: member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }) })
                                    .setColor(1)
                                    .setDescription(`${message.translate('Guild/s-backup-info:S_BACKUP_INFO1')} ${backupInfos.id} \n ${message.translate('Guild/s-backup-info:S_BACKUP_INFO2')} ${backupInfos.data.name} \n ${message.translate('Guild/s-backup-info:S_BACKUP_INFO3')} ${backupInfos.size} ${message.translate('Guild/s-backup-info:S_BACKUP_INFO4')} ${formatedDate}`)
                                    .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                interaction.editReply({ embeds: [backups] })
                            }).catch((err) => {
                                return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! **BackupID** invalid or does not exist on my database. Please check and try again.`, {}, true)] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                            });
                            break;

                        default:
                            break;
                    }

                    break;

                case 'emoji':

                    switch (option) {
                        case 'create':
                            code = member.id.toString().substr(0, 2) + '-' + random(4) + '-' + member.id.toString().substr(2, 2);

                            if (!channel.permissionsFor(member).has(Flags.Administrator)) return interaction.editReply({ content: ' ', embeds: [channel.error('USER_PERMISSION', { PERMISSIONS: 'ADMINISTRATOR' }, true)] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                            let emojis = guild.emojis.cache;
                            if (emojis.size === 0) {
                                embed = new Embed(bot, guild)
                                    .setAuthor({ name: guild.translate('Guild/e-backup-criar:E_BACKUP_CRIAR', { author: member.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                    .setDescription(guild.translate('Guild/e-backup-criar:E_BACKUP_CRIAR1'))
                                    .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                    .setColor(1)
                                    .setTimestamp()

                                interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                            }
                            try {
                                member.send(`${guild.translate('Guild/e-backup-criar:E_BACKUP_CRIAR2')}** ` + code + `**`);
                            } catch (err) {
                                return interaction.editReply({ content: ' ', embeds: [channel.error('Guild/e-backup-criar:E_BACKUP_CRIAR3', {}, true)] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                            }
                            arr = new Array();
                            emojis.forEach(e => arr.push(e.toString()));

                            await new Backup({
                                userID: member.id,
                                guildID: guild.id,
                                guildName: guild.name,
                                code: code,
                                emojis: arr,
                            }).save()

                            embed = new Embed(bot, guild)
                                .setAuthor({ name: guild.translate('Guild/e-backup-criar:E_BACKUP_CRIAR', { author: member.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setDescription(guild.translate('Guild/e-backup-criar:E_BACKUP_CRIAR4'))
                                .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setColor(1)
                                .setTimestamp()

                            interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                            break;

                        case 'delete':
                            if (!backupid) return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **/backup emoji list**`, {}, true)] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                            backup = await Backup.findOne({ userID: member.id, guildID: guild.id, code: backupid });
                            if (backup) {
                                await Backup.findOneAndRemove({ userID: member.id, guildID: guild.id, code: backupid });

                                embed = new Embed(bot, guild)
                                    .setAuthor({ name: guild.translate('Guild/e-backup-apagar:E_BACKUP_APAGAR', { author: member.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                    .setDescription(guild.translate('Guild/e-backup-apagar:E_BACKUP_APAGAR2'))
                                    .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                    .setColor(1)
                                    .setTimestamp()

                                interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                            } else {
                                embed = new Embed(bot, guild)
                                    .setAuthor({ name: guild.translate('Guild/e-backup-apagar:E_BACKUP_APAGAR', { author: member.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                    .setDescription(guild.translate('Guild/e-backup-apagar:E_BACKUP_APAGAR3'))
                                    .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                    .setColor(1)
                                    .setTimestamp()

                                interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                            }
                            break;

                        case 'load':
                            if (!backupid) return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! Please enter the **backup ID**! If you don't know, check using the command **/backup emoji list**`, {}, true)] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('1')
                                        .setLabel('Yes')
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId('2')
                                        .setLabel('No')
                                        .setStyle(ButtonStyle.Danger),
                                );

                            backup = await Backup.findOne({ userID: member.id, guildID: guild.id, code: backupid });

                            let yus = new Embed(bot, guild)
                                .setTitle('Guild/e-backup-carregar:E_BACKUP_CARREGAR')
                                .setAuthor({ name: guild.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR1', { author: member.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setDescription(guild.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR2'))
                                .setColor(1)
                                .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setThumbnail(guild.iconURL({ dynamic: true }))

                            const interactiveMessage = await interaction.editReply({ embeds: [yus], components: [row] });

                            const buttonCollector = await interactiveMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000, errors: ['time'] });

                            // find out what emoji was reacted on to update pages
                            buttonCollector.on('collect', async (i) => {
                                if (i.user.id !== member.id) return;
                                switch (Number(i.customId)) {
                                    case 1:
                                        // await i.deferReply();
                                        if (backup) {
                                            if (!backup.emojis) return interaction.editReply(guild.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR5')).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                                            try {
                                                backup.emojis.forEach(emote => {
                                                    let emoji = parseEmoji(emote);
                                                    if (emoji.id) {
                                                        const Link = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
                                                        guild.emojis.create({ attachment: Link, name: emoji.name })
                                                    }
                                                });
                                                interaction.editReply({ content: guild.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR7'), embeds: [], components: [] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                                            } catch (err) {
                                                bot.logger.error(`Comando: 'e-backup-carregar' ocorreu um error: ${err.message}.`);
                                                interaction.editReply('ERROR_MESSAGE', { err: guild.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR6') }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                                            }
                                        } else {
                                            return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! **BackupID** invalid or does not exist on my database. Please check and try again.`, {}, true)], components: [] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
                                        }
                                        break;
                                    case 2:
                                        // await i.deferReply();
                                        interaction.editReply({ content: guild.translate('Guild/e-backup-carregar:E_BACKUP_CARREGAR3'), embeds: [], components: [] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                                        break;
                                    default:
                                        break;
                                }
                            });

                            // when timer runs out remove all reactions to show end of pageinator
                            buttonCollector.on('end', () => interactiveMessage.deleteReply());
                            break;

                        case 'list':
                            backup = await Backup.find({ userID: member.id });
                            if (!backup || backup === null) return interaction.editReply(guild.translate('Guild/e-backup-lista:E_BACKUP_LISTA'));
                            if (!backup.toString()) return interaction.editReply(guild.translate('Guild/e-backup-lista:E_BACKUP_LISTA1'));

                            arr = new Array()

                            for (const back of backup) {
                                arr.push(`${back.guildName} | ${back.code} | ${back.emojis.length}`)
                            }

                            embed = new Embed(bot, guild)
                                .setTitle('Guild/e-backup-lista:E_BACKUP_LISTA2')
                                .setDescription(`${guild.translate('Guild/e-backup-lista:E_BACKUP_LISTA3')}\n${arr.join("\n")}`)
                                .setAuthor({ name: guild.translate('Guild/e-backup-lista:E_BACKUP_LISTA4', { author: member.username }), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                                .setColor(1)
                                .setTimestamp()

                            interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                            break;
                        default:
                            break;
                    }
                    break;

                default:
                    break;
            }

        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
}