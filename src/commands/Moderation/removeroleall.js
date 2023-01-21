// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class RemoveRoleALL extends Command {
    constructor(bot) {
        super(bot, {
            name: 'removeroleall',
            aliases: ["rrall", "rroleall", "takeroleall"],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles, Flags.ManageGuild],
            userPermissions: [Flags.ManageGuild],
            description: 'Removes a role from all users of the server at once.',
            usage: '<prefix><commandName> <role>',
            examples: [
                '.removeroleall @role',
                '!rrall @role',
                '?takeroleall @role'
            ],
            cooldown: 60000,
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

        const [key, ...value] = message.args;

        switch (key) {
            case "bot":
                {
                    const role =
                        message.guild.roles.cache.find(
                            role => role.name === message.args.join(" ").slice(2)
                        ) ||
                        message.mentions.roles.first() ||
                        message.guild.roles.cache.get(message.args.join(" ").slice(2));

                    if (message.guild.members.me.roles.highest.comparePositionTo(role) < 0) {
                        return message.channel.error('Moderation/addroleall:ROLE', { role: role.name })
                            .then(m => m.timedDelete({ timeout: 5000 }));
                    }

                    /*if (message.member.roles.highest.comparePositionTo(role) < 0) {
                        return message.channel.send(
                            `Your role must be higher than **${role.name}** role!`
                        );
                    }*/

                    if (!role) {
                        return message.channel
                            .error('Moderation/addroleall:ROLE1')
                            .then(m => m.timedDelete({ timeout: 5000 }));
                    }

                    message.guild.bot.cache.forEach(member => member.roles.add(role));

                    message.channel.success('Moderation/removeroleall:ROLE', { role: role.name })
                        .then(m => m.timedDelete({ timeout: 5000 }));
                }
                break;
            case "member": {
                const role =
                    message.guild.roles.cache.find(
                        role => role.name === message.args.join(" ").slice(2)
                    ) ||
                    message.mentions.roles.first() ||
                    message.guild.roles.cache.get(message.args.join(" ").slice(2));

                if (message.guild.members.me.roles.highest.comparePositionTo(role) < 0) {
                    return message.channel
                        .error('Moderation/addroleall:ROLE', { role: role.name })
                        .then(m => m.timedDelete({ timeout: 5000 }));
                }

                /*if (message.member.roles.highest.comparePositionTo(role) < 0) {
                    return message.channel.send(
                        `Your role must be higher than **${role.name}** role!`
                    );
                }*/

                if (!role) {
                    return message.channel
                        .error('Moderation/addroleall:ROLE1')
                        .then(m => m.timedDelete({ timeout: 5000 }));
                }

                message.guild.members.cache.forEach(member => member.roles.add(role));

                message.channel.success('Moderation/removeroleall:ROLE1', { role: role.name })
                    .then(m => m.timedDelete({ timeout: 5000 }));
            }
        }

        const role =
            message.guild.roles.cache.find(
                role => role.name === message.args.join(" ").slice(1)
            ) ||
            message.mentions.roles.first() ||
            message.guild.roles.cache.get(message.args.join(" ").slice(1));

        if (message.guild.members.me.roles.highest.comparePositionTo(role) < 0) {
            return message.channel
                .error('Moderation/addroleall:ROLE', { role: role.name })
                .then(m => m.timedDelete({ timeout: 5000 }));
        }

        /*if (message.member.roles.highest.comparePositionTo(role) < 0) {
            return message.channel.send(
                `Your role must be higher than **${role.name}** role!`
            );
        }*/

        if (!role) return message.channel.error('Moderation/addroleall:ROLE1').then(m => m.timedDelete({ timeout: 5000 }));

        const wait = require('node:timers/promises').setTimeout;

        const embed = new Embed(bot, message.guild)
            .setColor(65475)
            .setDescription(`Aye! I will remove the role (${role}) to all members of this server.\nBut this may take a few minutes (*is normal*), so sit back and enjoy your minutes of work saved by me <:SkyeCarinho2:823273413295734865>`)
            .setAuthor({ name: `HOPE - REMOVE ROLE ALL`, iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
            .setFooter({ text: `Powered by hopebot.top` })

        message.channel.send({ embeds: [embed] }).then(async (m) => {
            await wait(3000);

            let count = 0;
            let skipped = 0;

            await message.guild.members.fetch();

            message.guild.members.cache.forEach(async (member) => {
                // member._roles.length > 0 && 
                try {
                    if (!member._roles?.includes(role.id)) return ++skipped + m.edit({ embeds: [embed.setDescription(`**Queue: ${message.guild.memberCount}**\nCurrent position: ${++count}\nRole skipped to ${member} (Reason: does not have the role)`)] });
                    await wait(3000).then(member.roles.remove(role).then(m.edit({ embeds: [embed.setDescription(`**Queue: ${message.guild.memberCount}**\nCurrent position: ${++count}\nRole removed to ${member}`)] })));
                } catch (err) {
                    console.log(err)
                    bot.logger.error(err)
                }
            })
            await wait(3000);
            m.edit({ embeds: [embed.setDescription(`Process completed! ${count - skipped} of ${message.guild.memberCount} users have successfully removed the ${role} role!`)] });
        })
    }
};