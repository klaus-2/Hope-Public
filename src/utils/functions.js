module.exports = {
    getMember: function(msg, toFind = '') {
        toFind = toFind.toLowerCase();
        let target = msg.guild.members.cache.get(toFind);

        if (!target && msg.mentions.members)
            target = msg.mentions.members.first();

        if (!target && toFind) {
            target = msg.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }

        if (!target) {target = msg.member}

        return target;
    },
    getMember2: function(msg, toFind = '') {
        toFind = toFind.toLowerCase();
        let target = msg.guild.members.cache.get(toFind);

        if (!target && msg.mentions.members)
            target = msg.mentions.members.last();

        if (!target && toFind) {
            target = msg.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }

        if (!target) {target = msg.member}

        return target;
    },
    getMember_: function(msg, toFind = '') {
        toFind = toFind.toLowerCase();
        let target = msg.guild.members.cache.get(toFind);

        if (!target && msg.mentions.members)
            target = msg.mentions.members.first();

        if (!target && toFind) {
            target = msg.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }

        if (!target) {
            target = 'false';
        }
        return target;
    },
    getMember2_: function(msg, toFind = '') {
        toFind = toFind.toLowerCase();
        let target = msg.guild.members.cache.get(toFind);

        if (!target && msg.mentions.members)
            target = msg.mentions.members.last();

        if (!target && toFind) {
            target = msg.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }

        if (!target) {
            target = 'false';
        }
        return target;
    },
    getMemberAll: function(bot, toFind = '') {
        toFind = toFind.toLowerCase();
        let target = bot.guilds.cache.map(g => g.members.cache.get(toFind));

        if (!target && toFind) {
            target = bot.guilds.cache.map(g=> g.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            }));
        }

        var target2;
        target.map(member => {
            if(member != undefined) {
                target2 = member.user
            }
        })
        target = target2
        if (!target) {target = "false"}

        return target;
    },
}