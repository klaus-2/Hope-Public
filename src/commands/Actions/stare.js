// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
    fetch = require('node-fetch'),
    baseURI = 'https://rra.ram.moe/i/r?type=stare',
    uri = 'https://rra.ram.moe',
    Command = require('../../structures/Command.js');

module.exports = class Stare extends Command {
    constructor(bot) {
        super(bot, {
            name: 'stare',
            dirname: __dirname,
            aliases: ["olhar", "glare"],
            description: 'Face the user you mentioned!',
            usage: '<prefix><commandName> <user>',
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            cooldown: 3000,
            examples: ['/stare', '.stare @Hope'],
            slash: true,
            options: [{
                name: 'user',
                description: 'Choose the target user',
                type: ApplicationCommandOptionType.User,
                required: true,
            }],
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        if (message.mentions.users.size < 1) return message.channel.send(message.translate('Actions/stare:OLHAR_DESCRIÇÃO')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        if (message.mentions.users.first().id === message.client.user.id) return message.channel.send(message.translate('Actions/stare:OLHAR_DESCRIÇÃO1')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        if (message.mentions.users.first().id === message.author.id) return message.channel.send(message.translate('Actions/stare:OLHAR_DESCRIÇÃO2')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

        fetch(baseURI).then(res => res.json()).then(json => {
            let embed = new Embed(bot, message.guild).setColor(16248815)
                .setImage(uri + json.path)
                .setDescription(`${message.member} ${message.translate('Actions/stare:OLHAR_DESCRIÇÃO3')} ${message.mentions.users.first()}`)
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        })
    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
        const channel = guild.channels.cache.get(interaction.channelId);

        try {
            // Get Interaction Message Data
            await interaction.deferReply();

            if (!args.get('user')) return interaction.editReply(guild.translate('Actions/stare:OLHAR_DESCRIÇÃO')).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            if (member.id === bot.user.id) return interaction.editReply(guild.translate('Actions/stare:OLHAR_DESCRIÇÃO1')).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            if (member.id === interaction.user.id) return interaction.editReply(guild.translate('Actions/stare:OLHAR_DESCRIÇÃO2')).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

            fetch(baseURI).then(res => res.json()).then(json => {
                let embed = new Embed(bot, guild)
                    .setColor(16248815)
                    .setImage(uri + json.path)
                    .setDescription(`${interaction.user} ${guild.translate('Actions/stare:OLHAR_DESCRIÇÃO3')} ${member}`)
                return interaction.editReply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            });
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
}