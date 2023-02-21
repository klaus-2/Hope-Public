// Dependências
const { serverStats, welcomeDB } = require('../../database/models/index'),
    fetch = require("node-superfetch"),
    dfetch = require('node-fetch'),
    fs = require('fs'),
    CronJob = require('cron').CronJob;

// access token to interact with twitch API
let access_token = null;

module.exports = async (client) => {

    var Check = new CronJob("*/10 * * * *", async function () {
        client.guilds.cache.forEach(async (guild) => {

            const array = fs.readFileSync('./assets/json/apis-youtube.json', 'utf8');
            const selectApi = JSON.parse(array).apis;
            const api = selectApi[Math.floor(Math.random() * selectApi.length)];

            /** ------------------------------------------------------------------------------------------------
            * SE CONECTA AO BANCO DE DADOS DO AUTO-TWITCH
            * ------------------------------------------------------------------------------------------------ */
            let results = await serverStats.findOne({ _id: guild.id })
            if (results) {
                const membros = guild.members.cache;
                const category = guild.channels.cache.find(c => c.id == results.categoryID);

                // Get server settings / if no settings then return
                const settings = guild.settings;
                if (Object.keys(settings).length == 0) return;

                if (category) {
                    client.logger.addon(`Atualizando Server Stats para o servidor ${guild.name} (${guild.id})`)

                    const allmembers = guild.channels.cache.find(c => c.id == results.allMembersID);
                    if (allmembers) {
                        await allmembers.setName(`All Members: ${guild.memberCount.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const members = guild.channels.cache.find(c => c.id == results.membersID);
                    if (members) {
                        await members.setName(`Members: ${membros.filter(member => !member.user.bot).size.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const bots = guild.channels.cache.find(c => c.id == results.botsID);
                    if (bots) {
                        await bots.setName(`Bots: ${membros.filter(member => member.user.bot).size.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const online = guild.channels.cache.find(c => c.id == results.userStats.onlineID);
                    if (online) {
                        await online.setName(`Online: ${membros.filter(m => m.presence?.status === 'online').size.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const dnd = guild.channels.cache.find(c => c.id == results.userStats.dndID);
                    if (dnd) {
                        await dnd.setName(`Dnd: ${membros.filter(m => m.presence?.status === 'dnd').size.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const idle = guild.channels.cache.find(c => c.id == results.userStats.idleID);
                    if (idle) {
                        await idle.setName(`Idle: ${membros.filter(m => m.presence?.status === 'dnd').size.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const offline = guild.channels.cache.find(c => c.id == results.userStats.offlineID);
                    if (offline) {
                        await offline.setName(`Offline: ${membros.filter(m => m.presence?.status === 'offline').size.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const allstatus = guild.channels.cache.find(c => c.id == results.userStats.allUserStatsID);
                    if (allstatus) {
                        await allstatus.setName(`🟢 ${membros.filter(m => m.presence?.status === 'online').size.toLocaleString(settings.Language)} ⛔ ${membros.filter(m => m.presence?.status === 'dnd').size.toLocaleString(settings.Language)} 🌙 ${membros.filter(m => m.presence?.status === 'idle').size.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const youtubesubs = guild.channels.cache.find(c => c.id == results.socialStats.youtubeSubsID);
                    if (youtubesubs) {

                        const data = await fetch.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings&id=${results.socialStats.youtubeChannel}&key=${api.youtube}`)
                            .catch(() => console.log(client.translate('Pesquisas/youtube-canal:YOUTUBE_CANAL2')));

                        await youtubesubs.setName(`Youtube Subs: ${data.body.items[0].statistics.subscriberCount.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const youtubeviews = guild.channels.cache.find(c => c.id == results.socialStats.youtubeViewsID);
                    if (youtubeviews) {

                        const data = await fetch.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings&id=${results.socialStats.youtubeChannel}&key=${api.youtube}`)
                            .catch(() => console.log(client.translate('Pesquisas/youtube-canal:YOUTUBE_CANAL2')));

                        await youtubeviews.setName(`Youtube Views: ${data.body.items[0].statistics.viewCount.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const youtubevideos = guild.channels.cache.find(c => c.id == results.socialStats.youtubeVideosID);
                    if (youtubevideos) {

                        const data = await fetch.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings&id=${results.socialStats.youtubeChannel}&key=${api.youtube}`)
                            .catch(() => console.log(client.translate('Pesquisas/youtube-canal:YOUTUBE_CANAL2')));

                        await youtubevideos.setName(`Youtube Videos: ${data.body.items[0].statistics.videoCount.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const twitchfollowers = guild.channels.cache.find(c => c.id == results.socialStats.twitchFollowersID);
                    if (twitchfollowers) {

                        const user = results.socialStats.twitchChannel;
                        const twitchUser = await getUserByUsername(user);

                        await twitchfollowers.setName(`Twitch Followers: ${await getFollowersFromId(twitchUser.id).then(num => num.toLocaleString(settings.Language))}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const joinstoday = guild.channels.cache.find(c => c.id == results.lastStats.lastJoinTodayID);
                    if (joinstoday) {

                        let welcomeSettings = await welcomeDB.findOne({ _id: results._id });
                        if (!welcomeSettings) {

                            const newSettings = new welcomeDB({
                                _id: results._id
                            });
                            await newSettings.save().catch(() => { });
                            welcomeSettings = await welcomeDB.findOne({ _id: results._id });
                        }

                        const join1 = []
                        const leave1 = []
                        const join2 = []
                        const leave2 = []

                        guild.members.cache.forEach(async (user) => {

                            let day = 7 * 86400000;
                            let x = Date.now() - user.joinedAt;
                            let created = Math.floor(x / 86400000);



                            if (7 > created) {
                                join2.push(user.id)
                            }

                            if (1 > created) {
                                join1.push(user.id)
                            }

                        })

                        welcomeSettings.leaves.forEach(async (leave) => {


                            let xx = leave - Date.now();
                            if (Date.now() > leave) {
                                xx = Date.now() - leave
                            }

                            let createdd = Math.floor(xx / 86400000);


                            if (6 >= createdd) {
                                leave2.push(leave)
                            }

                            if (0 >= createdd) {
                                leave1.push(leave)
                            }

                        })

                        const jointoday = join1.length || 0;
                        const joinweek = join2.length || 0;
                        const leaveweek = leave1.length || 0;
                        const leavetoday = leave2.length || 0;


                        await welcomeSettings.save().catch(() => { });

                        await joinstoday.setName(`Joins Today: ${jointoday.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const joinsweekly = guild.channels.cache.find(c => c.id == results.lastStats.lastJoin7DaysID);
                    if (joinsweekly) {

                        let welcomeSettings = await welcomeDB.findOne({ _id: results._id });
                        if (!welcomeSettings) {

                            const newSettings = new welcomeDB({
                                _id: results._id
                            });
                            await newSettings.save().catch(() => { });
                            welcomeSettings = await welcomeDB.findOne({ _id: results._id });
                        }

                        const join1 = []
                        const leave1 = []
                        const join2 = []
                        const leave2 = []

                        guild.members.cache.forEach(async (user) => {

                            let day = 7 * 86400000;
                            let x = Date.now() - user.joinedAt;
                            let created = Math.floor(x / 86400000);



                            if (7 > created) {
                                join2.push(user.id)
                            }

                            if (1 > created) {
                                join1.push(user.id)
                            }

                        })

                        welcomeSettings.leaves.forEach(async (leave) => {


                            let xx = leave - Date.now();
                            if (Date.now() > leave) {
                                xx = Date.now() - leave
                            }

                            let createdd = Math.floor(xx / 86400000);


                            if (6 >= createdd) {
                                leave2.push(leave)
                            }

                            if (0 >= createdd) {
                                leave1.push(leave)
                            }

                        })

                        const jointoday = join1.length || 0;
                        const joinweek = join2.length || 0;
                        const leaveweek = leave1.length || 0;
                        const leavetoday = leave2.length || 0;


                        await welcomeSettings.save().catch(() => { });

                        await joinsweekly.setName(`Joins Weekly: ${joinweek.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const leavestoday = guild.channels.cache.find(c => c.id == results.lastStats.lastLeaveTodayID);
                    if (leavestoday) {

                        let welcomeSettings = await welcomeDB.findOne({ _id: results._id });
                        if (!welcomeSettings) {

                            const newSettings = new welcomeDB({
                                _id: results._id
                            });
                            await newSettings.save().catch(() => { });
                            welcomeSettings = await welcomeDB.findOne({ _id: results._id });
                        }

                        const join1 = []
                        const leave1 = []
                        const join2 = []
                        const leave2 = []

                        guild.members.cache.forEach(async (user) => {

                            let day = 7 * 86400000;
                            let x = Date.now() - user.joinedAt;
                            let created = Math.floor(x / 86400000);



                            if (7 > created) {
                                join2.push(user.id)
                            }

                            if (1 > created) {
                                join1.push(user.id)
                            }

                        })

                        welcomeSettings.leaves.forEach(async (leave) => {


                            let xx = leave - Date.now();
                            if (Date.now() > leave) {
                                xx = Date.now() - leave
                            }

                            let createdd = Math.floor(xx / 86400000);


                            if (6 >= createdd) {
                                leave2.push(leave)
                            }

                            if (0 >= createdd) {
                                leave1.push(leave)
                            }

                        })

                        const jointoday = join1.length || 0;
                        const joinweek = join2.length || 0;
                        const leaveweek = leave1.length || 0;
                        const leavetoday = leave2.length || 0;


                        await welcomeSettings.save().catch(() => { });

                        await leavestoday.setName(`Leaves Today: ${leavetoday.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }

                    const leavesweekly = guild.channels.cache.find(c => c.id == results.lastStats.lastLeave7DaysID);
                    if (leavesweekly) {

                        let welcomeSettings = await welcomeDB.findOne({ _id: results._id });
                        if (!welcomeSettings) {

                            const newSettings = new welcomeDB({
                                _id: results._id
                            });
                            await newSettings.save().catch(() => { });
                            welcomeSettings = await welcomeDB.findOne({ _id: results._id });
                        }

                        const join1 = []
                        const leave1 = []
                        const join2 = []
                        const leave2 = []

                        guild.members.cache.forEach(async (user) => {

                            let day = 7 * 86400000;
                            let x = Date.now() - user.joinedAt;
                            let created = Math.floor(x / 86400000);



                            if (7 > created) {
                                join2.push(user.id)
                            }

                            if (1 > created) {
                                join1.push(user.id)
                            }

                        })

                        welcomeSettings.leaves.forEach(async (leave) => {


                            let xx = leave - Date.now();
                            if (Date.now() > leave) {
                                xx = Date.now() - leave
                            }

                            let createdd = Math.floor(xx / 86400000);


                            if (6 >= createdd) {
                                leave2.push(leave)
                            }

                            if (0 >= createdd) {
                                leave1.push(leave)
                            }

                        })

                        const jointoday = join1.length || 0;
                        const joinweek = join2.length || 0;
                        const leaveweek = leave1.length || 0;
                        const leavetoday = leave2.length || 0;


                        await welcomeSettings.save().catch(() => { });

                        await leavesweekly.setName(`Leaves Weekly: ${leaveweek.toLocaleString(settings.Language)}`).catch(e => console.log(e));
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            } else {
                return;
            }
        })
    })

    Check.start();

    // buscar informações básicas do usuário (e verifica se o usuário existe)
    async function getUserByUsername(login) {
        return request('/users', { login }).then(u => u && u.data[0]);
    }

    // buscar dados da stream do usuário (se o usuário estiver transmitindo)
    async function getStreamByUsername(username) {
        return request('/streams', { user_login: username }).then(s => s && s.data[0]);
    }

    // busca os dados para outras funções
    function request(endpoint, queryParams = {}) {
        const qParams = new URLSearchParams(queryParams);
        return dfetch('https://api.twitch.tv/helix' + endpoint + `?${qParams.toString()}`, {
            headers: { 'Client-ID': client.config.api_keys.twitch.clientID, 'Authorization': `Bearer ${access_token}` },
        }).then(res => res.json())
            .then(data => {
                if (data.error === 'Unauthorized') {
                    return refreshTokens()
                        .then(() => request(endpoint, queryParams));
                }
                return data;
            }).catch(e => console.log(e));
    }

    // Busca dados do seguidores a partir do ID do usuário
    async function getFollowersFromId(id) {
        return request('/users/follows', { to_id: id }).then(u => u && u.total);
    }

    // Buscar access_token para interagir com a API da twitch
    async function refreshTokens() {
        await dfetch(`https://id.twitch.tv/oauth2/token?client_id=${client.config.api_keys.twitch.clientID}&client_secret=${client.config.api_keys.twitch.clientSecret}&grant_type=client_credentials`, {
            method: 'POST',
        }).then(res => res.json()).then(data => {
            access_token = data.access_token;
        }).catch(e => console.log(e));
    }
}