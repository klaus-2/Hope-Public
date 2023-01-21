const fs = require("fs");
const cron = require("node-cron");
const moment = require('moment');
const { Embed } = require(`../../utils`);
const { Economia, AniversariantesSchema, AniversarioSchema } = require('../../database/models');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
    const job0 = cron.schedule(
        "* * * * *",
        () => {

            /** ------------------------------------------------------------------------------------------------
            * PESQUISA TODOS SERVIDORES E OBTEM SEUS DADOSa
            * ------------------------------------------------------------------------------------------------ */
            client.guilds.cache.forEach(async (guild) => {
                /** ------------------------------------------------------------------------------------------------
                * SE CONECTA AO BANCO DE DADOS DO ANIVERSARIANTE (USER SIDE)
                * ------------------------------------------------------------------------------------------------ */
                let userlist = await AniversariantesSchema.find({ guildID: guild.id })
                /** ------------------------------------------------------------------------------------------------
                * VERIFICA A LISTA DE ANIVERSARIANTES DO SERVIDOR
                * ------------------------------------------------------------------------------------------------ */
                if (userlist.length > 0) {
                    /** ------------------------------------------------------------------------------------------------
                    * OBTEM E SEPARA CADA ANIVERSARIANTE PARA TER SUA PROPRIA MENSAGEM DE ANIVERSARIO
                    * ------------------------------------------------------------------------------------------------ */
                    userlist.forEach(async (niver) => {
                        //console.log(userlist)
                        //if(await client.users.fetch(niver.id)&&moment(niver.birthday).format('D')==moment().format('D')&&moment(niver.birthday).month()==moment().month()){
                        /** ------------------------------------------------------------------------------------------------
                        * OBTEM O DIA E O MÊS DO ANIVERSARIANTE E OS COMPARA COM A DATA ATUAL
                        * ------------------------------------------------------------------------------------------------ */
                        let today = new Date()
                        // console.log(`\nChecking for birthdays... Today's date: ${today}`)
                        const numberEndings = new Map()
                        numberEndings.set(13, 'th')
                        numberEndings.set(12, 'th')
                        numberEndings.set(11, 'th')
                        numberEndings.set(3, 'rd')
                        numberEndings.set(2, 'nd')
                        numberEndings.set(1, 'st')

                        /** ------------------------------------------------------------------------------------------------
                        * VERIFICA SE HÁ ANIVERSARIANTE + MÊS + DIA + HORA + MINUTO DO DIA, E ENTÃO EXECUTA O CODIGO DE ANUNCIO
                        * ------------------------------------------------------------------------------------------------ */
                        if (await client.users.fetch(niver.userID) && today.getMonth() === niver.birthday.getMonth() && today.getDate() === niver.birthday.getDate() && today.getHours() === niver.birthday.getHours() && today.getMinutes() === niver.birthday.getMinutes()) {
                            // Obtem dados do aniversariante (user)
                            let user = await client.users.fetch(niver.userID);
                            // Calcula a idade do usuario (user)
                            let age = today.getFullYear() - niver.birthday.getFullYear();
                            // Adiciona prefixo (EN) para o dia do aniversario
                            let ageSuffix;
                            for (const [number, suffix] of numberEndings.entries()) { // every number ends with 'th' except for numbers that end in 1, 2, or 3
                                if (`${age}`.endsWith(`${number}`)) {
                                    ageSuffix = suffix;
                                    break
                                } else {
                                    ageSuffix = "th";
                                }
                            }

                            /*
                            let bdayDescription;
                            if (age < 18) {
                                bdayDescription = `It's ${user.username}'s birthday today!`;
                            } else {
                                bdayDescription = `It's ${user.username}'s ${age}${ageSuffix} birthday today!`;
                            }
                            */

                            /** ------------------------------------------------------------------------------------------------
                            * SE CONECTA AO BANCO DE DADOS DO ANIVERSARIANTE (SERVER SIDE) VERIFICANDO SE O ADDON ESTÁ ATIVADO
                            * ------------------------------------------------------------------------------------------------ */
                            const config = await AniversarioSchema.findOne({
                                _id: guild.id,
                                toggle: true
                            });
                            /** ------------------------------------------------------------------------------------------------
                            * UM CHECK RAPIDO PARA EVITAR SPAM
                            * ------------------------------------------------------------------------------------------------ */
                            if (config == null) {
                                return;
                            }
                            /** ------------------------------------------------------------------------------------------------
                            * OBTEM O CANAL DE ANUNCIOS DO ADDON E FAZ O ENVIO
                            * ------------------------------------------------------------------------------------------------ */
                            const canal = client.channels.cache.get(config.channelID);

                            const lista = ["🎂", "🇧", "🇮", "🇷", "🇹", "🇭", "🇩", "🇦", "🇾", "🎉"];

                            const messagess = [
                                `${client.translate('Features/aniversario:NIVER', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER1', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER2', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER3', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER4', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER5', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER6', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER7', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER8', {}, client.guilds.cache.get(config._id).settings.Language)}`,
                                `${client.translate('Features/aniversario:NIVER9', {}, client.guilds.cache.get(config._id).settings.Language)}`
                            ]

                            client.guilds.cache.get(config._id).members.fetch(niver.userID).then(async person => {

                                if (config.private == true) {

                                    const embeds = new EmbedBuilder()
                                        .setColor(16755706)
                                        .setDescription(`${messagess[Math.floor(Math.random() * messagess.length)].replace('<name>', user)}`)
                                        .setFooter({ text: `${client.translate('Features/aniversario:NIVER10', {}, client.guilds.cache.get(config._id).settings.Language)}` })
                                        .setAuthor({ name: `${client.translate('Features/aniversario:NIVER11', { username: user.username.toUpperCase() }, client.guilds.cache.get(config._id).settings.Language)}`, iconURL: 'https://i.gifer.com/PY3.gif' })
                                        .setThumbnail(person.user.displayAvatarURL({ dynamic: true })) // || 'https://i.imgur.com/y06zAcf.png'
                                        .setTitle(`${client.translate('Features/aniversario:NIVER12', {}, client.guilds.cache.get(config._id).settings.Language)}`)

                                    try {
                                        if (config.messageType == "embed") {
                                            let embed = new EmbedBuilder()

                                            let color = config.embed.color;
                                            if (color) embed.setColor(color);

                                            let title = config.embed.title;
                                            if (title !== null) embed.setTitle(title);

                                            let titleUrl = config.embed.titleURL;
                                            if (titleUrl !== null) embed.setURL(titleUrl);

                                            let textEmbed = config.embed.description.replace(/{user}/g, `${member}`)
                                                .replace(/{user_tag}/g, `${person.user.tag}`)
                                                .replace(/{user_name}/g, `${person.user.username}`)
                                                .replace(/{user_ID}/g, `${person.id}`)
                                                .replace(/{guild_name}/g, `${person.guild.name}`)
                                                .replace(/{guild_ID}/g, `${person.guild.id}`)
                                                .replace(/{memberCount}/g, `${person.guild.memberCount}`)
                                                .replace(/{size}/g, `${person.guild.memberCount}`)
                                                .replace(/{guild}/g, `${person.guild.name}`)
                                                .replace(/{member_createdAtAgo}/g, `${moment(person.user.createdTimestamp).fromNow()}`)
                                                .replace(/{member_createdAt}/g, `${moment(person.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);

                                            if (textEmbed !== null) embed.setDescription(textEmbed);

                                            let authorName = config.embed.author.name.replace(/{user_tag}/g, `${person.user.tag}`)
                                                .replace(/{user_name}/g, `${person.user.username}`)
                                                .replace(/{user_ID}/g, `${person.id}`)
                                                .replace(/{guild_name}/g, `${person.guild.name}`)
                                                .replace(/{guild_ID}/g, `${person.guild.id}`)
                                                .replace(/{memberCount}/g, `${person.guild.memberCount}`)
                                                .replace(/{size}/g, `${person.guild.memberCount}`)
                                                .replace(/{guild}/g, `${person.guild.name}`);

                                            if (authorName !== null) embed.setAuthor({ name: authorName });

                                            let authorIcon = config.embed.author.icon;
                                            if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

                                            let authorUrl = config.embed.author.url;
                                            if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


                                            let footer = config.embed.footer;
                                            if (footer !== null) embed.setFooter({ text: footer });

                                            let footerIcon = config.embed.footerIcon;
                                            if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

                                            let timestamp = config.embed.timestamp;
                                            if (timestamp == "true") embed.setTimestamp();


                                            let thumbnail = config.embed.thumbnail;
                                            if (thumbnail === "{userAvatar}") thumbnail = person.user.displayAvatarURL({ dynamic: true, size: 512 });
                                            if (thumbnail !== null) embed.setThumbnail(thumbnail);

                                            let image = config.embed.image;
                                            if (image === "{userAvatar}") image = person.user.displayAvatarURL({ dynamic: true, size: 512 });
                                            if (image !== null) embed.setImage(image);

                                            person.send({ embeds: [embed] });
                                        } else if (config.messageType == "text") {
                                            person.send({ content: config.messageText });
                                        } else if (config.messageType == "default") {

                                            const msgs = await person.send({ embeds: [embeds] });
                                            for (i of lista) {
                                                await msgs.react(i);
                                                //.then(msg => {})
                                                //Promise.all(list.map(c => await msg.react(c)))
                                            }
                                        }
                                    } catch (error) {
                                        console.log(`Failed to dm ${user.username} [BIRTHDAY ADDON]`)
                                        console.log(error)
                                    }
                                } else {

                                    const embeds = new EmbedBuilder()
                                        .setColor(16755706)
                                        .setDescription(`${messagess[Math.floor(Math.random() * messagess.length)].replace('<name>', user)}`)
                                        .setFooter({ text: `${client.translate('Features/aniversario:NIVER10', {}, client.guilds.cache.get(config._id).settings.Language)}` })
                                        .setAuthor({ name: `${client.translate('Features/aniversario:NIVER11', { username: user.username.toUpperCase() }, client.guilds.cache.get(config._id).settings.Language)}`, iconURL: 'https://i.gifer.com/PY3.gif' })
                                        .setThumbnail(person.user.displayAvatarURL({ dynamic: true })) // || 'https://i.imgur.com/y06zAcf.png'
                                        .setTitle(`${client.translate('Features/aniversario:NIVER12', {}, client.guilds.cache.get(config._id).settings.Language)}`)

                                    try {
                                        person.send({ content: 'happy birthday!' })
                                    } catch (error) {
                                        console.log(`Failed to dm ${user.username} [BIRTHDAY ADDON]`)
                                        console.log(error)
                                    }

                                    if (config.mentionType == "everyone") {
                                        canal.send('@everyone')
                                    } else if (config.mentionType == "role" && config.roleID) {
                                        canal.send(`<@&${config.roleID}>`)
                                    } else if (config.mentionType == "none") {
                                        // não enviar nada
                                    }

                                    if (config.messageType == "embed") {
                                        let embed = new EmbedBuilder()

                                        let color = config.embed.color;
                                        if (color) embed.setColor(color);

                                        let title = config.embed.title;
                                        if (title !== null) embed.setTitle(title);

                                        let titleUrl = config.embed.titleURL;
                                        if (titleUrl !== null) embed.setURL(titleUrl);

                                        let textEmbed = config.embed.description.replace(/{user}/g, `${member}`)
                                            .replace(/{user_tag}/g, `${person.user.tag}`)
                                            .replace(/{user_name}/g, `${person.user.username}`)
                                            .replace(/{user_ID}/g, `${person.id}`)
                                            .replace(/{guild_name}/g, `${person.guild.name}`)
                                            .replace(/{guild_ID}/g, `${person.guild.id}`)
                                            .replace(/{memberCount}/g, `${person.guild.memberCount}`)
                                            .replace(/{size}/g, `${person.guild.memberCount}`)
                                            .replace(/{guild}/g, `${person.guild.name}`)
                                            .replace(/{member_createdAtAgo}/g, `${moment(person.user.createdTimestamp).fromNow()}`)
                                            .replace(/{member_createdAt}/g, `${moment(person.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);

                                        if (textEmbed !== null) embed.setDescription(textEmbed);

                                        let authorName = config.embed.author.name.replace(/{user_tag}/g, `${person.user.tag}`)
                                            .replace(/{user_name}/g, `${person.user.username}`)
                                            .replace(/{user_ID}/g, `${person.id}`)
                                            .replace(/{guild_name}/g, `${person.guild.name}`)
                                            .replace(/{guild_ID}/g, `${person.guild.id}`)
                                            .replace(/{memberCount}/g, `${person.guild.memberCount}`)
                                            .replace(/{size}/g, `${person.guild.memberCount}`)
                                            .replace(/{guild}/g, `${person.guild.name}`);

                                        if (authorName !== null) embed.setAuthor({ name: authorName });

                                        let authorIcon = config.embed.author.icon;
                                        if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

                                        let authorUrl = config.embed.author.url;
                                        if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


                                        let footer = config.embed.footer;
                                        if (footer !== null) embed.setFooter({ text: footer });

                                        let footerIcon = config.embed.footerIcon;
                                        if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

                                        let timestamp = config.embed.timestamp;
                                        if (timestamp == "true") embed.setTimestamp();


                                        let thumbnail = config.embed.thumbnail;
                                        if (thumbnail === "{userAvatar}") thumbnail = person.user.displayAvatarURL({ dynamic: true, size: 512 });
                                        if (thumbnail !== null) embed.setThumbnail(thumbnail);

                                        let image = config.embed.image;
                                        if (image === "{userAvatar}") image = person.user.displayAvatarURL({ dynamic: true, size: 512 });
                                        if (image !== null) embed.setImage(image);

                                        canal.send({ embeds: [embed] }).catch((e) => { console.log(e) });
                                    } else if (config.messageType == "text") {
                                        canal.send({ content: config.messageText }).catch((e) => { console.log(e) });
                                    } else if (config.messageType == "default") {

                                        const msgs = await canal.send({ embeds: [embeds] })
                                        for (i of lista) {
                                            await msgs.react(i);
                                            //.then(msg => {})
                                            //Promise.all(list.map(c => await msg.react(c)))
                                        }
                                    }
                                }
                                console.log(`It's ${person.username}'s ${age}${ageSuffix} birthday today! - ${niver.birthday}`);
                            })
                        }
                    })

                }
            })
        },
        {
            timezone: "America/Los_Angeles",
        }
    );
    job0.start();
}