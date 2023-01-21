/** ------------------------------------------------------------------------------------------------
* SE A OPÇÃO FOR 2, ENTÃO O AUTO-MOD APENAS APLICARÁ UMA AVISO AO USUARIO
* ------------------------------------------------------------------------------------------------ */
async function warnMember(bot, message, wReason, settings) {
    const member = message.guild.members.cache.get(message.author.id);
    await require('../../helpers/HopeWarningsModule').run(bot, message, member, wReason, settings);
}
/** ------------------------------------------------------------------------------------------------
* SE A OPÇÃO FOR 3, ENTÃO O AUTO-MOD APLICARÁ UM AVISO AO USUARIO E DELETARÁ A MENSAGEM
* ------------------------------------------------------------------------------------------------ */
function warnDelete(bot, message, wReason, settings) {
    if (message.deletable) message.delete();
    warnMember(bot, message, wReason, settings);
}
/** ------------------------------------------------------------------------------------------------
* SE A OPÇÃO FOR 1, ENTÃO O AUTO-MOD APENAS DELETARÁ A MENSAGEM DO USUARIO
* ------------------------------------------------------------------------------------------------ */
function deleteMessage(message) {
    if (message.deletable) message.delete();
}

module.exports.run = (bot, message, settings) => {

    // CERTIFICA DE QUE O USUARIO NÃO SEJA UM BOT
    if (settings?.ModerationIgnoreBotToggle && message.author.bot) return;
    // OBTÉM O CARGO
    //const roles = message.guild.members.cache.get(message.author.id)._roles;
    // OBTÉM O USUARIO
    const member = message.guild.members.cache.get(message.author.id);

    /** ------------------------------------------------------------------------------------------------
    * [AUTO-MOD] ANTI-MASS_MENTIONS (Anti excessive mentinons)
    * ------------------------------------------------------------------------------------------------ */

    // VERIFICA SE O ADDON ANTI-MASS_MENTIONS ESTÁ ATIVO
    if (settings?.Auto_ModAntiMassMentions >= 1) {
        //const mentionNumber = ((message.mentions.users) ? message.mentions.users.size : 0) + ((message.mentions.roles) ? message.mentions.roles.size : 0);
        //if (mentionNumber >= settings?.Auto_ModAntiMassMentionsLimit) {
        const MentionRegex = /<@[!&]?(\d{17,19})>/g;
        const UserRegex = /<@!?(\d{17,19})>/g;
        const RoleRegex = /<@&(\d{17,19})>/g;
        const mentionNumber = message.content.match(MentionRegex) || message.content.match(UserRegex) || message.content.match(RoleRegex);
        if (mentionNumber == null) return;
        if (mentionNumber.length > settings?.Auto_ModAntiMassMentionsLimit) {
            // VERIFICA SE O CANAL ENCOTRADO É UM CANAL NA WHITELIST DO AUTO-MOD
            if (settings?.Auto_ModAntiMassMentionsChannels?.includes(message.channel.id) || settings?.Auto_ModIgnoreChannel?.includes(message.channel.id)) {
                bot.logger.automod('[AUTO-MOD] Anti-MassMentions: Uma mensagem com varias menções foi detectada em um canal na whitelist, ignorando ações ao usuario.');
                return;
            }
            // VERIFICA SE O CARGO ENCOTRADO É UM CARGO NA WHITELIST DO AUTO-MOD
            else if (message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModAntiMassMentionsRole?.includes(r)) || message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModIgnoreRole?.includes(r))) {
                bot.logger.automod('[AUTO-MOD] Anti-MassMentions: Uma mensagem com varias menções foi detectada com um cargo na whitelist, ignorando ações ao usuario.');
                return;
            }
            // VERIFICA SE O USER ENCOTRADO É UM USER NA WHITELIST DO AUTO-MOD
            else if (settings?.Auto_ModAntiMassMentionsUser?.includes(member.id) || settings?.Auto_ModIgnoreUser?.includes(member.id)) {
                bot.logger.automod('[AUTO-MOD] Anti-MassMentions: Uma mensagem com varias menções detectada por um usuario na whitelist, ignorando ações ao usuario.');
                return;
            }
            else {
                // EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
                bot.logger.automod(`[AUTO-MOD] Anti-MassMentions: Uma mensagem com varias menções foi detectada, iniciando ações [${settings?.Auto_ModAntiMassMentions}] adequadas ao usuario.`);

                if (settings?.Auto_ModAntiMassMentions == 1) deleteMessage(message);
                if (settings?.Auto_ModAntiMassMentions == 2) warnMember(bot, message, `${settings?.Auto_ModAntiMassMentionsTime ?? '3m'} [Hope AUTO-MOD] Anti-MassMentions.`, settings);
                if (settings?.Auto_ModAntiMassMentions == 3) warnDelete(bot, message, `${settings?.Auto_ModAntiMassMentionsTime ?? '3m'} [Hope AUTO-MOD] Anti-MassMentions.`, settings);

                return false;
            }
        }
    };   

    /** ------------------------------------------------------------------------------------------------
    * CERTIFICA DE QUE APENAS UM USUARIO QUE DEVA SER PUNIDO, SEJA PUNIDO!
    * ------------------------------------------------------------------------------------------------ */
    return true;
};
