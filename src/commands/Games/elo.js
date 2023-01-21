// Dependências
const { Embed } = require(`../../utils`),
    https = require('https'),
    { PermissionsBitField: { Flags }, AttachmentBuilder } = require('discord.js'),
    Command = require('../../structures/Command.js');

const cor = {
    GRANDMASTER: '#d43136',
    BRONZE: '#583026',
    IRON: '#6d5b59',
    SILVER: '#cfdad4',
    GOLD: '#f7a11d',
    PLATINUM: '#51d695',
    DIAMOND: '#49479b',
    MASTER: '#b326ca',
    CHALLENGER: '#ffcca0'
};

module.exports = class Elo extends Command {
    constructor(bot) {
        super(bot, {
            name: 'elo',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Displays a user\'s highest elo in League of Legends.',
            usage: '<prefix><commandName> <nickname>',
            examples: [
                '.elo Faker'
            ],
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        if (!message.args[0]) {
            return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Games/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Games/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        }

        let n = 0;

        var summonerName = encodeURI(message.args.join(''));

        const apiKey = bot.config.api_keys.riotAPI;
        const região = message.translate('Games/elo:ELO5');
        const nomes = {
            GRANDMASTER: message.translate('Games/elo:ELO6'),
            BRONZE: message.translate('Games/elo:ELO7'),
            IRON: message.translate('Games/elo:ELO8'),
            SILVER: message.translate('Games/elo:ELO9'),
            GOLD: message.translate('Games/elo:ELO10'),
            PLATINUM: message.translate('Games/elo:ELO11'),
            DIAMOND: message.translate('Games/elo:ELO12'),
            MASTER: message.translate('Games/elo:ELO13'),
            CHALLENGER: message.translate('Games/elo:ELO14')
        };
        const url = `https://${região}.api.riotgames.com/lol/summoner/v4/summoners/by-name/`;
        const url2 = `https://${região}.api.riotgames.com/lol/league/v4/entries/by-summoner/`;
        const api_link = '?api_key=' + apiKey;

        https.get((url + summonerName + api_link), res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', data => {
                body += data;
            });
            res.on('end', () => {
                body = JSON.parse(body);
                //console.log(body);

                https.get((url2 + body.id + api_link), res => {
                    res.setEncoding('utf8');
                    let body2 = '';
                    res.on('data', data => {
                        body2 += data;
                    });
                    res.on('end', () => {
                        body2 = JSON.parse(body2);
                        //console.log(body2);
                        //console.log(body2.tier)

                        let solo_duo_rank = '';
                        let flex_rank = '';

                        if (!body2[0]) {
                            solo_duo_rank = 'Unranked';
                        } else {
                            solo_duo_rank = body2[0].tier + ' ' + body2[0].rank;
                        }

                        if (!body2[1]) {
                            flex_rank = 'Unranked'
                        } else {
                            flex_rank = body2[1].tier + ' ' + body2[1].rank;
                        }

                        if (body.name == null) {
                            return message.channel.error(message.translate('Games/elo:ELO16')).then(m => m.timedDelete({ timeout: 10000 }));
                        } else if (body2[0] == null) {
                            const attachment = new AttachmentBuilder(`${process.cwd()}/assets/elos/Emblem_UNRANKED.png`, { name: 'Hope-Elo.png' });
                            const exampleEmbed = new Embed(bot, message.guild)
                                .setColor(1975080)
                                //.setTitle(message.translate('Games/elo:ELO15'))
                                .setAuthor({ name: `${body.name}`, iconURL: 'http://ddragon.leagueoflegends.com/cdn/11.13.1/img/profileicon/' + body.profileIconId + '.png' })
                                //.setDescription('SEM ELO')
                                //.setThumbnail('http://ddragon.leagueoflegends.com/cdn/11.13.1/img/profileicon/' + body.profileIconId + '.png')
                                .setThumbnail('attachment://Hope-Elo.png')
                                .setDescription(`${body.name} ${message.translate('Games/elo:ELO')}: ${body.summonerLevel}`, true)
                                .addFields(
                                    //{ name: '\u200B', value: '\u200B' },
                                    { name: 'Solo/Duo', value: `Elo: Unranked\n${message.translate('Games/elo:ELO3')}: -/-\n${message.translate('Games/elo:ELO2')}: -/-\n${message.translate('Games/elo:ELO4')}: N/A`, inline: true },
                                    { name: 'Flex', value: `Elo: Unranked\n${message.translate('Games/elo:ELO3')}: -/-\n${message.translate('Games/elo:ELO2')}: -/-\n${message.translate('Games/elo:ELO4')}: N/A`, inline: true },
                                )
                                //.addField(message.translate('Games/elo:ELO1'), `${nomes[body2[0].tier]} ${body2[0].rank}`, true)
                                //.addField(message.translate('Games/elo:ELO2'), `0/0`, true)
                                //.addField(message.translate('Games/elo:ELO3'), `-/-`, true)
                                //.addField(message.translate('Games/elo:ELO4'), `0`, true)
                                //.setDescription(`**${body2[0].queueType}**\nLevel: ${data.summonerLevel}\nElo: ${body2[0].tier} ${body2[0].rank}\nV/D: ${body2[0].wins}/${body2[0].losses}\nWin Rate: ${Math.round(body2[0].wins/(body2[0].wins + body2[0].losses) * 100)}%\nPDL: ${body2[0].leaguePoints}`)
                                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                                .setTimestamp()

                            message.channel.send({ embeds: [exampleEmbed], files: [attachment] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        } else if (body2[1]) {

                            const attachment = new AttachmentBuilder(`${process.cwd()}/assets/elos/Emblem_${body2[0].tier}.png`, { name: 'Hope-Elo.png' });
                            const exampleEmbed = new Embed(bot, message.guild)
                                .setColor(cor[body2[0].tier])
                                //.setTitle(message.translate('Games/elo:ELO15'))
                                .setAuthor({ name: `${body.name}`, iconURL: 'http://ddragon.leagueoflegends.com/cdn/11.13.1/img/profileicon/' + body.profileIconId + '.png' })
                                //.setDescription('SOLOQ E FLEX')
                                //.setThumbnail('http://ddragon.leagueoflegends.com/cdn/11.13.1/img/profileicon/' + body.profileIconId + '.png')
                                .setThumbnail('attachment://Hope-Elo.png')
                                .setDescription(`${body.name} ${message.translate('Games/elo:ELO')}: ${body.summonerLevel}`, true)
                                .addFields(
                                    { name: 'Solo/Duo', value: `Elo: ${solo_duo_rank}\n${message.translate('Games/elo:ELO3')}: ${Math.round(body2[0].wins / (body2[0].wins + body2[0].losses) * 100)}%\n${message.translate('Games/elo:ELO2')}: ${body2[0].wins}/${body2[0].losses}\n${message.translate('Games/elo:ELO4')}: ${body2[0].leaguePoints}`, inline: true },
                                    { name: 'Flex', value: `Elo: ${flex_rank}\n${message.translate('Games/elo:ELO3')}: ${Math.round(body2[1].wins / (body2[1].wins + body2[1].losses) * 100)}%\n${message.translate('Games/elo:ELO2')}: ${body2[1].wins}/${body2[1].losses}\n${message.translate('Games/elo:ELO4')}: ${body2[1].leaguePoints}`, inline: true },
                                )
                                //.addField(message.translate('Games/elo:ELO2'), `${body2[1].wins}/${body2[1].losses}`, true)
                                //.addField(message.translate('Games/elo:ELO3'), `${Math.round(body2[1].wins / (body2[1].wins + body2[1].losses) * 100)}%`, true)
                                //.addField(message.translate('Games/elo:ELO4'), `${body2[1].leaguePoints}`, true)
                                //.setDescription(`**${body2[0].queueType}**\nLevel: ${data.summonerLevel}\nElo: ${body2[0].tier} ${body2[0].rank}\nV/D: ${body2[0].wins}/${body2[0].losses}\nWin Rate: ${Math.round(body2[0].wins/(body2[0].wins + body2[0].losses) * 100)}%\nPDL: ${body2[0].leaguePoints}`)
                                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                                .setTimestamp()

                            message.channel.send({ embeds: [exampleEmbed], files: [attachment] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        } else {
                            const attachment = new AttachmentBuilder(`${process.cwd()}/assets/elos/Emblem_${body2[0].tier}.png`, { name: 'Hope-Elo.png' });
                            const exampleEmbed = new Embed(bot, message.guild)
                                .setColor(cor[body2[0].tier])
                                //.setTitle(message.translate('Games/elo:ELO15'))
                                .setAuthor({ name: `${body.name}`, iconURL: 'http://ddragon.leagueoflegends.com/cdn/11.13.1/img/profileicon/' + body.profileIconId + '.png' })
                                //.setDescription('APENAS SOLOQ')
                                //.setThumbnail('http://ddragon.leagueoflegends.com/cdn/11.13.1/img/profileicon/' + body.profileIconId + '.png')
                                .setThumbnail('attachment://Hope-Elo.png')
                                .setDescription(`${body.name} ${message.translate('Games/elo:ELO')}: ${body.summonerLevel}`, true)
                                .addFields(
                                    //{ name: '\u200B', value: '\u200B' },
                                    { name: 'Solo/Duo', value: `Elo: ${solo_duo_rank}\n${message.translate('Games/elo:ELO3')}: ${Math.round(body2[0].wins / (body2[0].wins + body2[0].losses) * 100)}%\n${message.translate('Games/elo:ELO2')}: ${body2[0].wins}/${body2[0].losses}\n${message.translate('Games/elo:ELO4')}: ${body2[0].leaguePoints}`, inline: true },
                                    { name: 'Flex', value: 'Unranked', inline: true },
                                )
                                //.addField(message.translate('Games/elo:ELO1'), `${nomes[body2[0].tier]} ${body2[0].rank}`, true)
                                //.addField(message.translate('Games/elo:ELO2'), `${body2[0].wins}/${body2[0].losses}`, true)
                                //.addField(message.translate('Games/elo:ELO3'), `${Math.round(body2[0].wins / (body2[0].wins + body2[0].losses) * 100)}%`, true)
                                //.addField(message.translate('Games/elo:ELO4'), `${body2[0].leaguePoints}`, true)
                                //.setDescription(`**${body2[0].queueType}**\nLevel: ${data.summonerLevel}\nElo: ${body2[0].tier} ${body2[0].rank}\nV/D: ${body2[0].wins}/${body2[0].losses}\nWin Rate: ${Math.round(body2[0].wins/(body2[0].wins + body2[0].losses) * 100)}%\nPDL: ${body2[0].leaguePoints}`)
                                .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                                .setTimestamp()

                            message.channel.send({ embeds: [exampleEmbed], files: [attachment] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
                        }
                    });
                });
            });
        });

    }
}