// Dependências
const Canvas = require("canvas"),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');

const canvas = Canvas.createCanvas(540, 547)
const ctx = canvas.getContext("2d");

module.exports = class Ednaldo extends Command {
    constructor(bot) {
        super(bot, {
            name: 'ednaldo',
            dirname: __dirname,
            description: 'Exibe o perfil do usuario mencionado.',
            usage: '<prefix><commandName> [user]',
            examples: [
                '.ednaldo',
                '!ednaldo @Klaus'
            ],
            cooldown: 5000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        // RANDOM LOADING MSG
        const phrase = () => {
            const p = [
                message.translate('misc:BUSCAR_DADOS'),
                message.translate('misc:BUSCAR_DADOS1'),
                message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
            ];
            return p[Math.floor(Math.random() * p.length)];
        };

        const msg = await message.channel.send(phrase());

        try {
            const member = message.mentions.members.last() || message.member;

            const avatar = member.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 });
            //    ctx.drawImage(avatar, 100, 25, 200, 200)
            const av = await Canvas.loadImage(avatar)
            ctx.drawImage(av, 50, 177, 422, 330)

            const bg = await Canvas.loadImage("https://media.discordapp.net/attachments/729870001087184937/897933015924232252/786t.png")
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);


            msg.delete();
            message.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'Hope-ednaldo.png', }] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } catch (err) {
            bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
            msg.delete();
            message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
        }
    }
};