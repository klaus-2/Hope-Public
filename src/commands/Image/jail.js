// Dependências
const { AttachmentBuilder } = require('discord.js'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');
const Canvacord = require('canvacord');

module.exports = class Jail extends Command {
    constructor(bot) {
        super(bot, {
            name: 'jail',
            dirname: __dirname,
            aliases: ['prisão'],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Send Someone to jail!',
            usage: '<prefix><commandName> [user]',
            examples: [
                '.jail',
                '.jail @Klaus'
            ],
            cooldown: 5000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();
        
        const client = message.client;
        let user = message.mentions.users.first() || client.users.cache.get(message.args[0]) || match(message.args.join(" ").toLowerCase(), message.guild) || message.author;

        let avatar = user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 });
        let image = await Canvacord.Canvas.jail(avatar);
       let attachment = new AttachmentBuilder(image, { name: "prisão.png" });
        message.channel.send({ files: [attachment] });

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