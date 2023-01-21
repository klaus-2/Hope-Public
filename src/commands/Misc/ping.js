// Dependências
const { EmbedBuilder } = require("discord.js"),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    { Embed } = require(`../../utils`),
    { duration } = require('moment'),
    { fetch } = require('undici'),
    Command = require('../../structures/Command.js');

module.exports = class Ping extends Command {
    constructor(bot) {
        super(bot, {
            name: 'ping',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Get Hope\'s life status.',
            usage: '<prefix><commandName>',
            examples: [
                '.ping'
            ],
            cooldown: 5000,
            slash: false,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        const prompt = await message.channel.send(message.translate('Misc/ping:ESTATUS_DESC'));

        //#1
        const CheckTime1 = process.hrtime();
        await fetch(`http://127.0.0.1:5000/version`, { method: 'GET', headers: { Authorization: "password" } }).catch(err => err);
        const PassTime1 = process.hrtime(CheckTime1);
        const Node01 = Math.round(((PassTime1[0] * 1e9) + PassTime1[1]) / 1e6);

        //#2
        const CheckTime2 = process.hrtime();
        await fetch(`http://127.0.0.1:4002/version`, { method: 'GET', headers: { Authorization: "password" } }).catch(err => err);
        const PassTime2 = process.hrtime(CheckTime2);
        const Node02 = Math.round(((PassTime2[0] * 1e9) + PassTime2[1]) / 1e6);

        //#3
        const CheckTime3 = process.hrtime();
        await fetch(`http://127.0.0.1:80/version`, { method: 'GET', headers: { Authorization: "password" } }).catch(err => err);
        const PassTime3 = process.hrtime(CheckTime3);
        const Node03 = Math.round(((PassTime3[0] * 1e9) + PassTime3[1]) / 1e6);

        const embed = new EmbedBuilder()
            .setColor(16775424)
            .setAuthor({ name: message.translate('Misc/ping:ESTATUS_DESC1'), iconURL: bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
            .addFields([
                {
                    name: '\u200b', inline: true,
                    value: [
                        `╭═${message.translate('Misc/ping:ESTATUS_DESC5')}`,
                        `${colors(Math.round(bot.ws.ping))}\u2000\u2000`,
                        `╰═══\`     ${Math.round(bot.ws.ping)}ms\``
                    ].join('\n'), inline: true,
                },
                {
                    name: '\u200b', inline: true,
                    value: [
                        `╭═${message.translate('Misc/ping:ESTATUS_DESC7')}`,
                        `${colors(Math.abs(prompt.createdTimestamp - message.createdTimestamp))}\u2000\u2000`,
                        `╰═══\`     ${Math.abs(prompt.createdTimestamp - message.createdTimestamp)}ms\``
                    ].join('\n'), inline: true,
                },
                {
                    name: '\u200b', inline: true,
                    value: [
                        `╭═${message.translate('Misc/ping:ESTATUS_DESC9')}`,
                        `${colors(Math.round(await bot.mongoose.ping()))}\u2000\u2000`,
                        `╰═══\`     ${Math.round(await bot.mongoose.ping())}ms\``
                    ].join('\n'), inline: true,
                }, {
                    name: '\u200b', inline: true,
                    value: [
                        `╭═<:lavalink:875046353292652604> **HopeDJ #Node01**`,
                        `${colors(Node01)}\u2000\u2000`,
                        `╰═══\`     ${Node01}ms\``
                    ].join('\n'), inline: true,
                }, {
                    name: '\u200b', inline: true,
                    value: [
                        `╭═<:lavalink:875046353292652604> **HopeDJ #Node02**`,
                        `${colors(Node02)}\u2000\u2000`,
                        `╰═══\`     ${Node02}ms\``
                    ].join('\n'), inline: true,
                }, {
                    name: '\u200b', inline: true,
                    value: [
                        `╭═<:lavalink:875046353292652604> **HopeDJ #Node03**`,
                        `${colors(Node03)}\u2000\u2000`,
                        `╰═══\`     ${Node03}ms\``
                    ].join('\n'), inline: true,
                }, { value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', name: '\u200b' }, {
                    name: message.translate('Misc/ping:ESTATUS_DESC10'), value: [
                        message.translate('Misc/ping:ESTATUS_DESC11'),
                        message.translate('Misc/ping:ESTATUS_DESC12'),
                        message.translate('Misc/ping:ESTATUS_DESC13'),
                        message.translate('Misc/ping:ESTATUS_DESC21')
                    ].join('\n'), inline: true,
                }
            ])
            .addFields({ name: '\u200b', value: `*“${response()}”*`, inline: false })
            .setTimestamp()
            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })

        prompt.delete()
        message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 }))
        function response() {
            const responses = [
                message.translate('Misc/ping:ESTATUS_DESC14'),
                message.translate('Misc/ping:ESTATUS_DESC15'),
                message.translate('Misc/ping:ESTATUS_DESC16'),
                message.translate('Misc/ping:ESTATUS_DESC17'),
                message.translate('Misc/ping:ESTATUS_DESC18'),
                message.translate('Misc/ping:ESTATUS_DESC19'),
                message.translate('Misc/ping:ESTATUS_DESC20')
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        };
    }

    /**
       * Function for receiving interaction.
       * @param {bot} bot The instantiating client
       * @param {interaction} interaction The interaction that ran the command
       * @param {guild} guild The guild the interaction ran in
       * @readonly
    */
    async callback(bot, interaction, guild) {
        await interaction.reply(guild.translate('misc/status:PONG'));

        const embed = new Embed(bot, guild)
            .addField(bot.translate('misc/status:PING'), `\`${(await interaction.fetchReply()).createdTimestamp - interaction.createdTimestamp}ms\``, true)
            .addField(guild.translate('misc/status:CLIENT'), `\`${Math.round(bot.ws.ping)}ms\``, true)
            .addField(guild.translate('misc/status:MONGO'), `\`${Math.round(await bot.mongoose.ping())}ms\``, true)
            .setTimestamp();
        await interaction.editReply({ content: '‎', embeds: [embed] });
    }
};

function colors(num) {
    num = parseInt(num);
    if (isNaN(num)) {
        return '<:barralimpa:827591386156367954>'.repeat(5)
    };
    const emojis = [
        '<:lvl1barrra:827591386521665566>',
        '<:lvl2bar:827591386546962432>',
        '<:lvl3barrra:827591386562953236>',
        '<:lvl4ba:827591386429784064>',
        '<:level5barra:827591385992658995>'
    ];
    const limits = [1500, 1250, 750, 500, 250];
    return emojis.map((_, i) => {
        if (i === 0) {
            return _;
        } else if (num < limits[i]) {
            return _;
        } else return '<:barralimpa:827591386156367954>';
    }).join('')
};

function stylize(ping) {
    if (typeof ping === 'number') {
        ping = ping + ' ms'
    } else {
        ping = ping
    };
    return `\`${' '.repeat(11 - ping.length)}${ping}\``
};