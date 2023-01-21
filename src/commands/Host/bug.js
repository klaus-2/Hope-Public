// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');
const moment = require('moment');
let recent = new Set();

module.exports = class Bug extends Command {
    constructor(bot) {
        super(bot, {
            name: 'bug',
            dirname: __dirname,
            aliases: ['dev'],
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'reportar um bug para o meu desenvolvedor.',
            usage: 'bug <mensagem>',
            examples: '.bug estou tentando usar o comando teste mas não está funcionando.',
            cooldown: 10000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        let user = message.mentions.users.first() || message.guild.members.cache.get(message.args[0]) || message.author;
        let date = moment().format('LLLL');
        let msg = message.args.join(" ");
        const dev = bot.users.cache.get('622812963572809771')

        if (recent.has(user.id)) {
            message.channel.send(message.translate('Dono/bug:HBUG_DESC'));
        } else {
            if (!message.args[0]) {
                return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Host/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Host/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});
            } else {
                const embed = new Embed(bot, message.guild)
                    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }) })
                    .setColor(0x0AA0A0)
                    .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true }))
                    .addField(message.translate('Dono/bug:HBUG_DESC1'), `${message.author.username}#${message.author.discriminator}`, true)
                    .addField(message.translate('Dono/bug:HBUG_DESC2'), message.author.id, true)
                    .addField(message.translate('Dono/bug:HBUG_DESC3'), moment.utc(message.author.createdAt).format('LLLL'))
                    .addField(message.translate('Dono/bug:HBUG_DESC4'), `\`\`\`${msg}\`\`\``)
                    .addFields({
                        name: message.translate('Dono/bug:HBUG_DESC5'),
                        value: [
                            '```js',
                            message.translate('Dono/bug:HBUG_DESC6'),
                            `${settings.prefix}eval message.client.users.fetch('${message.author.id}').then(u => {`,
                            `  u.send(\`**${message.translate('Dono/bug:HBUG_DESC9')}\`)`,
                            `})`,
                            '\n',
                            message.translate('Dono/bug:HBUG_DESC8'),
                            `${settings.prefix}eval message.client.channels.cache.get('${message.channel.id}').send(\`**${message.translate('Dono/bug:HBUG_DESC9')}\`)`,
                            '```'
                        ].join('\n')
                    })
                    .addField(message.translate('Dono/bug:HBUG_DESC10'), message.guild.name, true)
                    .addField(message.translate('Dono/bug:HBUG_DESC11'), date, true)
                if (dev) {
                    dev.send({ embeds: [embed] }).then(() => {
                    }).catch(() => {
                        return message.channel.send(message.translate('Dono/bug:HBUG_DESC12', { prefix: settings.prefix }));
                    })
                } else {
                    return message.channel.send(message.translate('Dono/bug:HBUG_DESC12', { prefix: settings.prefix }));
                }
                const embed2 = new Embed(bot, message.guild)
                    .setColor(0x0AA0A0)
                    .setAuthor({ name: message.translate('Dono/bug:HBUG_DESC13', { author: message.author.username }), iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
                    .setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
                    .addField(message.translate('Dono/bug:HBUG_DESC14'), message.translate('Dono/bug:HBUG_DESC15'))
                message.channel.send({ embeds: [embed2] });

                recent.add(user.id);
            }
        }
        setTimeout(() => {
            recent.delete(user.id);
        }, 300000);
    }
};