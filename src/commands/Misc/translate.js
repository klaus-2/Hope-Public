// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');
const translate = require('@vitalets/google-translate-api');

/*
    'auto': 'Automatic',
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'am': 'Amharic',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'eu': 'Basque',
    'be': 'Belarusian',
    'bn': 'Bengali',
    'bs': 'Bosnian',
    'bg': 'Bulgarian',
    'ca': 'Catalan',
    'ceb': 'Cebuano',
    'ny': 'Chichewa',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'co': 'Corsican',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'nl': 'Dutch',
    'en': 'English',
    'eo': 'Esperanto',
    'et': 'Estonian',
    'tl': 'Filipino',
    'fi': 'Finnish',
    'fr': 'French',
    'fy': 'Frisian',
    'gl': 'Galician',
    'ka': 'Georgian',
    'de': 'German',
    'el': 'Greek',
    'gu': 'Gujarati',
    'ht': 'Haitian Creole',
    'ha': 'Hausa',
    'haw': 'Hawaiian',
    'he': 'Hebrew',
    'iw': 'Hebrew',
    'hi': 'Hindi',
    'hmn': 'Hmong',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'ig': 'Igbo',
    'id': 'Indonesian',
    'ga': 'Irish',
    'it': 'Italian',
    'ja': 'Japanese',
    'jw': 'Javanese',
    'kn': 'Kannada',
    'kk': 'Kazakh',
    'km': 'Khmer',
    'ko': 'Korean',
    'ku': 'Kurdish (Kurmanji)',
    'ky': 'Kyrgyz',
    'lo': 'Lao',
    'la': 'Latin',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'lb': 'Luxembourgish',
    'mk': 'Macedonian',
    'mg': 'Malagasy',
    'ms': 'Malay',
    'ml': 'Malayalam',
    'mt': 'Maltese',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mn': 'Mongolian',
    'my': 'Myanmar (Burmese)',
    'ne': 'Nepali',
    'no': 'Norwegian',
    'ps': 'Pashto',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'pa': 'Punjabi',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sm': 'Samoan',
    'gd': 'Scots Gaelic',
    'sr': 'Serbian',
    'st': 'Sesotho',
    'sn': 'Shona',
    'sd': 'Sindhi',
    'si': 'Sinhala',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'so': 'Somali',
    'es': 'Spanish',
    'su': 'Sundanese',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'tg': 'Tajik',
    'ta': 'Tamil',
    'te': 'Telugu',
    'th': 'Thai',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'uz': 'Uzbek',
    'vi': 'Vietnamese',
    'cy': 'Welsh',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'zu': 'Zulu'
    */

module.exports = class Translate extends Command {
    constructor(bot) {
        super(bot, {
            name: 'translate',
            dirname: __dirname,
            aliases: ['tradutor', 'traduzir'],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Translate your sentence into any language! For a list, use .translate languages.',
            usage: '<prefix><commandName> <lang> <text>',
            examples: [
                '.translate bg Hello',
                '.translate pt Hello'
            ],
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0]) {
            return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        }

        if (!message.args[1]) {
            const embed = new Embed(bot, message.guild)
                .setTitle('Misc/translate:ETRA_DESC')
                .setDescription(message.translate('Misc/translate:ETRA_DESC1', { prefix: settings.prefix }))
                .setTimestamp()
            return message.channel.send({ embeds: [embed] })
        }


        if (message.args[0] === "idiomas" || message.args[0] === "languages") {
            const embed = new Embed(bot, message.guild)
                .setTitle('Misc/translate:ETRA_DESC')
                .setDescription(message.translate('Misc/translate:ETRA_DESC1', { prefix: settings.prefix }))
                .setTimestamp()
            return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        }

        if (message.args[0] === "bg") {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "bg" }).then(res => {

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇧🇬 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()

                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'pl') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "pl" }).then(res => { //🇵🇱

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇵🇱 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'nl') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "nl" }).then(res => { //🇳🇱

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇳🇱 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'da') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "da" }).then(res => { //🇩🇰

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇩🇰 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'de') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "de" }).then(res => { //🇩🇪

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇩🇪 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'it') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "it" }).then(res => { //🇮🇹

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇮🇹 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'ru') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "ru" }).then(res => { //🇷🇺

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇷🇺 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'es') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "es" }).then(res => { //🇪🇸

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇪🇸 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'tr') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "tr" }).then(res => { //🇹🇷

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇹🇷 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }

        if (message.args[0] === 'fr') {
            translate(message.args.slice(1).join(" "), { from: "auto", to: "fr" }).then(res => { //🇫🇷

                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.translate('Misc/translate:ETRA_DESC2', { user: bot.user.username }), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setDescription(`${message.translate('Misc/translate:ETRA_DESC3')} \`\`\`${message.args.slice(1).join(' ')}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC4')} 🇫🇷 ${message.translate('Misc/translate:ETRA_DESC5')} \n\`\`\`${res.text}\`\`\`\n${message.translate('Misc/translate:ETRA_DESC6')}`)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                return
            })
        }
    }
}