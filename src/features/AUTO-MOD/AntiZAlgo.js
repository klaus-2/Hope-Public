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
	* [AUTO-MOD] ANTI-ZALGO (A̲̪͈͔̠̠͔͈͎͕͐͐̍̀̀́͂n͉̖͓͕̟̬̙̲̖̘͋͂̾̅͌́̌͑͂̀̓̚t͙̦̱̞̗̾̾͋͂͋̒̂͛̓̚̚i̥̫͔͉̮̣͚̒͆͂̽̎̈́̏̒̂ͅͅ Z̬̗̫̠͕̮͍͒̿͆͋́͊̒A̪͎̲̭̥̭͙͛͂̃̾̔̌̚L̖̠̗̩͓̦̪̦̰̤̀̓̃͛̆Ǧ̯͚̲̮̪̣̭̗̦͗̉̑͋̎̊̄̓Ȯ̲͔̝̮̰̦̙̰̅̍̈́̊̉̇̃ͅ T̳̣̣͔̰͙̟̫̎̒̑̎͛͋͗̿̄͌́E͉̜̯̤̟͙͖͖̫͉̅̎̆͒̔͆̅̎̂X͚͚̳̖̲̰̫͇͗͆̽̽T̫͍̫͕̠͚͌́̾̇̎)
	* ------------------------------------------------------------------------------------------------ */
	if (settings?.Auto_ModAntiZAlgo >= 1) {
		const splitMessage = message.content.split(/ +/);
		/*for (i = 0; i < splitMessage.length; i++) {
			const userMention = /^<@![0-9]{18}>$/gmi.test(splitMessage[i]);
			const roleMention = /^<@&[0-9]{18}>$/gmi.test(splitMessage[i]);
			const everyoneMention = /^@everyone$/gmi.test(splitMessage[i]);
			const hereMention = /^@here$/gmi.test(splitMessage[i]);
			if (userMention || roleMention || everyoneMention || hereMention) mentionCount++;
		}
		if (mentionCount > guildData.maxMentions) spam2 = true;*/

		function hasZalgo(text) {
			const re = /%CC%/gmi;
			return re.test(encodeURIComponent(text));
		}
		for (i = 0; i < splitMessage.length; i++) {
			if (hasZalgo(splitMessage[i]) == true) {
				// VERIFICA SE O CANAL ENCOTRADO É UM CANAL NA WHITELIST DO AUTO-MOD
				if (settings?.Auto_ModAntiZAlgoChannels?.includes(message.channel.id) || settings?.Auto_ModIgnoreChannel?.includes(message.channel.id)) {
					bot.logger.automod('[AUTO-MOD] Anti-ZAlgo: Uma mensagem com formato ZAlgo foi detectada em um canal na whitelist, ignorando ações ao usuario.');
					return;
				}
				// VERIFICA SE O CARGO ENCOTRADO É UM CARGO NA WHITELIST DO AUTO-MOD
				else if (message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModAntiZAlgoRole?.includes(r)) || message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModIgnoreRole?.includes(r))) {
					bot.logger.automod('[AUTO-MOD] Anti-ZAlgo: Uma mensagem com formato ZAlgo foi detectada com um cargo na whitelist, ignorando ações ao usuario.');
					return;
				}
				// VERIFICA SE O USER ENCOTRADO É UM USER NA WHITELIST DO AUTO-MOD
				else if (settings?.Auto_ModAntiZAlgoChannel?.includes(message.channel.id) || settings?.Auto_ModIgnoreUser?.includes(member.id)) {
					bot.logger.automod('[AUTO-MOD] Anti-ZAlgo: Uma mensagem com formato ZAlgo detectada por um usuario na whitelist, ignorando ações ao usuario.');
					return;
				}
				else {
					// EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
					bot.logger.automod(`[AUTO-MOD] Anti-ZAlgo: Uma mensagem com formato ZAlgo foi detectada, iniciando ações [${settings?.Auto_ModAntiZAlgo}] adequadas ao usuario.`);

					if (settings?.Auto_ModAntiZAlgo == 1) deleteMessage(message);
					if (settings?.Auto_ModAntiZAlgo == 2) warnMember(bot, message, `${settings?.Auto_ModAntiZAlgoTime ?? '3m'} [Hope AUTO-MOD] Anti-ZAlgo.`, settings);
					if (settings?.Auto_ModAntiZAlgo == 3) warnDelete(bot, message, `${settings?.Auto_ModAntiZAlgoTime ?? '3m'} [Hope AUTO-MOD] Anti-ZAlgo.`, settings);

					return false;
					//break;
				}
			}
		}
	}

	/** ------------------------------------------------------------------------------------------------
	* CERTIFICA DE QUE APENAS UM USUARIO QUE DEVA SER PUNIDO, SEJA PUNIDO!
	* ------------------------------------------------------------------------------------------------ */
	return true;
};
