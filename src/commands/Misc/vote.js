// Dependências
const { Embed } = require(`../../utils`),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    { ActionRowBuilder, ButtonBuilder } = require('discord.js'),
    Command = require('../../structures/Command.js');
const { votesCheck } = require('../../database/models/index');
const Discord = require('discord.js');
//const webhookVote = new WebhookClient({ id: 'hookID', token: 'hookTOKEN' });
const ms = require('ms')

module.exports = class Vote extends Command {
    constructor(bot) {
        super(bot, {
            name: 'vote',
            aliases: ['votar', 'voto', 'votos', 'votes'],
            dirname: __dirname,
            botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
            description: 'Check your vote on Hope\'s botlits.',
            usage: '<prefix><commandName>',
            examples: [
                '.vote'
            ],
            cooldown: 3000,
        });
    }
    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        const votedUser = message.author.id
        //console.log(`${votedUser} acabou de votar.`)
        const member = message.guild.members.cache.get(votedUser);

        //Se conecta a Database pelo ID do usuario
        var dbVote = await votesCheck.findOne({ _id: message.author.id });
        if (!dbVote) {
            const newSettings = new votesCheck({
                _id: message.author.id,
            });
            await newSettings.save().catch(() => { });
            dbVote = await votesCheck.findOne({ _id: message.author.id });
        }

        const vote_number = dbVote.totalVotes + 1 || 1;

        let DBL_INTERVAL = 43200000;
        let UltimoVotoTopgg = dbVote.topgg;
        let UltimoVotoVdb = dbVote.vdb;
        let UltimoVotoDbl = dbVote.dbl;
        const votoscheck = UltimoVotoTopgg || UltimoVotoVdb || UltimoVotoDbl;
        let checkDBLVote = Date.now() - votoscheck < DBL_INTERVAL;

        //COMANDO DE VERIFICAR TEMPO PARA VOTAR
        let timeout = 43200000;

        if (checkDBLVote) {
            //let time = getReadableTime(timeout - (Date.now() - dbEconomia.cooldowns.cooldownDiario));
            const botões = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        //.setCustomId('topgg')
                        .setLabel('Top.gg')
                        .setStyle(5)
                        .setEmoji('<:topgg:880502401545674873>')
                        .setURL(bot.config.Botlist.Topgg),
                    new ButtonBuilder()
                        //.setCustomId('voidbots')
                        .setLabel('Void Bots')
                        .setStyle(5)
                        .setEmoji('<:voidbots:880502401902182472>')
                        .setURL(bot.config.Botlist.Voidbots),
                    new ButtonBuilder()
                        //.setCustomId('discordbotlist')
                        .setLabel('Discord Bot List')
                        .setStyle(5)
                        .setEmoji('<:discordbotlist:880502696782733332>')
                        .setURL(bot.config.Botlist.DiscordBotList),
                );
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Misc/vote:VOTE'), iconURL: bot.user.displayAvatarURL() })
                .setColor(5301186)
                .setTitle(message.translate('Misc/vote:VOTE1'))
                .setDescription(`<:topgg:880502401545674873> __**Top.gg**__\n${Date.now() - UltimoVotoTopgg < timeout ? `\`${message.translate('Misc/vote:VOTE3')} ${ms(UltimoVotoTopgg - Date.now() + timeout, { long: true })}\`` : message.translate('Misc/vote:VOTE2')}\n\n<:discordbotlist:880502696782733332> __**Discord Bot List**__\n${Date.now() - UltimoVotoDbl < timeout ? `\`${message.translate('Misc/vote:VOTE3')} ${ms(UltimoVotoDbl - Date.now() + timeout, { long: true })}\`` : message.translate('Misc/vote:VOTE5')}\n\n<:voidbots:880502401902182472> __**Void Bots**__\n${Date.now() - UltimoVotoVdb < timeout ? `\`${message.translate('Misc/vote:VOTE3')} ${ms(UltimoVotoVdb - Date.now() + timeout, { long: true })}\`` : message.translate('Misc/vote:VOTE4')}\n\n${message.translate('Misc/vote:VOTE6')}`)
                .setFooter({ text: `Você já votou ${vote_number} vezes.` });

            message.channel.send({ embeds: [embed], components: [botões] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else if (!checkDBLVote) {
            const botões = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        //.setCustomId('topgg')
                        .setLabel('Top.gg')
                        .setStyle(5)
                        .setEmoji('<:topgg:880502401545674873>')
                        .setURL(bot.config.Botlist.Topgg),
                    new ButtonBuilder()
                        //.setCustomId('discordbotlist')
                        .setLabel('Discord Bot List')
                        .setStyle(5)
                        .setEmoji('<:discordbotlist:880502696782733332>')
                        .setURL(bot.config.Botlist.DiscordBotList),
                    new ButtonBuilder()
                        //.setCustomId('discordbotlist')
                        .setLabel('Void Bots')
                        .setStyle(5)
                        .setEmoji('<:voidbots:880502401902182472>')
                        .setURL(bot.config.Botlist.Voidbots),
                );
            const embed = new Embed(bot, message.guild)
                .setAuthor({ name: message.translate('Misc/vote:VOTE'), iconURL: bot.user.displayAvatarURL() })
                .setColor(5301186)
                .setTitle(message.translate('Misc/vote:VOTE1'))
                .setDescription(`<:topgg:880502401545674873> __**Top.gg**__\n${Date.now() - UltimoVotoTopgg < timeout ? `\`${message.translate('Misc/vote:VOTE3')} ${ms(UltimoVotoTopgg - Date.now() + timeout, { long: true })}\`` : message.translate('Misc/vote:VOTE2')}\n\n<:discordbotlist:880502696782733332> __**Discord Bot List**__\n${Date.now() - UltimoVotoDbl < timeout ? `\`${message.translate('Misc/vote:VOTE3')} ${ms(UltimoVotoDbl - Date.now() + timeout, { long: true })}\`` : message.translate('Misc/vote:VOTE5')}\n\n<:voidbots:880502401902182472> __**Void Bots**__\n${Date.now() - UltimoVotoVdb < timeout ? `\`${message.translate('Misc/vote:VOTE3')} ${ms(UltimoVotoVdb - Date.now() + timeout, { long: true })}\`` : message.translate('Misc/vote:VOTE2')}\n\n${message.translate('Misc/vote:VOTE6')}`)
                .setFooter({ text: message.translate('Misc/vote:VOTE7', { votes: vote_number }) });

            message.channel.send({ embeds: [embed], components: [botões] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        }
    }
};
