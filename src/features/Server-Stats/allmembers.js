// Dependências
const { serverStats } = require('../../database/models/index'),
    CronJob = require('cron').CronJob;

module.exports = async (client) => {
    client.logger.addon(`Addon Server-Stats inicializado com sucesso.`)

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

                    const allmembers = guild.channels.cache.find(c => c.id == results.allMembersID);
                    if (allmembers) {
                        client.logger.addon(`Atualizando [ALL-MEMBERS] para o servidor ${guild.name} (${guild.id})`)
                        await allmembers.setName(`All Members: ${guild.memberCount.toLocaleString(settings.Language)}`).catch(e => console.log(e));
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