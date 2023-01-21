// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    actions = require(`${process.cwd()}/assets/json/actions.json`),
    Command = require('../../structures/Command.js');

module.exports = class Disgust extends Command {
    constructor(bot) {
        super(bot, {
            name: 'disgust',
            dirname: __dirname,
            aliases: ['desgosto', 'eww', 'yuck'],
            description: 'Express a reaction of disgust.',
            usage: '<prefix><commandName>',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            cooldown: 3000,
            examples: ['/disgust', '.disgust', '!eww', '?yuck'],
            slash: true,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        const embed = new Embed(bot, message.guild)
            .setColor(16248815)
            .setImage(`https://i.imgur.com/${actions.disgust[Math.floor(Math.random() * (actions.disgust.length - 1))]}.gif`)
        return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
        const channel = guild.channels.cache.get(interaction.channelId);

        const embed = new Embed(bot, guild)
        .setColor(16248815)
        .setImage(`https://i.imgur.com/${actions.disgust[Math.floor(Math.random() * (actions.disgust.length - 1))]}.gif`)

        try {
            // Get Interaction Message Data
            await interaction.deferReply();
            return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
}