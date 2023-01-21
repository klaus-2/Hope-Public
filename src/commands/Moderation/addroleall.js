// Dependências
const Command = require('../../structures/Command.js'),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType} = require('discord.js'),
    { Embed } = require(`../../utils`);

module.exports = class AddRoleALL extends Command {
    constructor(bot) {
        super(bot, {
            name: 'addroleall',
            aliases: ['arall', 'aroleall', 'giveroleall', 'addcargoall'],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles, Flags.ManageGuild],
            userPermissions: [Flags.ManageGuild],
            description: 'Adds a role to all users of the server at once.',
            usage: '<prefix><commandName> <role>',
            examples: [
                '.addroleall @role',
                '!addroleall roleID'
            ],
            cooldown: 1000,
            slash: false,
            options: [
                {
                    name: 'role',
                    description: 'The role chosen.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0])
            return message.channel
                .error('misc:INCORRECT_FORMAT', {
                    commandExample: message.translate('misc:AJUDA_INFO', {
                        USAGE: settings.prefix.concat(
                            message.translate(`Moderation/${this.help.name}:USAGE`, {
                                EXAMPLE: settings.prefix.concat(
                                    message.translate(`Moderation/${this.help.name}:EXAMPLE`)
                                ),
                            })
                        ),
                    }),
                })
                .then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

        const role = message.guild.roles.cache.find(role => role.name === message.args.join(" ").slice(1)) || message.mentions.roles.first() || message.guild.roles.cache.get(message.args.join(" ").slice(1)) || message.guild.roles.cache.get(message.args[0]);

        if (message.guild.members.me.roles.highest.comparePositionTo(role.id) < 0) {
            return message.channel.error('Moderation/addroleall:ROLE', { role: role.name }).then(m => m.timedDelete({ timeout: 5000 }));
        }

        if (!role) {
            return message.channel.error('Moderation/addroleall:ROLE1').then(m => m.timedDelete({ timeout: 5000 }));
        }

        const wait = require('node:timers/promises').setTimeout;

        const embed = new Embed(bot, message.guild)
            .setColor(65475)
            .setDescription(`Aye! I will add the role (${role}) to all members of this server.\nBut this may take a few minutes (*is normal*), so sit back and enjoy your minutes of work saved by me <:SkyeCarinho2:823273413295734865>`)
            .setAuthor({ name: `HOPE - ADD ROLE ALL`, iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
            .setFooter({ text: `Powered by hopebot.top` })

        message.channel.send({ embeds: [embed] }).then(async (m) => {
            await wait(3000);

            let count = 0;
            let skipped = 0;

            await message.guild.members.fetch();

            message.guild.members.cache.forEach(async (member) => {
                try {
                    if (member._roles.includes(role.id)) return ++skipped + m.edit({ embeds: [embed.setDescription(`**Queue: ${message.guild.memberCount}**\nCurrent position: ${++count}\nRole skipped to ${member} (Reason: already has the role)`)] });
                    await wait(3000).then(member.roles.add(role).then(m.edit({ embeds: [embed.setDescription(`**Queue: ${message.guild.memberCount}**\nCurrent position: ${++count}\nRole added to ${member}`)] })));
                } catch (err) {
                    console.log(err)
                    bot.logger.error(err)
                }
            })
            await wait(3000);
            m.edit({ embeds: [embed.setDescription(`Process completed! ${count - skipped} of ${message.guild.memberCount} users have successfully received the ${role} role!`)] });
        })
    }
};
