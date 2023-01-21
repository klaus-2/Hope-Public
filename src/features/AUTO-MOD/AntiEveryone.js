const { PermissionsBitField: { Flags } } = require('discord.js');
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
    if (settings.ModerationIgnoreBotToggle && message.author.bot) return;
    // OBTÉM O CARGO
    //const roles = message.guild.members.cache.get(message.author.id)._roles;
    // OBTÉM O USUARIO
    const member = message.guild.members.cache.get(message.author.id);

	/** ------------------------------------------------------------------------------------------------
	* [AUTO-MOD] ANTI-EVERYONE (Anti @eveyone e @here)
	* ------------------------------------------------------------------------------------------------ */

	// VERIFICA SE O ADDON ANTI-EVERYONE ESTÁ ATIVO
	if (settings?.Auto_ModAntiEveryone >= 1) {
		if (message.content.includes("@everyone") || message.content.includes("@here")) {
			if (message.channel.permissionsFor(message.member).toArray().includes(Flags.MentionEveryone)) {
				bot.logger.automod('[AUTO-MOD] Anti-Everyone: Uma mensagem com @veryone ou @here foi detectada por um usuario com permissões "MENTION_EVERYONE", ignorando ações ao usuario.');
				return;
			}
			// VERIFICA SE O CANAL ENCOTRADO É UM CANAL NA WHITELIST DO AUTO-MOD
			else if (settings?.Auto_Auto_ModAntiEveryoneChannels?.includes(message.channel.id) || settings?.Auto_ModIgnoreChannel?.includes(message.channel.id)) {
				bot.logger.automod('[AUTO-MOD] Anti-Everyone: Uma mensagem com @veryone ou @here foi detectada em um canal na whitelist, ignorando ações ao usuario.');
				return;
			}
			// VERIFICA SE O CARGO ENCOTRADO É UM CARGO NA WHITELIST DO AUTO-MOD
			else if (message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_Auto_ModAntiEveryoneRole?.includes(r)) || message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModIgnoreRole?.includes(r))) {
				bot.logger.automod('[AUTO-MOD] Anti-Everyone: Uma mensagem com @veryone ou @here foi detectada com um cargo na whitelist, ignorando ações ao usuario.');
				return;
			}
			// VERIFICA SE O USER ENCOTRADO É UM USER NA WHITELIST DO AUTO-MOD
			else if (settings?.Auto_Auto_ModAntiEveryoneUser?.includes(member.id) || settings?.Auto_ModIgnoreUser?.includes(member.id)) {
				bot.logger.automod('[AUTO-MOD] Anti-Everyone: Uma mensagem com @veryone ou @here foi detectada por um usuário na whitelist, ignorando ações ao usuário.');
				return;
			}
			else {
				// EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
				bot.logger.automod(`[AUTO-MOD] Anti-Everyone: Uma mensagem com @everyone ou @here foi detectada, iniciando ações [${settings?.Auto_ModAntiEveryone}] adequadas ao usuario.`);

				if (settings?.Auto_ModAntiEveryone == 1) deleteMessage(message);
				if (settings?.Auto_ModAntiEveryone == 2) warnMember(bot, message, `${settings?.Auto_ModAntiEveryoneTime || '3m'} [Hope AUTO-MOD] Anti-Everyone.`, settings);
				if (settings?.Auto_ModAntiEveryone == 3) warnDelete(bot, message, `${settings?.Auto_ModAntiEveryoneTime || '3m'} [Hope AUTO-MOD] Anti-Everyone.`, settings);

				return false;
			}
		}
	};   

    /** ------------------------------------------------------------------------------------------------
    * CERTIFICA DE QUE APENAS UM USUARIO QUE DEVA SER PUNIDO, SEJA PUNIDO!
    * ------------------------------------------------------------------------------------------------ */
    return true;
};
