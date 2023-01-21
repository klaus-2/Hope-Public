const { actionLog, GuildSettings, AutoAnimes, votesCheck, AniversarioSchema, autoCovid, AutoTwitch, AutoYoutube, welcome, welcomeDB, ReactionRoleSchema, stickyRole, ticketEmbedSchema, loggingSystem, autoResponse, Sticky, Rank_de_Reputações, applicationsDB, Economia, RankSchema, newsDB, publicServers } = require("../database/models"),
    Guild = require(`../database/models/Hope.js`),
    { fetch } = require('undici');

const findOrCreate = async (guild, db) => {

    switch (db) {
        case 'AutoAnimes':
            try {
                if (guild) {
                    let resp = await AutoAnimes.findOne({ _id: guild.id });
                    if (!resp) {
                        await (new AutoAnimes({
                            _id: guild.id,
                        })).save();

                        return resp = await AutoAnimes.findOne({ _id: guild.id });
                    } else {
                        return resp;
                    }
                }
            } catch (err) {
                console.log(`FindOrCreate: AutoAnimes has error: ${err.message}.`);
            }
            break;
        case 'votesCheck':
            try {
                if (guild) {
                    let resp = await votesCheck.findOne({ _id: guild.author.id });
                    if (!resp) {
                        await (new votesCheck({
                            _id: guild.author.id,
                            totalVotes: 0,
                            topgg: 0,
                            vdb: 0,
                            dbl: 0,
                            lastVote: 0,
                        })).save();

                        return resp = await votesCheck.findOne({ _id: guild.author.id });
                    } else {
                        return resp;
                    }
                }
            } catch (err) {
                console.log(`FindOrCreate: votesCheck has error: ${err.message}.`);
            }
            break;
        case 'applicationsDB':
            try {
                if (guild) {
                    let resp = await applicationsDB.findOne({ _id: guild.id });
                    if (!resp) {
                        await (new applicationsDB({
                            _id: guild.id,
                            questions: [],
                            appToggle: false,
                            appLogs: null
                        })).save();

                        return resp = await applicationsDB.findOne({ _id: guild.id });
                    } else {
                        return resp;
                    }
                }
            } catch (err) {
                console.log(`FindOrCreate: applicationsDB has error: ${err.message}.`);
            }
            break;
        case 'AniversarioSchema':
            try {
                if (guild) {
                    let resp = await AniversarioSchema.findOne({ _id: guild.id });
                    if (!resp) {
                        await (new AniversarioSchema({
                            _id: guild.id,
                        })).save();

                        return resp = await AniversarioSchema.findOne({ _id: guild.id });
                    } else {
                        return resp;
                    }
                }
            } catch (err) {
                console.log(`FindOrCreate: AniversarioSchema has error: ${err.message}.`);
            }
            break;
        case 'GuildSettings':
            try {
                if (guild) {
                    let resp = await GuildSettings.findOne({ guildID: guild.id });
                    if (!resp) {
                        await (new GuildSettings({
                            guildID: guild.id,
                            guildName: guild.name,
                        })).save();

                        return resp = await GuildSettings.findOne({ guildID: guild.id });
                    } else {
                        return resp;
                    }
                }
            } catch (err) {
                console.log(`FindOrCreate: GuildSettings has error: ${err.message}.`);
            }
            break;
        case 'Guild':
            try {
                let resp = await Guild.findOne({ tag: '622812963572809771', });
                if (!resp) {
                    await (new Guild({
                        tag: '622812963572809771',
                    })).save();

                    return resp = await Guild.findOne({ tag: '622812963572809771', });
                } else {
                    return resp;
                }
            } catch (err) {
                console.log(`FindOrCreate: Guild has error: ${err.message}.`);
            }
            break;
    }
}

const checkVoteForPremium = async (message) => {
    let dbVote = await findOrCreate(message, 'votesCheck');
    let DBL_INTERVAL = 43200000;
    const checkVote = Date.now() - dbVote.lastVote < DBL_INTERVAL;
    return (checkVote == false && settings.isPremium === "false");
}

module.exports = {
    findOrCreate,
    checkVoteForPremium
}