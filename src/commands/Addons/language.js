// Dependências
const { Embed } = require(`../../utils`),
    { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Language extends Command {
    constructor(bot) {
        super(bot, {
            name: 'language',
            dirname: __dirname,
            aliases: ['lang', 'idioma', 'set-lang'],
            userPermissions: [Flags.ManageGuild],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Choose the language for Hope.',
            usage: '<prefix><commandName> [lang]',
            cooldown: 5000,
            examples: ['/language', '.lang', '?idioma'],
            slash: true,
            options: [{
                name: 'lang',
                description: 'Update server\'s language to',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [...bot.languages.map(lan => ({ name: lan.nativeName, value: lan.name }))].slice(0, 24),
            }],
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        const chan = message.channel;
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('idiomas')
                    .setPlaceholder(message.translate('Addons/language:IDIOMA1'))
                    .addOptions([
                        {
                            label: 'English',
                            description: message.translate('Addons/language:IDIOMA2'),
                            value: 'en',
                            emoji: '<:unitedstatesofamerica:841845763641704498>'
                        },
                        {
                            label: 'Portuguese, Brazilian',
                            description: message.translate('Addons/language:IDIOMA3'),
                            value: 'br',
                            emoji: '<:brazil:841845763536715837>'
                        },
                        {
                            label: 'French',
                            description: message.translate('Addons/language:IDIOMAFR'),
                            value: 'fr',
                            emoji: '<:france:841845763167354922>'
                        },
                        {
                            label: 'Thai',
                            description: message.translate('Addons/language:IDIOMATH'),
                            value: 'th',
                            emoji: '<:thailand:900783686075707463>'
                        },
                        {
                            label: 'Italian',
                            description: message.translate('Addons/language:IDIOMAIT'),
                            value: 'it',
                            emoji: '<:italy:841845763255828541>'
                        },
                        {
                            label: 'German',
                            description: message.translate('Addons/language:IDIOMADE'),
                            value: 'de',
                            emoji: '<:germany:841845763037462559>'
                        },
                        {
                            label: 'Spanish, Spain',
                            description: message.translate('Addons/language:IDIOMAES'),
                            value: 'es',
                            emoji: '<:spain:902736062978347078>'
                        },
                        {
                            label: 'Russian',
                            description: message.translate('Addons/language:IDIOMARU'),
                            value: 'ru',
                            emoji: '<:russia:841845763273261056>'
                        },
                        {
                            label: 'Chinese Simplified',
                            description: message.translate('Addons/language:IDIOMACN'),
                            value: 'cn',
                            emoji: '<:china:841845763121741830>'
                        },
                        {
                            label: 'Korean',
                            description: message.translate('Addons/language:IDIOMAKO'),
                            value: 'ko',
                            emoji: '<:southkorea:841845763687579658>'
                        },
                        {
                            label: 'Polish',
                            description: message.translate('Addons/language:IDIOMAPL'),
                            value: 'pl',
                            emoji: '<:poland:841845763457286144>'
                        },
                        {
                            label: 'Japanese',
                            description: message.translate('Addons/language:IDIOMAJA'),
                            value: 'ja',
                            emoji: '<:japan:841845763360292904>'
                        },
                        {
                            label: 'Dutch',
                            description: message.translate('Addons/language:IDIOMANL'),
                            value: 'nl',
                            emoji: '<:luxembourg:841845763202089040>'
                        },
                    ]),
            );
        const roww = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('fechar_idioma')
                    .setLabel(message.translate('Addons/language:IDIOMA4'))
                    .setStyle(ButtonStyle.Danger)
            );
        const rowww = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('fechar_idiomaa')
                    .setLabel(message.translate('Addons/language:IDIOMA4'))
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
            );
        const embed = new Embed(bot, message.guild)
            .setColor('#fd003a')
            .setDescription(message.translate('Addons/language:IDIOMA', { config: bot.config.SupportServer.link }))
        // If no channels, it will dm the owner.
        const editthis = await chan.send({ embeds: [embed], components: [row, roww] });

        //Create collector
        const filter = i => i.message.id === editthis.id;

        const collector = chan.createMessageComponentCollector({ filter, time: 150000 });
        let value;
        collector.on('collect', async i => {
            if (i.values) {
                value = i.values[0];
                i.deferUpdate();
            } else {
                value = null
                i.deferUpdate();
            }
            if (value === 'en') {
                const language = bot.languages.find((l) => l.name === "English" || l.aliases.includes("en"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'br') {
                const language = bot.languages.find((l) => l.name === "Portuguese" || l.aliases.includes("pt"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'fr') {
                const language = bot.languages.find((l) => l.name === "French" || l.aliases.includes("fr"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'th') {
                const language = bot.languages.find((l) => l.name === "Thai" || l.aliases.includes("th"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'it') {
                const language = bot.languages.find((l) => l.name === "Italian" || l.aliases.includes("it"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'de') {
                const language = bot.languages.find((l) => l.name === "German" || l.aliases.includes("de"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'es') {
                const language = bot.languages.find((l) => l.name === "Spanish" || l.aliases.includes("es"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'ru') {
                const language = bot.languages.find((l) => l.name === "Russian" || l.aliases.includes("ru"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'cn') {
                const language = bot.languages.find((l) => l.name === "Simplified_Chinese" || l.aliases.includes("cn"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'ko') {
                const language = bot.languages.find((l) => l.name === "Korean" || l.aliases.includes("ko"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'pl') {
                const language = bot.languages.find((l) => l.name === "Polish" || l.aliases.includes("pl"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'ja') {
                const language = bot.languages.find((l) => l.name === "Japanese" || l.aliases.includes("ja"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (value === 'nl') {
                const language = bot.languages.find((l) => l.name === "Dutch" || l.aliases.includes("nl"));
                await message.guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return message.channel.success('misc:LANGUAGE_SET', { language: language.nativeName }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            } else if (i?.customId === 'fechar_idioma') {
                editthis.delete().catch(() => { });
            }
            //i.deferUpdate();
        });
        collector.on('end', collected => {
            editthis.edit({ embeds: [embed.setDescription(message.translate('Addons/language:IDIOMA5'))], components: [] })
        });

    }
    // EXEC - SLASH
    async callback(bot, interaction, guild, args) {
        const member = interaction.user.id,
            channel = guild.channels.cache.get(interaction.channelId),
            lang = args.get('lang').value;

        try {
            // Get Interaction Message Data
            await interaction.deferReply();

            if (lang) {
                const language = bot.languages.find((l) => l.name === lang);
                await guild.updateGuild({ Language: language.name });
                //settings.Language = language.name;
                return interaction.editReply({ embeds: [channel.success('misc:LANGUAGE_SET', { language: language.nativeName }, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            }
        } catch (error) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
            return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
        }
    }
};