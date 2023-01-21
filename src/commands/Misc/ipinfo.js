// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    axios = require('axios'),
    Command = require('../../structures/Command.js');

const ar = {
    true: 'yes',
    false: 'no'
};

module.exports = class IPinfo extends Command {
    constructor(bot) {
        super(bot, {
            name: 'ipinfo',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: "Gets information about the IP address.",
            usage: '<prefix><commandName> <ip>',
            examples: [
                '.ipinfo 54.167.249.213'
            ],
            cooldown: 60000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

        this.getIPINFO(message.args[0]).then(response => {
            if (response.data.status === "success") {
                const embedStats = new Embed(bot, message.guild)
                    .setTitle('Misc/ipinfo:EIP_DESC')
                    .setThumbnail('https://i.imgur.com/7HuMF3g.png')
                    .setColor(16775424)
                    .setDescription(`**${message.translate('Misc/ipinfo:EIP_DESC1')}** ${ar[response.data.mobile]}\n**${message.translate('Misc/ipinfo:EIP_DESC2')}** ${ar[response.data.proxy]}`)
                    .addFields({ name: message.translate('Misc/ipinfo:EIP_DESC3'), value: `${response.data.isp}`, inline: true },
                    { name: message.translate('Misc/ipinfo:EIP_DESC4'), value: `${response.data.as}`, inline: true },
                    { name: message.translate('Misc/ipinfo:EIP_DESC5'), value: `${response.data.continent}`, inline: true },
                    { name: message.translate('Misc/ipinfo:EIP_DESC6'), value: `${response.data.country}`, inline: true },
                    { name: message.translate('Misc/ipinfo:EIP_DESC7'), value: `${response.data.city}`, inline: true },
                    { name: message.translate('Misc/ipinfo:EIP_DESC8'), value: `${response.data.timezone}`, inline: true },
                    { name: message.translate('Misc/ipinfo:EIP_DESC9'), value: `${message.translate('Misc/ipinfo:EIP_DESC10')} ${response.data.lat} | ${message.translate('Misc/ipinfo:EIP_DESC11')} ${response.data.lon}`, inline: true },
                    { name: message.translate('Misc/ipinfo:EIP_DESC12'), value: `${response.data.currency}`, inline: true })
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setTimestamp()

                return message.channel.send({ embeds: [embedStats] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            }
            else {
                return message.channel.send(message.translate('Misc/ipinfo:EIP_DESC13')).then(m => m.timedDelete({ timeout: 10000 }));
            }
        });

    }
    async getIPINFO(ip) {
        return axios.get(`http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,currency,isp,org,as,asname,reverse,mobile,proxy,query`, { responseType: 'json', timeout: 10000 });
    }
};