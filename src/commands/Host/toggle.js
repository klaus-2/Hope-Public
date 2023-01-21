// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

module.exports = class Bug extends Command {
    constructor(bot) {
        super(bot, {
            name: 'toggle',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks,Flags.ManageChannels],
            description: 'Transforma um canal SFW em NSFW.',
            usage: 'toggle',
            examples: 'toggle',
            cooldown: 3000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        const nsfw = message.channel;
        if (!nsfw.nsfw) {
            message.channel.success('Yayy! Agora este __canal__ é um canal \`NSFW\`').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});
            const channel = message.channel; channel.edit({ nsfw: !channel.nsfw })
        } if (nsfw.nsfw) {
            message.channel.error('Uhgr! Este canal já é um canal \`NSFW\`').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});
        }
    }
};