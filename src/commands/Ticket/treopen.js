// Dependências
const Command = require('../../structures/Command.js'),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    { ticketFunçõesSchema, ticketEmbedSchema } = require('../../database/models');

module.exports = class TREOpen extends Command {
    constructor(bot) {
        super(bot, {
            name: 'treopen',
            dirname: __dirname,
            aliases: ['t-reabrir', 'ticket-reopen', 't-reopen', 'ticket-reabrir'],
            userPermissions: [Flags.ManageChannels],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
            description: 'Reopen a ticket.',
            usage: 'ticket-reabrir',
            cooldown: 3000,
            usage: '<prefix><commandName>',
            examples: [
                '/ticket reopen',
                '.treopen',
                '!ticket-reopen',
                '?t-reopen'
            ],
            slashSite: true,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: message.guild.id });
        if (!dbEmbed) {
            const newSettings = new ticketEmbedSchema({
                tembed_sID: message.guild.id
            });
            await newSettings.save().catch(() => { });
            dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: message.guild.id });
        }

        const ticketTrancar = await ticketFunçõesSchema.findOne({
            channelID: message.channel.id,
            guildID: message.guild.id,
        });

        if (!ticketTrancar) return message.channel.error(`Uh-oh! This command does not work on normal channels. Please try again by running this command on a ticket channel.\n**Tip**: Ticket channels start with \`🟢｜ticket-\``).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

        // VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
        let serverCase = ticketTrancar.ticketCase;
        if (!serverCase || serverCase === null) serverCase = '1';
        let chann;
        let id = ticketTrancar.authorID.toString().substr(0, 4) + ticketTrancar.discriminator;
        if (ticketTrancar.ticketNameType == "1") chann = `${id}`;
        if (ticketTrancar.ticketNameType == "2") chann = `${serverCase}`;
        let author = message.guild.members.cache.get(ticketTrancar.authorID);

        const role = message.guild.roles.cache.get(dbEmbed.supportRoleID);
        if (dbEmbed.ticketClose == false) {
            if (role) {
                if (!member.roles.cache.find(r => r.name.toLowerCase() === role.name.toLowerCase())) return message.channel.send({ embeds: [new Embed(bot, message.guild).setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ format: 'png' }) }).setDescription(`:x: Only users with the support team role Can Close this Ticket`).setFooter({ text: 'Powered by hopebot.top' }).setTimestamp().setColor('RED')] });
            }
        };

        // fecha o canal
        if (!message.guild.channels.cache.find(c => c.name == `🟢｜ticket-${chann}`)) {
            message.channel.send({ content: bot.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD14') }).then(m => m.timedDelete({ timeout: 5000 }));
            setTimeout(() => message.channel.send({ content: `${message.author.tag} reopened the ticket-${chann}.` }), 5000);
            setTimeout(() => message.channel.permissionOverwrites.edit(author, {
                SendMessages: true, ViewChannel: true,
            }), 5000), message.channel.edit({ name: `🟢｜ticket-${chann}`, topic: `Ticket Author Information: **ID:** ${ticketTrancar.authorID} | **Tag:** ${ticketTrancar.tag}` }), 5000;
        } else if (message.guild.channels.cache.find(c => c.name == `🟢｜ticket-${chann}`)) {
            return message.channel.error(`Uh-oh! This ticket is already open. To close it, use \`/\`**ticket close**`).then(m => m.timedDelete({ timeout: 10000 }));
        }
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, { settings }) {
        const member = interaction.user,
            channel = guild.channels.cache.get(interaction.channelId);

        let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
        if (!dbEmbed) {
            const newSettings = new ticketEmbedSchema({
                tembed_sID: guild.id
            });
            await newSettings.save().catch(() => { });
            dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
        }

        const ticketTrancar = await ticketFunçõesSchema.findOne({
            channelID: channel.id,
            guildID: guild.id,
        });

        if (!ticketTrancar) return interaction.reply({ embeds: [channel.error(`Uh-oh! This command does not work on normal channels. Please try again by running this command on a ticket channel.\n**Tip**: Ticket channels start with \`:green_circle:｜ticket-\``, {}, true)], ephemeral: true });

        // VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
        let serverCase = ticketTrancar.ticketCase;
        if (!serverCase || serverCase === null) serverCase = '1';
        let chann;
        let id = ticketTrancar.authorID.toString().substr(0, 4) + ticketTrancar.discriminator;
        if (ticketTrancar.ticketNameType == "1") chann = `${id}`;
        if (ticketTrancar.ticketNameType == "2") chann = `${serverCase}`;
        let author = guild.members.cache.get(ticketTrancar.authorID);

        const role = guild.roles.cache.get(dbEmbed.supportRoleID);
        if (dbEmbed.ticketClose == false) {
            if (role) {
                if (!member.roles.cache.find(r => r.name.toLowerCase() === role.name.toLowerCase())) return interaction.reply({ embeds: [new Embed(bot, guild).setAuthor({ name: `${member.tag}`, iconURL: member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }) }).setDescription(`Uh-oh! Sorry, but only users with the support team role can close this Ticket.`).setFooter({ text: 'Powered by hopebot.top' }).setTimestamp()] }).then(m => m.timedDelete({ timeout: 10000 }));
            }
        };

        // fecha o canal
        if (!guild.channels.cache.find(c => c.name == `🟢｜ticket-${chann}`)) {
            interaction.reply({ content: bot.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD14') }).then(m => m.timedDelete({ timeout: 5000 }));
            setTimeout(() => interaction.editReply({ content: `${member.tag} reopened the ticket-${chann}.` }), 5000);
            setTimeout(() => channel.permissionOverwrites.edit(author, {
                SendMessages: true, ViewChannel: true,
            }), 5000), channel.edit({ name: `🟢｜ticket-${chann}`, topic: `Ticket Author Information: **ID:** ${ticketTrancar.authorID} | **Tag:** ${ticketTrancar.tag}` }), 5000;
        } else if (guild.channels.cache.find(c => c.name == `🟢｜ticket-${chann}`)) {
            return interaction.reply({ embeds: [channel.error(`Uh-oh! This ticket is already open. To close it, use \`/\`**ticket close**`, {}, true)], ephemeral: true });
        }
    }
};