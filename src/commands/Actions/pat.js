// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
    fetch = require('node-fetch'),
    baseURI = 'https://rra.ram.moe/i/r?type=pat',
    uri = 'https://rra.ram.moe',
    Command = require('../../structures/Command.js');

module.exports = class Pat extends Command {
    constructor(bot) {
        super(bot, {
            name: 'pat',
            dirname: __dirname,
            aliases: ["carinho", "yum", "nom"],
            description: 'Pet the user(s) you mentioned!',
            usage: '<prefix><commandName> [user]',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            cooldown: 3000,
            examples: ['/pat', '.nom @Hope', '!carinho @Klaus', '?yum @Klaus @Hope @Faith'],
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

            const embed = new Embed(bot, message.guild).setColor(16248815)
            fetch(baseURI).then(res => res.json()).then(json => {
                embed.setImage(uri + json.path)
                if (mentions.length < 1) {
                    embed.setDescription(message.translate('Actions/pat:CARINHO_DESCRIÇÃO', { member: message.member }))
                    return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                } else if (mentions.includes(message.translate('Actions/pat:CARINHO_Hope'))) {
                    embed.setDescription(`${message.member} ${message.translate('Actions/pat:CARINHO_DESCRIÇÃO1')} ${stringifyMentions(mentions)}!`)
                    return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 })).then(() => {
                        message.channel.send(message.translate('Actions/pat:CARINHO_HopeFRASE')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                    })
                } else {
                    embed.setDescription(`${message.member} ${message.translate('Actions/pat:CARINHO_DESCRIÇÃO1')} ${stringifyMentions(mentions)}!`)
                    return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                }
            })
        })

        function stringifyMentions(output) {
            if (output.length === 2) {
                output = output.join(message.translate('Actions/pat:CARINHO_DESC'))
            } else if (output.length > 2) {
                let last = output.pop()
                output = output.join(', ') + `${message.translate('Actions/pat:CARINHO_DESC1')}` + last
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
                    // obtem config do sv
                    const settings = (message.guild) ? message.guild.settings : bot.config.defaultSettings;
                    if (Object.keys(settings).length == 0) return;
                    if (member.id === message.member.id) {
                        return
                    } else if (member.id === message.client.user.id) {
                        output.push(message.translate('Actions/pat:CARINHO_Hope1'))
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
            mentions.push(guild.translate('Actions/pat:CARINHO_Hope1'));
        } else {
            if (guild.members.cache.get(args.get('user')?.value)?.user) mentions.push(guild.members.cache.get(args.get('user')?.value)?.user);
        }

        if (guild.members.cache.get(args.get('user2')?.value)?.user === bot.user) {
            mentions.push(guild.translate('Actions/pat:CARINHO_Hope1'));
        } else {
            if (guild.members.cache.get(args.get('user2')?.value)?.user) mentions.push(guild.members.cache.get(args.get('user2')?.value)?.user);
        }

        if (guild.members.cache.get(args.get('user3')?.value)?.user === bot.user) {
            mentions.push(guild.translate('Actions/pat:CARINHO_Hope1'));
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
                    output = output.join(guild.translate('Actions/pat:CARINHO_Hope1'))
                } else if (output.length > 2) {
                    let last = output.pop()
                    output = output.join(', ') + `${guild.translate('Actions/pat:CARINHO_Hope11')}` + `${last}`
                }
                return (output)
            }
            fetch(baseURI).then(res => res.json()).then(json => {
                embed.setImage(uri + json.path)
                if (mentions.length < 1) {
                    embed.setDescription(guild.translate('Actions/pat:CARINHO_DESCRIÇÃO', { member: member }))
                    return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                } else if (mentions.includes(guild.translate('Actions/pat:CARINHO_Hope'))) {
                    embed.setDescription(`${member} ${guild.translate('Actions/pat:CARINHO_DESCRIÇÃO1')} ${stringifyMentionss(mentions)}!`)
                    return interaction.editReply({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 })).then(() => {
                        interaction.editReply({ content: guild.translate('Actions/pat:CARINHO_HopeFRASE') }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                    })
                } else {
                    embed.setDescription(`${member} ${guild.translate('Actions/pat:CARINHO_DESCRIÇÃO1')} ${stringifyMentionss(mentions)}!`)
                    return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                }
            });
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
}