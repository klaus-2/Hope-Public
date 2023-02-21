// Dependências
const { serverStats, welcomeDB } = require('../../database/models/index'),
    CronJob = require('cron').CronJob;

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

                    const leavestoday = guild.channels.cache.find(c => c.id == results.lastStats.lastLeaveTodayID);
                    if (leavestoday) {
                        client.logger.addon(`Atualizando [LEAVES] para o servidor ${guild.name} (${guild.id})`)

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
                        client.logger.addon(`Atualizando [LEAVES-WEEKLY] para o servidor ${guild.name} (${guild.id})`)

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
                }
            } else {
                return;
            }
        })
    })
    Check.start();
}