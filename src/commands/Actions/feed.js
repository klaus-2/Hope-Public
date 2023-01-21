// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
    actions = require(`${process.cwd()}/assets/json/actions.json`),
    fetch = require('node-fetch'),
    baseURI = 'https://rra.ram.moe/i/r?type=nom',
    uri = 'https://rra.ram.moe',
    Command = require('../../structures/Command.js');

module.exports = class Feed extends Command {
    constructor(bot) {
        super(bot, {
            name: 'feed',
            dirname: __dirname,
            aliases: ["comer"],
            description: 'Eat something with the user(s) you mentioned!',
            usage: '<prefix><commandName> [user]',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            cooldown: 3000,
            examples: ['/feed', '.feed @Hope', '!feed @Klaus @Hope @Faith'],
            slash: true,
            options: [{
                name: 'user',
                description: 'Choose the target user',
                type: ApplicationCommandOptionType.User,
                required: false,
            },
            {
                name: 'user2',
                description: 'Choose the target user',
                type: ApplicationCommandOptionType.User,
                required: false,
            },
            {
                name: 'user3',
                description: 'Choose the target user',
                type: ApplicationCommandOptionType.User,
                required: false,
            }],
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        detectUserfromArgs(message).then(mentions => {

            const embed = new Embed(bot, message.guild)
                .setColor(16248815)

            if (mentions.length < 1) {
                embed.setDescription(message.translate('Actions/feed:COMER_DESCRIÇÃO', { member: message.member }))
                    .setImage(`https://i.imgur.com/${actions.disgust[Math.floor(Math.random() * (actions.disgust.length - 1))]}.gif`)
                return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            } else if ((mentions.length === 1) && (mentions[0] === `${message.translate('Actions/feed:COMER_Hope')}`)) {
                fetch(baseURI).then(res => res.json()).then(json => {
                    embed.setImage(`${uri}${json.path}`).setDescription(`${message.member} ${message.translate('Actions/feed:COMER_DESCRIÇÃO2')}`)
                    return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 })).then(() => {
                        message.channel.send(message.translate('Actions/feed:COMER_HopeFRASE')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                    })
                }).catch(() => { message.channel.send(message.translate('Actions/feed:COMER_HopeFRASE1')).then(m => m.timedDelete({ timeout: 10000 })) })
            } else if (mentions.includes(`${message.translate('Actions/feed:COMER_Hope')}`)) { //me
                fetch(baseURI).then(res => res.json()).then(json => {
                    embed.setImage(`${uri}${json.path}`).setDescription(`${message.member} ${message.translate('Actions/feed:COMER_DESCRIÇÃO1')} ${stringifyMentions(mentions)}!`)
                    return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 })).then(() => {
                        message.channel.send(message.translate('Actions/feed:COMER_HopeFRASE')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                    })
                }).catch(() => { message.channel.send(message.translate('Actions/feed:COMER_APIOFF')).then(m => m.timedDelete({ timeout: 10000 })) })
            } else {
                fetch(baseURI).then(res => res.json()).then(json => {
                    embed.setImage(`${uri}${json.path}`).setDescription(`${message.member} ${message.translate('Actions/feed:COMER_DESCRIÇÃO1')} ${stringifyMentions(mentions)}!`)
                    return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                }).catch(() => { message.channel.send(message.translate('Actions/feed:COMER_APIOFF')).then(m => m.timedDelete({ timeout: 10000 })) })
            }
        })
        
        function stringifyMentions(output) {
            if (output.length === 2) {
                output = output.join(message.translate('Actions/feed:COMER_DESC'))
            } else if (output.length > 2) {
                let last = output.pop()
                output = output.join(', ') + `${message.translate('Actions/feed:COMER_DESC1')}` + last
            }
            return (output)
        }
        function detectUserfromArgs(message) {
            return new Promise((resolve, reject) => {
                let members = []
                let output = []

                //detecta uma menção
                if (message.mentions.members.size > 0) {
                    message.mentions.members.forEach(member => {
                        if (!members.includes(member)) {
                            members.push(member)
                        }
                    })
                }

                message.args = []
                message.arg1 = message.content.split(/ +/)
                message.arg2 = message.cleanContent.split(/ +/)
                message.arg1.forEach(content => {
                    if (message.arg2.includes(content)) {
                        message.args.push(content)
                    }
                })

                //detecta um nome
                message.args.forEach(word => {
                    let found = message.guild.members.cache.find(m => (m.displayName.toLowerCase() === word.toLowerCase()) || (m.user.username.toLowerCase() === word.toLowerCase()))
                    if (found) {
                        if (!members.includes(found)) {
                            members.push(found)
                        }
                    }
                })

                //extrai um id
                members.forEach(member => {
                    // obtem confg do servidor
                    const settings = (message.guild) ? message.guild.settings : bot.config.defaultSettings;
                    if (Object.keys(settings).length == 0) return;
                    if (member.id === message.member.id) {
                        return
                    } else if (member.id === message.client.user.id) {
                        output.push(message.translate('Actions/feed:COMER_Hope'))
                    } else
                        output.push(`<@${member.id}>`)
                })

                resolve(output)
            })
        }
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
        const channel = guild.channels.cache.get(interaction.channelId);

        const embed = new Embed(bot, guild)
            .setColor(16248815)

        let mentions = [];
        if (guild.members.cache.get(args.get('user')?.value)?.user === bot.user) {
            mentions.push(guild.translate('Actions/feed:COMER_Hope'));
        } else {
            if (guild.members.cache.get(args.get('user')?.value)?.user) mentions.push(guild.members.cache.get(args.get('user')?.value)?.user);
        }

        if (guild.members.cache.get(args.get('user2')?.value)?.user === bot.user) {
            mentions.push(guild.translate('Actions/feed:COMER_Hope'));
        } else {
            if (guild.members.cache.get(args.get('user2')?.value)?.user) mentions.push(guild.members.cache.get(args.get('user2')?.value)?.user);
        }

        if (guild.members.cache.get(args.get('user3')?.value)?.user === bot.user) {
            mentions.push(guild.translate('Actions/feed:COMER_Hope'));
        } else {
            if (guild.members.cache.get(args.get('user3')?.value)?.user) mentions.push(guild.members.cache.get(args.get('user3')?.value)?.user);
        }
        //if (guild.members.cache.get(args.get('user2')?.value)?.user) mentions.push(guild.members.cache.get(args.get('user2')?.value)?.user);
        //if (guild.members.cache.get(args.get('user3')?.value)?.user) mentions.push(guild.members.cache.get(args.get('user3')?.value)?.user);
        // console.log(mentions)
        try {
            // Get Interaction Message Data
            await interaction.deferReply();

            function stringifyMentionss(output) {
                if (output.length === 2) {
                    output = output.join(guild.translate('Actions/feed:COMER_DESC'))
                } else if (output.length > 2) {
                    let last = output.pop()
                    output = output.join(', ') + `${guild.translate('Actions/feed:COMER_DESC1')}` + `${last}`
                }
                return (output)
            }

            if (mentions.length < 1) {
                embed.setDescription(guild.translate('Actions/feed:COMER_DESCRIÇÃO', { member: member }))
                    .setImage(`https://i.imgur.com/${actions.disgust[Math.floor(Math.random() * (actions.disgust.length - 1))]}.gif`)
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            } else if ((mentions.length === 1) && (mentions[0] === `${guild.translate('Actions/feed:COMER_Hope')}`)) {
                fetch(baseURI).then(res => res.json()).then(json => {
                    embed.setImage(`${uri}${json.path}`).setDescription(`${interaction.user} ${guild.translate('Actions/feed:COMER_DESCRIÇÃO2')}`)
                    return interaction.editReply({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 })).then(() => {
                        interaction.editReply({ content: guild.translate('Actions/feed:COMER_HopeFRASE') }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                    })
                }).catch(() => { interaction.editReply({ content: guild.translate('Actions/feed:COMER_HopeFRASE1') }).then(m => m.timedDelete({ timeout: 10000 })) })
            } else if (mentions.includes(`${guild.translate('Actions/feed:COMER_Hope')}`)) { //me
                fetch(baseURI).then(res => res.json()).then(json => {
                    embed.setImage(`${uri}${json.path}`).setDescription(`${interaction.user} ${guild.translate('Actions/feed:COMER_DESCRIÇÃO1')} ${stringifyMentionss(mentions)}!`)
                    return interaction.editReply({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 })).then(() => {
                        interaction.editReply({ content: guild.translate('Actions/feed:COMER_HopeFRASE') }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                    })
                }).catch(() => { interaction.editReply({ content: guild.translate('Actions/feed:COMER_APIOFF') }).then(m => m.timedDelete({ timeout: 10000 })) })
            } else {
                fetch(baseURI).then(res => res.json()).then(json => {
                    embed.setImage(`${uri}${json.path}`).setDescription(`${interaction.user} ${guild.translate('Actions/feed:COMER_DESCRIÇÃO1')} ${stringifyMentionss(mentions)}!`)
                    return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                }).catch(() => { interaction.editReply({ content: guild.translate('Actions/feed:COMER_APIOFF') }).then(m => m.timedDelete({ timeout: 10000 })) })
            }
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
}