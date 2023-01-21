const { Embed } = require(`../../utils`),
    jscordStorage = require("jscord-storage"),
    Event = require('../../structures/Event'),
    { loggingSystem } = require('../../database/models'),
    Avatares = require('../../database/models/avatares');

module.exports = class userUpdate extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    // Exec event
    async run(bot, oldUser, newUser) {
        // If Partial, Fetch
        if (oldUser.partial) { await oldUser.fetch(); }

        if (newUser.id == bot.user.id) return;
        if (newUser.bot == true) return;

        // Search for the Member
        bot.guilds.cache.forEach(async guild => {
            await guild.members.cache.forEach(async (member, memberid) => {
                if (newUser.id === memberid) {

                    // obtem configurações do servidor
                    const settings = member.guild.settings;
                    if (Object.keys(settings).length == 0) return;

                    // SE CONECTA NA DB DE LOGS
                    let logDB = await loggingSystem.findOne({ _id: member.guild.id });
                    if (!logDB) {
                        const newSettings = new loggingSystem({
                            _id: member.guild.id
                        });
                        await newSettings.save().catch(() => { });
                        logDB = await loggingSystem.findOne({ _id: member.guild.id });
                    }

                    /** ------------------------------------------------------------------------------------------------
                    * [AUTO-MOD] ANTI-DEHOISTING (Anti dehoisting nicknames)
                    * ------------------------------------------------------------------------------------------------ */

                    if (settings.Auto_ModAntiDehoisting == true) {
                        if (newUser.username.match(/^[^\w\s\d]/)) {
                            // const char = newUser.displayName.codePointAt(0);
                            // 🠷${newUser.displayName.slice(char <= 0xff ? 1 : 2)}
                            const newNick = `CHANGE UR NAME — Hope AUTOMOD`;
                            try {
                                //  EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
                                bot.logger.automod(`[AUTO-MOD] Anti-Dehoisting: Um usuario foi detectado com hoisting, iniciando ações adequadas ao usuario.`);
                                await newUser.setNickname(newNick, '[Hope AUTO-MOD] Anti-Dehoisting');
                            } catch {
                                // do nothing.
                            }
                        }
                    }

                    /** ------------------------------------------------------------------------------------------------
                    * [EVENT] Username Change
                    * ------------------------------------------------------------------------------------------------ */
                    if (logDB.MemberEvents.NameChangesToggle == true && logDB.MemberEvents.Toggle) {
                        // CHECK A COR E DEFINE A COR DEFAULT
                        let color = logDB.MemberEvents.EmbedColor;
                        if (color == "#000000") color = 16086051;

                        let embed, updated = false;

                        if (oldUser.username !== newUser.username) {
                            //  Setup Embed
                            embed = new Embed(bot, member.guild)
                                .setTitle('User Changed Username')
                                .setAuthor({ name: `${member.nickname ? `${member.nickname} | ${newUser.tag}` : newUser.tag}`, iconURL: oldUser.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
                                .setDescription(`**Old Username›** ${oldUser.username}\n**New Username›** ${newUser.username}`)
                                .setColor(color)

                            updated = true;
                        }

                        if (updated) {
                            //  localiza o canal e envia msg
                            try {
                                const modChannel = await bot.channels.fetch(logDB.MemberEvents?.LogChannel).catch(() => {
                                    // do nothing.
                                });
                                if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, [embed]);
                            } catch (err) {
                                bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
                            }
                        }
                    }
                    /** ------------------------------------------------------------------------------------------------
                    * [EVENT] Discriminator Changed
                    * ------------------------------------------------------------------------------------------------ */
                    if (logDB.MemberEvents?.DiscriminatorChangesToggle == true && logDB.MemberEvents?.Toggle == true) {
                        // CHECK A COR E DEFINE A COR DEFAULT
                        let color = logDB.MemberEvents.EmbedColor;
                        if (color == "#000000") color = 16086051;

                        let embed, updated = false;

                        if (oldUser.discriminator !== newUser.discriminator) {
                            //  Setup Embed
                            embed = new Embed(bot, member.guild)
                                .setTitle('User Changed Discriminator')
                                .setAuthor({ name: `${member.nickname ? `${member.nickname} | ${newUser.tag}` : newUser.tag}`, iconURL: oldUser.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
                                .setDescription(`**Old Discriminator›** ${oldUser.username}#${oldUser.discriminator}\n**New Discriminator›** ${oldUser.username}#${newUser.discriminator}`)
                                .setColor(color)

                            updated = true;
                        }

                        if (updated) {
                            //  localiza o canal e envia msg
                            try {
                                const modChannel = await bot.channels.fetch(logDB.MemberEvents?.LogChannel).catch(() => {
                                    // do nothing.
                                });
                                if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, [embed]);
                            } catch (err) {
                                bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
                            }
                        }
                    }
                    /** ------------------------------------------------------------------------------------------------
                    * [EVENT] Avatar Changed
                    * ------------------------------------------------------------------------------------------------ */
                    if (logDB.MemberEvents?.AvatarChangesToggle == true && logDB.MemberEvents?.Toggle == true) {
                        // CHECK A COR E DEFINE A COR DEFAULT
                        let color = logDB.MemberEvents.EmbedColor;
                        if (color == "#000000") color = 16086051;

                        let embed, updated = false;

                        if (oldUser.avatar !== newUser.avatar) {
                            const filename = "Hope-avatar-atual.jpg";
                            const url =
                                `https://cdn.discordapp.com/avatars/${newUser.id}/${newUser.avatar}.png?size=1024`;
                            // const file = '/path/to/your/file' -> jscord-storage v0.0.7+

                            jscordStorage.upload(filename, url).then((data) => {
                                const filenamee = "Hope-avatar-antigo.png";
                                // console.log(`https://cdn.discordapp.com/avatars/${newUser.id}/${newUser.avatar}.png?size=1024`)
                                // console.log(`https://cdn.discordapp.com/avatars/${newUser.id}/${oldUser.avatar}.png?size=1024`)
                                const urll =
                                    `https://cdn.discordapp.com/avatars/${newUser.id}/${oldUser.avatar}.png?size=1024`;

                                jscordStorage.upload(filenamee, urll).then(async (dataa) => {
                                    //  Setup Embed
                                    embed = new Embed(bot, member.guild)
                                        .setTitle('Events/userUpdate:USERUPDATE', { username: newUser.username })
                                        .setDescription(`${member.guild.translate('Events/userUpdate:USERUPDATE1')}`)
                                        // .setImage(newUser.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                                        .setAuthor({ name: `${member.guild.translate('Events/userUpdate:USERUPDATE2')}`, iconURL: 'https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif' })
                                        .setThumbnail(`${dataa.data.url}`)
                                        .setColor(color)
                                        .addFields(
                                            { name: `${member.guild.translate('Events/userUpdate:USERUPDATE3')}`, value: `${member.guild.translate('Events/userUpdate:USERUPDATE4')}(${dataa.data.url})`, inline: true },
                                            { name: `${member.guild.translate('Events/userUpdate:USERUPDATE5')}`, value: `${member.guild.translate('Events/userUpdate:USERUPDATE4')}(${data.data.url})`, inline: true },
                                        )
                                        .setTimestamp();

                                    updated = true;

                                    if (updated) {
                                        //  localiza o canal e envia msg
                                        try {
                                            const modChannel = await bot.channels.fetch(logDB.MemberEvents?.LogChannel).catch(() => {
                                                // do nothing.
                                            });
                                            if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, [embed]);
                                        } catch (err) {
                                            bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
                                        }
                                    }
                                });
                            });

                        }
                    }
                }
            });
        });
        // salva os ultimos 5 avatares
        /* if (oldUser.avatar !== newUser.avatar) {
            if (newUser.avatar == null || oldUser.avatar == newUser.avatar) {
                return;
            } else {
                const dbAvatar = await Avatares.findOne({
                    userID: newUser.id,
                });

                const filename = "hope-avatar-atual.png";
                // console.log(`https://cdn.discordapp.com/avatars/${newUser.id}/${newUser.avatar}.png?size=1024`)
                // console.log(`https://cdn.discordapp.com/avatars/${newUser.id}/${oldUser.avatar}.png?size=1024`)
                const url =
                    `https://cdn.discordapp.com/avatars/${newUser.id}/${newUser.avatar}.png?size=1024`;

                jscordStorage
                    .upload(filename, url)
                    .then((data) => {
                        const filenamee = "hope-avatar-antigo.png";
                        // console.log(`https://cdn.discordapp.com/avatars/${newUser.id}/${newUser.avatar}.png?size=1024`)
                        // console.log(`https://cdn.discordapp.com/avatars/${newUser.id}/${oldUser.avatar}.png?size=1024`)
                        const urll =
                            `https://cdn.discordapp.com/avatars/${newUser.id}/${oldUser.avatar}.png?size=1024`;

                        jscordStorage
                            .upload(filenamee, urll)
                            .then((dataa) => {
                                if (!dbAvatar) {
                                    const newUserr = new Avatares({
                                        userID: newUser.id,
                                        avatares: `[Link](${dataa.data.url})`,
                                    });

                                    newUserr.avatares.push(`[Link](${data.data.url})`);
                                    newUserr.save();

                                } else {
                                    if (dbAvatar.avatares.length > 4) {
                                        dbAvatar.avatares.splice(-5, 1);
                                        dbAvatar.avatares.push(`[Link](${dataa.data.url})`);
                                    } else {
                                        dbAvatar.avatares.push(`[Link](${dataa.data.url})`);
                                    }
                                    dbAvatar.save().catch(() => {
                                        //  do nothing.
                                    });
                                }
                            });
                    });
            }
        } */
    }
};