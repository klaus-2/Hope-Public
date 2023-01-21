// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');
const fetch = require('node-fetch');

module.exports = class IphoneX extends Command {
    constructor(bot) {
        super(bot, {
            name: 'iphonex',
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Make someone fit in an iphonex!',
            usage: '<prefix><commandName> [user]',
            examples: [
                '.iphonex',
                '.iphonex @Klaus'
            ],
            cooldown: 5000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        const client = message.client;
        let user = message.mentions.users.first() || client.users.cache.get(message.args[0]) || match(message.args.join(" ").toLowerCase(), message.guild) || message.author;

        const data = await fetch(
            `https://nekobot.xyz/api/imagegen?type=iphonex&url=${user.displayAvatarURL({ size: 512 })}`
        ).then((res) => res.json());
        message.channel.send(data.message);

        function match(msg, i) {
            if (!msg) return undefined;
            if (!i) return undefined;
            let user = i.members.cache.find(
                m =>
                    m.user.username.toLowerCase().startsWith(msg) ||
                    m.user.username.toLowerCase() === msg ||
                    m.user.username.toLowerCase().includes(msg) ||
                    m.displayName.toLowerCase().startsWith(msg) ||
                    m.displayName.toLowerCase() === msg ||
                    m.displayName.toLowerCase().includes(msg)
            );
            if (!user) return undefined;
            return user.user;
        }

    }
}