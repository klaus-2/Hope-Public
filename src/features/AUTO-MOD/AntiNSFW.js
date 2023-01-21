const validUrl = require("valid-url");
const axios = require('axios');

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
	* [AUTO-MOD] ANTI-NSFW (Anti Image/Links nsfw em um canal SFW)
	* ------------------------------------------------------------------------------------------------ */

	// VERIFICA SE O ADDON ANTI-NSFW ESTÁ ATIVO
	if (settings?.Auto_ModAntiNsfw >= 1) {
		const args = message.content.trim().split(/ +/g);
		if (args || message.attachments.size > 0) {

			for (const img of message.attachments) {
				axios.get('https://api.sightengine.com/1.0/check.json', {
					params: {
						'url': img,
						'models': 'nudity,wad,gore',
						'api_user': '671718818',
						'api_secret': 'zs9QqkjFYZWq5N3nozXT',
					}
				})
					.then(function (response) {
						// on success: handle response
						// console.log(response.data);
						if (response.data.nudity.safe < 0.80) {
							// VERIFICA SE O CANAL ENCOTRADO É UM CANAL NA WHITELIST DO AUTO-MOD
							if (settings?.Auto_ModAntiNsfwChannels?.includes(message.channel.id) || settings?.Auto_ModIgnoreChannel?.includes(message.channel.id)) {
								bot.logger.automod('[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada em um canal na whitelist, ignorando ações ao usuario.');
								return;
							} else
								// VERIFICA SE O CANAL ENCOTRADO É UM CANAL NA WHITELIST DO AUTO-MOD
								if (message.channel.nsfw) {
									bot.logger.automod('[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada em um canal NSFW, ignorando ações ao usuario.');
									return;
								}
								// VERIFICA SE O CARGO ENCOTRADO É UM CARGO NA WHITELIST DO AUTO-MOD
								else if (message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModAntiNsfwRole?.includes(r)) || message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModIgnoreRole?.includes(r))) {
									bot.logger.automod('[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada com um cargo na whitelist, ignorando ações ao usuario.');
									return;
								}
								// VERIFICA SE O USER ENCOTRADO É UM USER NA WHITELIST DO AUTO-MOD
								else if (settings?.Auto_ModAntiNsfwUser?.includes(member.id) || settings?.Auto_ModIgnoreUser?.includes(member.id)) {
									bot.logger.automod('[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada por um usuario na whitelist, ignorando ações ao usuario.');
									return;
								} else {
									// EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
									bot.logger.automod(`[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada, iniciando ações [${settings?.Auto_ModAntiNsfw}] adequadas ao usuario.`);

									if (settings?.Auto_ModAntiNsfw == 1) deleteMessage(message);
									if (settings?.Auto_ModAntiNsfw == 2) warnMember(bot, message, '[HOPE AUTO-MOD] Anti-NSFW.', settings);
									if (settings?.Auto_ModAntiNsfw == 3) warnDelete(bot, message, '[HOPE AUTO-MOD] Anti-NSFW.', settings);

									return false;
								}
						}
					})
					.catch(function (error) {
						// handle error
						if (error.response) console.log(error.response.data);
						else console.log(error.message);
					});
			}

			for (const arg of args) {
				if (validUrl.isUri(arg)) {
					axios.get('https://api.sightengine.com/1.0/check.json', {
						params: {
							'url': arg,
							'models': 'nudity,wad,gore',
							'api_user': '671718818',
							'api_secret': 'zs9QqkjFYZWq5N3nozXT',
						}
					})
						.then(function (response) {
							// on success: handle response
							// console.log(response.data);
							if (response.data.nudity.safe < 0.80) {
								// VERIFICA SE O CANAL ENCOTRADO É UM CANAL NA WHITELIST DO AUTO-MOD
								if (settings?.Auto_ModAntiNsfwChannels?.includes(message.channel.id) || settings?.Auto_ModIgnoreChannel?.includes(message.channel.id)) {
									bot.logger.automod('[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada em um canal na whitelist, ignorando ações ao usuario.');
									return;
								} else
									// VERIFICA SE O CANAL ENCOTRADO É UM CANAL NA WHITELIST DO AUTO-MOD
									if (message.channel.nsfw) {
										bot.logger.automod('[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada em um canal NSFW, ignorando ações ao usuario.');
										return;
									}
									// VERIFICA SE O CARGO ENCOTRADO É UM CARGO NA WHITELIST DO AUTO-MOD
									else if (message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModAntiNsfwRole?.includes(r)) || message.guild.members.cache.get(message.author.id)._roles.some(r => settings?.Auto_ModIgnoreRole?.includes(r))) {
										bot.logger.automod('[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada com um cargo na whitelist, ignorando ações ao usuario.');
										return;
									}
									// VERIFICA SE O USER ENCOTRADO É UM USER NA WHITELIST DO AUTO-MOD
									else if (settings?.Auto_ModAntiNsfwUser?.includes(member.id) || settings?.Auto_ModIgnoreUser?.includes(member.id)) {
										bot.logger.automod('[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada por um usuario na whitelist, ignorando ações ao usuario.');
										return;
									} else {
										// EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
										bot.logger.automod(`[AUTO-MOD] Anti-NSFW: Uma mensagem com conteudo NSFW foi detectada, iniciando ações [${settings?.Auto_ModAntiNsfw}] adequadas ao usuario.`);

										if (settings?.Auto_ModAntiNsfw == 1) deleteMessage(message);
										if (settings?.Auto_ModAntiNsfw == 2) warnMember(bot, message, `${settings?.Auto_ModAntiNsfwTime ?? '3m'} [Hope AUTO-MOD] Anti-NSFW.`, settings);
										if (settings?.Auto_ModAntiNsfw == 3) warnDelete(bot, message, `${settings?.Auto_ModAntiNsfwTime ?? '3m'} [Hope AUTO-MOD] Anti-NSFW.`, settings);

										return false;
									}
							}
						})
				}
			}
		}
	};

	/** ------------------------------------------------------------------------------------------------
	* CERTIFICA DE QUE APENAS UM USUARIO QUE DEVA SER PUNIDO, SEJA PUNIDO!
	* ------------------------------------------------------------------------------------------------ */
	return true;
};
