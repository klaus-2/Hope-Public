// Dependências
/* const CronJob = require('cron').CronJob;

module.exports = async (client) => {

    // var Check = new CronJob("00 * /12 * * *", async function () {
       /* client.guilds.cache.forEach(async (guild) => {

        /** ------------------------------------------------------------------------------------------------
		* VERIFICA SE O USUARIO QUE ENTROU NO SERVIDOR DE SUPORTE É DONO DE UM SERVER COM A Hope
		* ------------------------------------------------------------------------------------------------ */	
            /* let ownerPool = [];
            await client.guilds.cache.forEach(guild => {
                ownerPool.push(guild.ownerId);
            });

            var owners = ownerPool;

            var uniq = owners.reduce(function (a, b) {
                if (a.indexOf(b) < 0) a.push(b);
                return a;
            }, []);

            uniq.forEach(async function (id) {
                // console.log(id)
                // console.log(owner)
                let guildd = client.guilds.cache.get('804851508944306236');
                let usera = guildd.members.cache.get(id);
                const cargo = ['899080816989184050'];
                if (!usera) return;
                if (usera._roles.some(r => cargo.includes(r))) {
                    return;
                } else {
                    await usera.roles.add('899080816989184050');
                }
            }) */

        /** ------------------------------------------------------------------------------------------------
		* SE O USUARIO NÃO FOR MAIS DONO DE UM SV Q TENHA A Hope, ELE TERÁ SEU CARGO REMOVIDO
		* ------------------------------------------------------------------------------------------------ */	

           /* let Hopeguild = client.guilds.cache.get('804851508944306236');
            let allMembers = [];
            await Hopeguild.members.cache.forEach(member => {
                allMembers.push(member.id);
            });


            uniq.forEach(async function (id) {
                var arr = allMembers;

                for (var i = 0; i < arr.length; i++) {

                    if (arr[i] === id) {

                        arr.splice(i, 1);
                    }
                }
            })

            allMembers.forEach(async function (flw) {

            let guild1 = client.guilds.cache.get('804851508944306236');
            let user1 = guild1.members.cache.get(flw);
            await user1.roles.remove('899080816989184050');
            })
        // })
    })
    Check.start();
} */