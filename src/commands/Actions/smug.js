// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    fetch = require('node-fetch'),
    baseURI = 'https://rra.ram.moe/i/r?type=smug',
    uri = 'https://rra.ram.moe',
    Command = require('../../structures/Command.js');

module.exports = class Smug extends Command {
    constructor(bot) {
        super(bot, {
            name: 'smug',
            dirname: __dirname,
            aliases: ["convencido"],
            description: 'Generate a reaction of being convinced.',
            usage: '<prefix><commandName>',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            cooldown: 3000,
            examples: ['/smug', '.convencido'],
            slash: true,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        fetch(baseURI).then(res => res.json()).then(json => {
            let embed = new Embed(bot, message.guild)
                .setColor(16248815)
                .setImage(uri + json.path)
                .setDescription(message.translate('Actions/smug:CONVENCIDO_DESCRIÇÃO', { member: message.member }))
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        })
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
        const channel = guild.channels.cache.get(interaction.channelId);

        try {
            fetch(baseURI).then(res => res.json()).then(async (json) => {
                const embed = new Embed(bot, guild)
                    .setColor(16248815)
                    .setImage(uri + json.path)
                    .setDescription(guild.translate('Actions/smug:CONVENCIDO_DESCRIÇÃO', { member: member }))

                // Get Interaction Message Data
                await interaction.deferReply();
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            });
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
}