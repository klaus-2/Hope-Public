// Dependências
const { Embed, func: { genInviteLink } } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    moment = require('moment'),
    { version: discord_version } = require('discord.js'),
    botModel = require(`../../database/models/bot.js`),
    text = require(`../../utils/string`),
    os = require('os'),
    osu = require('node-os-utils'),
    { release, cpus } = require('os'),
    Command = require('../../structures/Command.js');

module.exports = class Botinfo extends Command {
    constructor(bot) {
        super(bot, {
            name: 'botinfo',
            aliases: ['stats', 'about', 'sobremim', 'status', 'bio', 'info', 'bot-info', 'info-bot'],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Displays information about Hope.',
            usage: '<prefix><commandName>',
            examples: [
                '.status',
                '!about',
                '?stats',
                '>sobremim'
            ],
            cooldown: 10000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (message.deletable) message.delete({ timeout: 90000 });

        // Se conecta a Database pelo ID do usuario
        const botm = await botModel.findOne({
            name: "Andoi",
        });

       // const core = os.cpus()[0];

       // const { heapUsed, heapTotal } = process.memoryUsage();

        const top_command = '4214' // bot.commandsUsed;
        // .sort((A,B) => B.used - A.used).first();

        function round(amount, digit = 1000) {
            // for rounding decimals, use Math.round
            return (amount / digit) > 1 ? `${text.commatize(Math.round(amount / digit) * digit)}+` : `< ${text.commatize(digit)}`;
        }

        const config = { fullBar: '█', emptyBar: '░', barPrecision: 8 };

        let cpuUsage;
        const mem = process.memoryUsage();

        const calculations = { freeRAM: os.freemem(), usedRAM: os.totalmem() - os.freemem() };

        const barGeneration = (used, free) => {
            const total = used + free;
            used = Math.round((used / total) * config.barPrecision);
            free = Math.round((free / total) * config.barPrecision);
            return config.fullBar.repeat(used) + config.emptyBar.repeat(free);
        };

        const p1 = osu.cpu.usage().then(cpuPercentage => {
            cpuUsage = cpuPercentage;
        });

        await Promise.all([p1]);

        const embed = new Embed(bot, message.guild)
            // .setAuthor({ name: `${bot.user.tag} Information`, iconURL: bot.user.displayAvatarURL() })
            .setTitle(`<:www:1013212445348728972>\u2000${bot.user.tag} Information`)
            // .setURL(bot.config.websiteURL)
            .setColor(12118406)
            // .setThumbnail(bot.user.displayAvatarURL())
            // .setDescription(`${message.translate('Events/message:MESSAGE1', { data: moment(bot.user.createdAt).format('lll'), owner: bot.config.ownerName })}`)
            .addFields([
                { value: '━━━━━━━━━━━━━━━━━━━━━━━━━━', name: '\u200b' }, {
                    name: message.translate('Events/message:MENSAGEM1'), value: [
                        `${message.translate('Events/message:MENSAGEM2')}\u2000\u2000**${bot.messagesSent} ${message.translate('Events/message:MENSAGEM3')}\n ${(bot.messagesSent / (bot.uptime / 1000)).toFixed(2)} ${message.translate('Events/message:MENSAGEM4')}**`,
                        `${message.translate('Events/message:MENSAGEM5')}\u2000\u2000**${bot.channels.cache.filter(channel => channel.type === 1).size}**`,
                        `${message.translate('Events/message:MENSAGEM6')}\u2000\u2000**${round(bot.channels.cache.filter(x => x.send).reduce((acc, cur) => acc + cur.messages.cache.size, 0))}**`,
                    ].join('\n'), inline: true,
                }, {
                    name: message.translate('Events/message:MENSAGEM7'), value: [
                        `${message.translate('Events/message:MENSAGEM8')}\u2000\u2000**${round(bot.guilds.cache.reduce((acc, cur) => acc + cur.memberCount, 0))}**`,
                        `${message.translate('Events/message:MENSAGEM9')}\u2000\u2000**${round(bot.users.cache.size)}**`,
                        `${message.translate('Events/message:MENSAGEM10')}\u2000\u2000**${round(bot.users.cache.filter(user => user.bot).size)}**`,
                        `${message.translate('Events/message:MENSAGEM11')}\u2000\u2000**${round(bot.users.cache.filter(user => !user.bot).size)}**`,
                        `${message.translate('Events/message:MENSAGEM12')}\u2000\u2000**${text.commatize(message.guild.memberCount)}**`,
                    ].join('\n'), inline: true,
                }, { value: '━━━━━━━━━━━━━━━━━━━━━━━━━━', name: '\u200b' }, {
                    name: message.translate('Events/message:MENSAGEM13'), value: [
                        `${message.translate('Events/message:MENSAGEM14')}\u2000\u2000**${bot.commands.size}**`,
                        `${message.translate('Events/message:MENSAGEM15')}\u2000\u2000**${round(botm.total)}**`,
                        `${message.translate('Events/message:MENSAGEM16')}\u2000\u2000**\`${message.translate('Events/message:MENSAGEM17')} [${round(top_command.used)}]\`**`,
                    ].join('\n'), inline: true,
                }, {
                    name: message.translate('Events/message:MENSAGEM18'), value: [
                        `${message.translate('Events/message:MENSAGEM20')}\u2000\u2000[**\` ${(mem.heapUsed / 1024 / 1024).toFixed(0)} MB \`**]`,
                        `${message.translate('Events/message:MENSAGEM19')}\u2000\u2000[**\` ${(mem.heapTotal / 1024 / 1024).toFixed(0)} MB \`**]`,
                        `RSS:\u2000\u2000[**\` ${(mem.rss / 1024 / 1024).toFixed(0)} MB \`**]`,
                        `${message.translate('Events/message:MENSAGEM39')} ${barGeneration(calculations.usedRAM, calculations.freeRAM)} [\` ${Math.round((100 * calculations.usedRAM) / (calculations.usedRAM + calculations.freeRAM))} % \`]`,
                    ].join('\n'), inline: true,
                }, { value: '━━━━━━━━━━━━━━━━━━━━━━━━━━', name: '\u200b' }, {
                    name: message.translate('Events/message:MENSAGEM21'), value: [
                        `${bot.channels.cache.size} ${message.translate('Events/message:MENSAGEM22')}\n${bot.channels.cache.filter(channel => channel.type === 0).size} ${message.translate('Events/message:MENSAGEM23')}, ${bot.channels.cache.filter(channel => channel.type === 2).size} ${message.translate('Events/message:MENSAGEM24')}\n${bot.channels.cache.filter(channel => channel.type === 1).size} ${message.translate('Events/message:MENSAGEM25')}`,
                    ].join('\n'), inline: true,
                }, {
                    name: message.translate('Events/message:MENSAGEM26'), value: [
                        `${message.translate('Events/message:MENSAGEM27')}\u2000\u2000** ${round(bot.guilds.cache.size)} ${message.translate('Events/message:MENSAGEM28')} **`,
                        `${message.translate('Events/message:MENSAGEM29')}\u2000\u2000[**\` ${bot.ws.totalShards} ${message.translate('Events/message:MENSAGEM30')} \`**]`,
                    ].join('\n'), inline: true,
                }, { value: '━━━━━━━━━━━━━━━━━━━━━━━━━━', name: '\u200b' }, {
                    name: message.translate('Events/message:MENSAGEM31'), value: [
                        `${message.translate('Events/message:MENSAGEM32')}\u2000\u2000**ubuntu 18.04.6 LTS**`,
                        `${message.translate('Events/message:MENSAGEM33')}\u2000\u2000**v${discord_version}** \`${Math.round(bot.ws.ping)}ms\``,
                        `Database:\u2000\u2000**MongoDB** \`${Math.round(await bot.mongoose.ping())}ms\``,
                        `${message.translate('Events/message:MENSAGEM34')}\u2000\u2000**${process.version}**`,
                        `Uptime:\u2000\u2000 **${moment.duration(bot.uptime).format('D [days], H [hrs], m [mins], s [secs]')}**`,
                        '',
                    ].join('\n'), inline: true,
                }, {
                    name: message.translate('Events/message:MENSAGEM35'), value: [
                        `${message.translate('Events/message:MENSAGEM36')}\u2000\u2000**${cpus()[0].model}**`,
                        `${message.translate('Events/message:MENSAGEM37')}\u2000\u2000**${os.cpus().length}**`,
                        // `Modelo:\u2000\u2000**${core.model}**`,
                        `${message.translate('Events/message:MENSAGEM38')}\u2000\u2000**2300MHz**`,
                        `${message.translate('Events/message:MENSAGEM39')} ${barGeneration(cpuUsage, 100 - cpuUsage)} [\` ${Math.round(cpuUsage)} % \`]\n`,
                        // `━━━━━━━━━━━━━━━━━━━━━━━━━━`
                    ].join('\n'), inline: true,
                }, { value: '━━━━━━━━━━━━━━━━━━━━━━━━━━', name: '\u200b' }, {
                    name: 'DEVELOPMENT', value: [
                        `Invite:\u2000\u2000**[here](${genInviteLink(bot)})**`,
                        `Website:\u2000\u2000**[here](https://hopebot.top)**`,
                        `Support Server:\u2000\u2000**[here](${bot.config.SupportServer.link})**`,
                        `My ID:\u2000\u2000\`${bot.user.id}\``,
                        `Created in:\u2000\u2000<t:${Math.floor(bot.user.createdAt / 1e3)}:d> (<t:${(Math.floor(bot.user.createdAt / 1e3))}:R>)\n`,
                        // `━━━━━━━━━━━━━━━━━━━━━━━━━━`
                    ].join('\n'), inline: true,
                }, {
                    name: 'INFORMATION', value: [
                        `__Developers__\u2000\u2000\n<:Klaus:1033437496857604188>\u2000**${bot.config.ownerName}**`,
                        // `━━━━━━━━━━━━━━━━━━━━━━━━━━`
                    ].join('\n'), inline: true,
                }, { value: '━━━━━━━━━━━━━━━━━━━━━━━━━━', name: '\u200b' },
            ])
            .setTimestamp()
            .setFooter({ text: `Made with ❤ in discord.js\n${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${this.help.name}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
        return message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 90000 }) } });
    }
};

function cpuAverage() {
    let totalIdle = 0;
    let totalTick = 0;
    const cpus = os.cpus();

    for (var i = 0, len = cpus.length; i < len; i++) {
        const cpu = cpus[i];
        const cpuTimes = cpu.times;
        for (const type in cpuTimes) {
            totalTick += cpuTimes[type];
        }
        totalIdle += cpuTimes.idle;
    }

    return {
        avgIdle: (totalIdle / cpus.length),
        avgTotal: (totalTick / cpus.length)
    }
}

function getCpuUsage() {
    return new Promise((resolve) => {
        const startMeasure = cpuAverage();

        setTimeout(() => {
            const endMeasure = cpuAverage();
            const idleDifference = endMeasure.avgIdle - startMeasure.avgIdle;
            const totalDifference = endMeasure.avgTotal - startMeasure.avgTotal;
            const cpuPercentage = (10000 - Math.round(10000 * idleDifference / totalDifference)) / 100;

            resolve(cpuPercentage);
        }, 1000);
    })
}