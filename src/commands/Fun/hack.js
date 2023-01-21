// Dependências
const darkrandom = require("random"),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    darkemail = require("random-email"),
    darkpassword = require("generate-password"),
    Command = require('../../structures/Command.js');

module.exports = class Hack extends Command {
    constructor(bot) {
        super(bot, {
            name: 'hack',
            dirname: __dirname,
            description: "Hack someone! (fake).",
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            usage: '<prefix><commandName>',
            examples: [
                '.hack'
            ],
            cooldown: 10000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {

        if (settings.ModerationClearToggle && message.deletable) message.delete();

        const impostorpassword = darkpassword.generate({
            length: 10,
            numbers: true,
        });

        const user = message.mentions.users.first();
        if (!user) {
            return message.channel.send(message.translate('Fun/hack:HACK')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
        } else {
            if (user.bot) {
                return message.channel.send(message.translate('Fun/hack:HACK1')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
            }
        }
        const member = message.guild.members.cache.get(user.id);
        const mostCommon = [message.translate('Fun/hack:HACK2'), message.translate('Fun/hack:HACK3'), message.translate('Fun/hack:HACK3'), message.translate('Fun/hack:HACK4'), message.translate('Fun/hack:HACK5'), message.translate('Fun/hack:HACK6')];
        const lastdm = [
            message.translate('Fun/hack:HACK7'),
            message.translate('Fun/hack:HACK8'),
            message.translate('Fun/hack:HACK9'),
            message.translate('Fun/hack:HACK10'),
        ];


        message.channel.send(message.translate('Fun/hack:HACK11', { user: member.user.username })).then(async (msg) => {
            setTimeout(async function () {
                await msg.edit(message.translate('Fun/hack:HACK12')).catch(() => { });
            }, 5000);
            setTimeout(async function () {
                await msg.edit(
                    `[▝] ${message.translate('Fun/hack:HACK13')} \`${darkemail({
                        domain: "gmail.com",
                    })}\`\n${message.translate('Fun/hack:HACK14')} \`${impostorpassword}\``
                ).catch(() => { });
            }, 10000);
            setTimeout(async function () {
                await msg.edit(
                    `[▖] ${message.translate('Fun/hack:HACK15')} "${lastdm[Math.floor(Math.random() * lastdm.length)]}"`
                ).catch(() => { });
            }, 15000);
            setTimeout(async function () {
                await msg.edit(message.translate('Fun/hack:HACK16')).catch(() => { });
            }, 20000);
            setTimeout(async function () {
                await msg.edit(
                    `[▝] ${message.translate('Fun/hack:HACK17')} = "${mostCommon[Math.floor(Math.random() * mostCommon.length)]
                    }"`
                ).catch(() => { });
            }, 25000);
            setTimeout(async function () {
                await msg.edit(message.translate('Fun/hack:HACK18')).catch(() => { });
            }, 30000)
            setTimeout(async function () {
                await msg.edit(
                    `[▖] ${message.translate('Fun/hack:HACK19')} \`127.0.0.1:${darkrandom.int(100, 9999)}\``
                ).catch(() => { });
            }, 35000);
            setTimeout(async function () {
                await msg.edit(message.translate('Fun/hack:HACK20')).catch(() => { });
            }, 40000);
            setTimeout(async function () {
                await msg.edit(message.translate('Fun/hack:HACK21')).catch(() => { });
            }, 45000);
            setTimeout(async function () {
                await msg.edit(`${message.translate('Fun/hack:HACK22')} ${member.user.username}`).catch(() => { });
            }, 50000);
            setTimeout(async function () {
                await message.channel.send(
                    message.translate('Fun/hack:HACK23')
                ).catch(() => { });
            }, 55000);
        });
    }
}