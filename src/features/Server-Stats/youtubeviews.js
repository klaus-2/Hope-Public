// Dependências
const { serverStats } = require('../../database/models/index'),
    fetch = require("node-superfetch"),
    fs = require('fs'),
    CronJob = require('cron').CronJob;

module.exports = async (client) => {

    var Check = new CronJob("*/10 * * * *", async function () {
        client.guilds.cache.forEach(async (guild) => {

            const array = fs.readFileSync(`${process.cwd()}/assets/json/apis-youtube.json`, 'utf8');
            const selectApi = JSON.parse(array).apis;
            const api = selectApi[Math.floor(Math.random() * selectApi.length)];

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

                    const youtubeviews = guild.channels.cache.find(c => c.id == results.socialStats.youtubeViewsID);
                    
                    if (youtubeviews) {
                        client.logger.addon(`Atualizando [YOUTUBE-VIEWS] para o servidor ${guild.name} (${guild.id})`)

                        const data = await fetch.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings&id=${results.socialStats.youtubeChannel}&key=${api.youtube}`)
                            .catch(() => console.log(client.translate('Pesquisas/youtube-canal:YOUTUBE_CANAL2')));

                        await youtubeviews.setName(`Youtube Views: ${data.body.items[0].statistics.viewCount.toLocaleString(settings.Language)}`).catch(e => console.log(e));
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
}