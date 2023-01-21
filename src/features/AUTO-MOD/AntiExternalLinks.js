const validUrl = require("valid-url");

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
	* [AUTO-MOD] ANTI-EXTERNAL_LINKS (ANTI ALL URL)
	* ------------------------------------------------------------------------------------------------ */

	// VERIFICA SE O ADDON ANTI-EXTERNAL_LINKS ESTÁ ATIVO
	if (settings?.Auto_ModAntiExternalLinks >= 1) {
		//const expression = /^((?:https?:)?\/\/)?((?:www|m)\.)/g; //MELHORAR ESSE REGEX PQ N ESTA CAPTURANDO TODAS URL
		//const found = expression.test(message.content.toLowerCase());
		const args = message.content.trim().split(/ +/g);

		for (const arg of args) {
			if (validUrl.isUri(arg)) {
				// VERIFICA SE LINK ENCOTRADO É UM LINK NA WHITELIST DO AUTO-MOD
				if (validUrl.isUri(arg) == settings?.Auto_ModAntiExternalLinksAllowed) {
					bot.logger.automod('[AUTO-MOD] Anti-ExternalLinks: Um link foi detectado, porem é um link na whitelist, ignorando ações ao usuario.');
					return;
				}
				// VERIFICA SE O CANAL ENCOTRADO É UM CANAL NA WHITELIST DO AUTO-MOD
				if (settings?.Auto_ModAntiExternalLinksChannels?.includes(message.channel.id) || settings?.Auto_ModIgnoreChannel?.includes(message.channel.id)) {
					bot.logger.automod('[AUTO-MOD] Anti-ExternalLinks: Um link foi detectada em um canal na whitelist, ignorando ações ao usuario.');
					return;
				}
				// VERIFICA SE O CARGO ENCOTRADO É UM CARGO NA WHITELIST DO AUTO-MOD
				else if (message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModAntiExternalLinksRole?.includes(r)) || message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModIgnoreRole?.includes(r))) {
					bot.logger.automod('[AUTO-MOD] Anti-ExternalLinks: Um link foi detectado com um cargo na whitelist, ignorando ações ao usuario.');
					return;
				}
				// VERIFICA SE O USER ENCOTRADO É UM USER NA WHITELIST DO AUTO-MOD
				else if (settings?.Auto_ModAntiExternalLinksUser?.includes(member.id) || settings?.Auto_ModIgnoreUser?.includes(member.id)) {
					bot.logger.automod('[AUTO-MOD] Anti-ExternalLinks: Um link foi detectado por um usuario na whitelist, ignorando ações ao usuario.');
					return;
				}
				else {
					// EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
					bot.logger.automod(`[AUTO-MOD] Anti-ExternalLinks: Um link foi detectado, iniciando ações [${settings?.Auto_ModAntiExternalLinks}] adequadas ao usuario.`);

					if (settings?.Auto_ModAntiExternalLinks == 1) deleteMessage(message);
					if (settings?.Auto_ModAntiExternalLinks == 2) warnMember(bot, message, `${settings?.Auto_ModAntiExternalLinksTime ?? '3m'} [Hope AUTO-MOD] Anti-ExternalLinks.`, settings);
					if (settings?.Auto_ModAntiExternalLinks == 3) warnDelete(bot, message, `${settings?.Auto_ModAntiExternalLinksTime ?? '3m'} [Hope AUTO-MOD] Anti-ExternalLinks.`, settings);

					return false;
				}
			}
		}
	};

	/** ------------------------------------------------------------------------------------------------
	* CERTIFICA DE QUE APENAS UM USUARIO QUE DEVA SER PUNIDO, SEJA PUNIDO!
	* ------------------------------------------------------------------------------------------------ */
	return true;
};
