// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    axios = require("axios").default,
    unirest = require("unirest"),
    Command = require('../../structures/Command.js');

module.exports = class Ingame extends Command {
    constructor(bot) {
        super(bot, {
            name: 'ingame',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Shows information of a match in League of Legends',
            usage: '<prefix><commandName> <nickname>',
            examples: [
                '.ingame Faker'
            ],
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        const api = bot.config.api_keys.riotAPI;
        if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Games/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Games/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        const r = await message.channel.send(message.translate('Games/ingame:INGAME'));
        if (message.args[0] != '') {
            const nom = message.args.join(' ');
            let getSumId = async () => {

                let response = await unirest.get(`https://${message.translate('Games/elo:ELO5')}.api.riotgames.com/lol/summoner/v4/summoners/by-name/` + nom)
                    .header("X-Riot-Token", api);
                let sumId = response.body;
                try {
                    return sumId.id;
                }
                catch (e) {
                    message.channel.send(message.translate('Games/ingame:INGAME1'));
                }
            }

            let getParticipantsIdTeamRed = async () => {
                let sumId = await getSumId();
                if (sumId) {
                    let response = await unirest.get(`https://${message.translate('Games/elo:ELO5')}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/` + sumId)
                        .header("X-Riot-Token", api);

                    var match = response.body;

                    var matchParsed = JSON.parse(JSON.stringify(match));

                    var participantsRed = [];

                    for (var id in matchParsed) {
                        if (matchParsed[id].team == 100) {
                            participantsRed.push(matchParsed[id]);

                        }
                    }
                    return match.participants;
                }

            }



            let getSumRank = async () => {
                let participants = await getParticipantsIdTeamRed();

                var participantsIds = [];
                for (var id in participants) {
                    let response = await unirest.get(`https://${message.translate('Games/elo:ELO5')}.api.riotgames.com/lol/league/v4/entries/by-summoner/` + participants[id].summonerId)
                        .header("X-Riot-Token", api);

                    for (var e in response.body) {
                        if (response.body[e].queueType === "RANKED_SOLO_5x5") {
                            participantsIds.push(response.body[e].tier + ' ' + response.body[e].rank + '\n' + response.body[e].leaguePoints + ' LP');
                        }
                    }
                }
                return participantsIds;
            }

            let getSumNames = async () => {
                let participants = await getParticipantsIdTeamRed();

                var participantsNames = [];
                for (var id in participants) {
                    let response = await unirest.get(`https://${message.translate('Games/elo:ELO5')}.api.riotgames.com/lol/league/v4/entries/by-summoner/` + participants[id].summonerId)
                        .header("X-Riot-Token", api);

                    participantsNames.push(response.body[0].summonerName)
                }
                return participantsNames;
            }

            let sumRanks = await getSumRank();
            let sumNames = await getSumNames();

            if (sumRanks.length > 0) {


                const URL = `https:///${message.translate('Games/ingame:INGAME2')}.op.gg/summoner/userName=` + message.args.join('+');
                const embed = new Embed(bot, message.guild)
                    .setColor(65419)
                    //.setURL(URL)
                    .setTitle(`Partida de ${nom}`)
                    .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Games/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setThumbnail('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.ggpht.com%2Fa-%2FAAuE7mBabm11q4VVKRh2xsSoe9f0ArJXSbRkwp2ZSQ%3Ds900-mo-c-c0xffffffff-rj-k-no&f=1&nofb=1');

                for (var i = 0; i <= 4; i++) {
                    //embed.addBlankField(true)
                    //embed.addField(sumNames[i], sumRanks[i], true)
                    embed.setDescription(`**🔵 ${message.translate('Games/ingame:INGAME3')}**\n${sumNames[8 - i]} - ${sumRanks[8 - i]}\n${sumNames[7 - i]} - ${sumRanks[7 - i]}\n${sumNames[6 - i]} - ${sumRanks[6 - i]}\n${sumNames[5 - i]} - ${sumRanks[5 - i]}\n${sumNames[4 - i]} - ${sumRanks[4 - i]}\n**🔴 ${message.translate('Games/ingame:INGAME4')}**\n${sumNames[9 - i]} - ${sumRanks[9 - i]}\n${sumNames[10 - i]} - ${sumRanks[10 - i]}\n${sumNames[11 - i]} - ${sumRanks[11 - i]}\n${sumNames[12 - i]} - ${sumRanks[12 - i]}\n${sumNames[13 - i]} - ${sumRanks[13 - i]}`)
                }
                r.delete()
                message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
            }
            else {
                message.channel.send(message.translate('Games/ingame:INGAME5', { nom: nom }));
            }
        }

    }
}