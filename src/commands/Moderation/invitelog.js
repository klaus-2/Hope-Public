// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Invitelog extends Command {
    constructor(bot) {
        super(bot, {
            name: 'invitelog',
            dirname: __dirname,
            aliases: ['invites-logs', 'convites-logs', 'invite-tracker', 'invite-info', 'invites-infos', 'cv-log', 'convite-log'],
            userPermissions: [Flags.ManageGuild],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
            description: 'Displays invitation records of a user.',
            usage: '<prefix><commandName> <user>',
            examples: [
                '.invitelog',
                '!invite-tracker @Klaus',
                '?convites-logs @Hope'
            ],
            cooldown: 3000,
            slash: true,
            options: [{
                name: 'user',
                description: 'Choose the target user',
                type: ApplicationCommandOptionType.User,
                required: false,
            }],
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        let member = await message.mentions.members.first() || message.guild.members.cache.get(message.args[0]) || message.guild.members.cache.find(r => r.user.username.toLowerCase() === message.args.join(' ').toLocaleLowerCase()) || message.guild.members.cache.find(r => r.displayName.toLowerCase() === message.args.join(' ').toLocaleLowerCase()) || message.member;

        const guild = bot.guilds.cache.get(message.guild.id);

        let invites = await guild.invites.fetch()

        if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

        if (message.mentions.users.first().bot) {
            return message.channel.send(message.translate('Moderation/invitelog:CONVITE')).then(m => m.timedDelete({ timeout: 10000 }));
        }

        let memberInvites = invites.filter(i => i.inviter && i.inviter.id === member.user.id);

        if (memberInvites.size <= 0) {
            return message.channel.send(`**${member.displayName} ${message.translate('Moderation/invitelog:CONVITE1')}**`, (member === message.member ? null : member)).then(m => m.timedDelete({ timeout: 10000 }));
            { }
        }

        let content = memberInvites.map(i => i.code).join("\n");
        let index = 0;
        memberInvites.forEach(invite => index += invite.uses);

        const embed = new Embed(bot, message.guild)
            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Moderation/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
            .setAuthor({ name: `${message.translate('Moderation/invitelog:CONVITE2')}` })
            .setDescription(`${message.translate('Moderation/invitelog:CONVITE3')} ${member.displayName}`)
            .addFields({ name: `${message.translate('Moderation/invitelog:CONVITE4')}`, value: `${index}`, inline: false },
                { name: `${message.translate('Moderation/invitelog:CONVITE5')}`, value: `${content}`, inline: false });
        message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
        const channel = guild.channels.cache.get(interaction.channelId);

        try {
            // Get Interaction Message Data
            await interaction.deferReply();

            let invites = await guild.invites.fetch();

            if (member.user.bot) return interaction.editReply({ content: ' ', embeds: [channel.error('Moderation/invitelog:CONVITE', {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

            let memberInvites = invites.filter(i => i.inviter && i.inviter.id === member.user.id);

            if (memberInvites.size <= 0) return interaction.editReply({ content: ' ', embeds: [channel.error(`**${member.displayName} ${guild.translate('Moderation/invitelog:CONVITE1')}**`, (member === interaction.user ? null : member), {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

            let content = memberInvites.map(i => i.code).join("\n");
            let index = 0;
            memberInvites.forEach(invite => index += invite.uses);

            const embed = new Embed(bot, guild)
                .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                .setAuthor({ name: `${guild.translate('Moderation/invitelog:CONVITE2')}` })
                .setDescription(`${guild.translate('Moderation/invitelog:CONVITE3')} ${member.displayName}`)
                .addFields({ name: `${guild.translate('Moderation/invitelog:CONVITE4')}`, value: `${index}`, inline: false },
                    { name: `${guild.translate('Moderation/invitelog:CONVITE5')}`, value: `${content}`, inline: false });
            interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
};