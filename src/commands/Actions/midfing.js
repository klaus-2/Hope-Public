// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
    actions = require(`${process.cwd()}/assets/json/actions.json`),
    Command = require('../../structures/Command.js');

module.exports = class Midfing extends Command {
    constructor(bot) {
        super(bot, {
            name: 'midfing',
            dirname: __dirname,
            aliases: ['tnc'],
            nsfw: true,
            description: 'Show the middle finger to a user.',
            usage: '<prefix><commandName> <user>',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            cooldown: 3000,
            examples: ['/midfing', '.tnc @Klaus'],
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

        const midfing = `https://i.imgur.com/${actions.midfing[Math.floor(Math.random() * (actions.midfing.length - 1))]}.gif`;
        const baka = `https://i.imgur.com/${actions.baka[Math.floor(Math.random() * (actions.baka.length - 1))]}.gif`;

        //const url = 'bot.images.baka()';
        const embed = new Embed(bot, message.guild)
            .setColor(16248815)

        if (!message.mentions.members.size) {
            embed.setImage(midfing)
            message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

        } else if (new RegExp(`<@!?${bot.user.id}>`).test(message.args[0])) {
            embed.setImage(baka)
            embed.setDescription(`${message.author.toString()}`)
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

        } else {
            embed.setDescription(`${message.member.displayName}: "${message.translate('Actions/midfing:TNC_DESCRIÇÃO')} ${message.args[0]}!"`).setImage(midfing)
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        };
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
        const channel = guild.channels.cache.get(interaction.channelId);

        const midfing = `https://i.imgur.com/${actions.midfing[Math.floor(Math.random() * (actions.midfing.length - 1))]}.gif`;
        const baka = `https://i.imgur.com/${actions.baka[Math.floor(Math.random() * (actions.baka.length - 1))]}.gif`;

        //const url = 'bot.images.baka()';
        const embed = new Embed(bot, guild)
            .setColor(16248815)

        try {
            // Get Interaction Message Data
            await interaction.deferReply();

            if (!args.get('user')) {
                embed.setImage(midfing)
                interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            } else if (new RegExp(`<@!?${bot.user.id}>`).test(member)) {
                embed.setImage(baka)
                embed.setDescription(`${interaction.user}`)
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            } else {
                embed.setDescription(`${interaction.user}: "${guild.translate('Actions/midfing:TNC_DESCRIÇÃO')} ${member}!"`)
                embed.setImage(midfing)
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            };
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
};