// Dependências
const { serverStats } = require('../../database/models/index'),
    dfetch = require('node-fetch'),
    CronJob = require('cron').CronJob;

// access token to interact with twitch API
let access_token = null;

module.exports = async (client) => {

    var Check = new CronJob("*/10 * * * *", async function () {
        client.guilds.cache.forEach(async (guild) => {

            /** ------------------------------------------------------------------------------------------------
            * SE CONECTA AO BANCO DE DADOS DO AUTO-TWITCH
            * ------------------------------------------------------------------------------------------------ */
            let results = await serverStats.findOne({ _id: guild.id })
            if (results) {
                const category = guild.channels.cache.find(c => c.id == results.categoryID);

                // Get server settings / if no settings then return
                const settings = guild.settings;
                if (Object.keys(settings).length == 0) return;

                if (category) {

                    const twitchfollowers = guild.channels.cache.find(c => c.id == results.socialStats.twitchFollowersID);
                    if (twitchfollowers) {
                        client.logger.addon(`Atualizando [TWITCH-FOLLOWERS] para o servidor ${guild.name} (${guild.id})`)

                        const user = results.socialStats.twitchChannel;
                        const twitchUser = await getUserByUsername(user);

                        await twitchfollowers.setName(`Twitch Followers: ${await getFollowersFromId(twitchUser.id).then(num => num.toLocaleString(settings.Language))}`).catch(e => console.log(e));
                    } else {
                        return;
                    }
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