// Dependências
const { Reputação } = require('../../database/models/index'),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class SetRep extends Command {
    constructor(bot) {
        super(bot, {
            name: 'setrep',
            dirname: __dirname,
            userPermissions: [Flags.ManageGuild],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Manually set the reputation of a user.',
            usage: '<prefix><commandName> <user> <new rep>',
            examples: [
                '.setrep @Klaus 100'
            ],
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

        const members = await message.getMember(false);

        if (members) {
            // SE CONECTA NA DB
            var repDB = await Reputação.findOne({ userID: members[0].user.id, guildID: message.guild.id });
            if (!repDB) {
                const newSettings = new Reputação({
                    userID: members[0].user.id,
                    guildID: message.guild.id,
                });
                await newSettings.save().catch(() => { });
                repDB = await Reputação.findOne({ userID: members[0].user.id, guildID: message.guild.id });
            }

            if (!isNaN(message.args[1])) {
                message.channel.success('Misc/set-rep:SET_REP', { member: `<@${members[0].id}>`, received: repDB.recebido, valor: message.args[1] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
                repDB.recebido = message.args[1];
            } else {
                message.channel.error('Misc/set-rep:SET_REP1').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
            }
            await repDB.save().catch(() => { });
        }
    }
}