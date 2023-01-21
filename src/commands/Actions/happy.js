// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    actions = require(`${process.cwd()}/assets/json/actions.json`),
    Command = require('../../structures/Command.js');

module.exports = class Happy extends Command {
    constructor(bot) {
        super(bot, {
            name: 'happy',
            dirname: __dirname,
            aliases: ['feliz'],
            description: 'Expresses a happy reaction.',
            usage: '<prefix><commandName>',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            cooldown: 3000,
            examples: ['/happy', '.feliz'],
            slash: true,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        const embed = new Embed(bot, message.guild)
            .setColor(16248815)
            .setDescription(message.translate('Actions/happy:FELIZ_DESCRIÇÃO', { author: message.author }))
            .setImage(`https://i.imgur.com/${actions.happy[Math.floor(Math.random() * (actions.happy.length - 1))]}.gif`)
        return message.channel.send(
            ({ embeds: [embed] }))
            .then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
        const channel = guild.channels.cache.get(interaction.channelId);

        const embed = new Embed(bot, guild)
            .setColor(16248815)
            .setDescription(guild.translate('Actions/happy:FELIZ_DESCRIÇÃO', { author: member }))
            .setImage(`https://i.imgur.com/${actions.happy[Math.floor(Math.random() * (actions.happy.length - 1))]}.gif`)

        try {
            // Get Interaction Message Data
            await interaction.deferReply();
            return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
};