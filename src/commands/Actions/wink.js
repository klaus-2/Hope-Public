// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
    actions = require(`${process.cwd()}/assets/json/actions.json`),
    Command = require('../../structures/Command.js');

module.exports = class Wink extends Command {
    constructor(bot) {
        super(bot, {
            name: 'wink',
            dirname: __dirname,
            aliases: ['piscar'],
            description: 'Blinks for a user.',
            usage: '<prefix><commandName> <user>',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            cooldown: 3000,
            examples: ['/wink', '.piscar @Klaus'],
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
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        // Filtre args para que todos args sejam apenas formatos de menção de usuário.
        message.args = message.args.filter(x => /<@!?\d{17,19}>/.test(x))

        const url = `https://i.imgur.com/${actions.wink[Math.floor(Math.random() * (actions.wink.length - 1))]}.gif`;
        const blush = `https://i.imgur.com/${actions.blush[Math.floor(Math.random() * (actions.blush.length - 1))]}.gif`;

        //const url = 'bot.images.baka()';
        const embed = new Embed(bot, message.guild)
            .setColor(16248815)
            .setImage(url)

        if ((message.guild && !message.mentions.members.size) || !message.args[0]) {
            embed.setDescription(message.translate('Actions/wink:PISCAR_DESCRIÇÃO', { author: message.author }))
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

        } else if (new RegExp(`<@!?${bot.user.id}>`).test(message.args[0])) {
            embed.setImage(blush).setDescription(`${message.author} baka`)
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

        } else if (new RegExp(`<@!?${message.author.id}>`).test(message.args[0])) {
            embed.setDescription(message.translate('Actions/wink:PISCAR_DESCRIÇÃO', { author: message.author }))
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

        } else {
            embed.setDescription(`${message.author} ${message.translate('Actions/wink:PISCAR_DESCRIÇÃO1')} ${message.args[0]}!`)
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        };
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
        const channel = guild.channels.cache.get(interaction.channelId);

        const url = `https://i.imgur.com/${actions.wink[Math.floor(Math.random() * (actions.wink.length - 1))]}.gif`;
        const blush = `https://i.imgur.com/${actions.blush[Math.floor(Math.random() * (actions.blush.length - 1))]}.gif`;

        const embed = new Embed(bot, guild)
        .setColor(16248815)
        .setImage(url)

        try {
            // Get Interaction Message Data
            await interaction.deferReply();

            if (!args.get('user')) {
                embed.setDescription(guild.translate('Actions/wink:PISCAR_DESCRIÇÃO', { author: interaction.user }))
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    
            } else if (new RegExp(`<@!?${bot.user.id}>`).test(member)) {
                embed.setImage(blush).setDescription(`${interaction.user} baka`)
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    
            } else if (new RegExp(`<@!?${interaction.user.id}>`).test(member)) {
                embed.setDescription(guild.translate('Actions/wink:PISCAR_DESCRIÇÃO', { author: interaction.user }))
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    
            } else {
                embed.setDescription(`${interaction.user} ${guild.translate('Actions/wink:PISCAR_DESCRIÇÃO1')} ${member}!`)
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            };
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
};