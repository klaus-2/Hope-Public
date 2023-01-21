// Dependências
const { WarningSchema, timeEventSchema } = require('../database/models'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ time: { getTotalTime }, Embed } = require('../utils');

module.exports.run = (bot, message, member, wReason, settings) => {
	const modos = {
		kick: message.translate('Helpers/warningSystem:WARNING1'),
		ban: message.translate('Helpers/warningSystem:WARNING2')
	};

	/** ------------------------------------------------------------------------------------------------
	* OBTÉM DADOS DO USUARIO PELO BANCO DE DADOS DE AVISOS
	* ------------------------------------------------------------------------------------------------ */
	WarningSchema.find({
		userID: member.user.id,
		guildID: message.guild.id,
	}, async (err, res) => {
		if (err) {
			bot.logger.error(`Command: 'warn' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// Obtém o canal de logs
		const logChannel = await message.guild.channels.cache.find((ch) => ch.id === settings.Auto_ModLogChannel);

		/** ------------------------------------------------------------------------------------------------
		* GERA A PRIMEIRA ADVERTENCIA DO USUARIO
		* ------------------------------------------------------------------------------------------------ */
		let newWarn, embed;
		if (!res[0]) {
			/** ------------------------------------------------------------------------------------------------
			* DEBUG MODE
			* ------------------------------------------------------------------------------------------------ */
			if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the first time in guild: ${message.guild.id}`);

			try {
				/** ------------------------------------------------------------------------------------------------
				* SALVA A PRIMEIRA ADVERTENCIA NO BANCO DE DADOS
				* ------------------------------------------------------------------------------------------------ */
				newWarn = new WarningSchema({
					userID: member.user.id,
					guildID: message.guild.id,
					Reason: wReason,
					Moderater: (message.author.id == member.user.id) ? bot.user.id : message.author.id,
					IssueDates: new Date().toUTCString(),
				});

				await newWarn.save();
				/** ------------------------------------------------------------------------------------------------
				* ENVIA ALERTA DA ADVERTENCIA NO CANAL DA OCORRENCIA E NO PRIVADO DO USUARIO
				* ------------------------------------------------------------------------------------------------ */
				//ALERTA NO CANAL			
				embed = new Embed(bot, message.guild)
					.setColor(15158332)
					.setAuthor({ name: message.translate('misc:SUCCESSFULL_WARN', { user: member.user.username }), iconURL: member.user.displayAvatarURL() })
					.setDescription(message.translate('misc:REASON1', { reason: wReason }));
				message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 }));

				//ALERTA NO PRIVADO
				const Moderater = (message.author.id == member.user.id) ? bot.user.id : message.author.id
				let automod;
				if (Moderater == bot.user.id) automod = '[AUTO-MOD]'

				embed = new Embed(bot, message.guild)
					.setTitle('Helpers/warningSystem:WARNING_SYSTEM')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.translate('Helpers/warningSystem:WARNING_SYSTEM1', { guild: message.guild.name }))
					.addFields({ name: message.translate('Helpers/warningSystem:WARNING_SYSTEM2'), value: `<@${Moderater}> ${automod}`, inline: true },
						{ name: message.translate('Helpers/warningSystem:WARNING_SYSTEM3'), value: wReason, inline: true },
						{ name: message.translate('Helpers/warningSystem:WARNING_SYSTEM4'), value: `${res.length + 1}/${settings.Auto_ModWarningCounter}`, inline: false })
					.setFooter({ text: message.translate('Helpers/warningSystem:WARNING3', { limit: settings.Auto_ModWarningCounter, punish: modos[settings.Auto_ModOption] }) });
				// eslint-disable-next-line no-empty-function
				member.send({ embeds: [embed] }).catch(() => { });

				// LOG CHANNEL
				if (logChannel) {
					embed = new Embed(bot, message.guild)
						.setColor(15158332)
						.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
						.setDescription(`User has been punished for violating ${wReason}\nThis is the ${res.length + 1} time this has occurred.`);
					logChannel.send({ embeds: [embed] });
				}
				/** ------------------------------------------------------------------------------------------------
				* CAPTURA ALGUM ERROR
				* ------------------------------------------------------------------------------------------------ */
			} catch (err) {
				bot.logger.error(`${err.message} when running command: warnings.`);
				message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			/** ------------------------------------------------------------------------------------------------
			* GERA A SEGUNDA ADVERTENCIA DO USUARIO
			* ------------------------------------------------------------------------------------------------ */
			//SALVA A SEGUNDA ADVERTENCIA NO BANCO DE DADOS
			newWarn = new WarningSchema({
				userID: member.user.id,
				guildID: message.guild.id,
				Reason: wReason,
				Moderater: (message.author.id == member.user.id) ? bot.user.id : message.author.id,
				IssueDates: new Date().toUTCString(),
			});

			await newWarn.save();

			const limite = res.length + 1 == settings.Auto_ModWarningCounter

			/** ------------------------------------------------------------------------------------------------
			* VERIFICA SE É REALMENTE A SEGUNDA ADVERTENCIA
			* ------------------------------------------------------------------------------------------------ */
			if (res.length < res.length + 1 && !limite) {
				/** ------------------------------------------------------------------------------------------------
				* SE FOR A SEGUNDA ADVERTENCIA, ENTÃO MUTARÁ O USUARIO POR UM DETERMINADO TEMPO
				* ------------------------------------------------------------------------------------------------ */
				message.args = [member.user.id, `${settings?.Auto_ModTime ?? '5m'}`];
				bot.commands.get('mute').run(bot, message, settings);
				const Moderater = (message.author.id == member.user.id) ? bot.user.id : message.author.id
				let automod;
				if (Moderater == bot.user.id) automod = '[AUTO-MOD]'
				/** ------------------------------------------------------------------------------------------------
				* ENVIA ALERTA DA ADVERTENCIA NO CANAL DA OCORRENCIA E NO PRIVADO DO USUARIO
				* ------------------------------------------------------------------------------------------------ */
				//ALERTA NO CANAL
				embed = new Embed(bot, message.guild)
					.setColor(15158332)
					.setAuthor({ name: message.translate('misc:SUCCESSFULL_WARN', { user: member.user.username }), iconURL: member.user.displayAvatarURL() })
					.setDescription(message.translate('misc:REASON1', { reason: wReason }));
				message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 }));
				if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the second time in guild: ${message.guild.id}`);

				//ALERTA NO PRIVADO
				embed = new Embed(bot, message.guild)
					.setTitle('Helpers/warningSystem:WARNING_SYSTEM')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.translate('Helpers/warningSystem:WARNING_SYSTEM6', { guild: message.guild.name }))
					.addFields({ name: message.translate('Helpers/warningSystem:WARNING_SYSTEM2'), value: `<@${Moderater}> ${automod}`, inline: true },
						{ name: message.translate('Helpers/warningSystem:WARNING_SYSTEM3'), value: wReason, inline: true },
						{ name: message.translate('Helpers/warningSystem:WARNING_SYSTEM4'), value: `${res.length + 1}/${settings.Auto_ModWarningCounter}`, inline: false })
					.setFooter({ text: message.translate('Helpers/warningSystem:WARNING3', { limit: settings.Auto_ModWarningCounter, punish: modos[settings.Auto_ModOption] }) });
				// eslint-disable-next-line no-empty-function
				member.send({ embeds: [embed] }).catch(() => { });

				// LOG CHANNEL
				if (logChannel) {
					embed = new Embed(bot, message.guild)
						.setColor(15158332)
						.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
						.setDescription(`User has been punished for violating ${wReason}\nThis is the ${res.length + 1} time this has occurred.`);
					logChannel.send({ embeds: [embed] });
				}
			} else {
				//DEBUG MODE
				if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the third time in guild: ${message.guild.id}`);
				/** ------------------------------------------------------------------------------------------------
				* GERA A TERCEIRA ADVERTENCIA DO USUARIO
				* ------------------------------------------------------------------------------------------------ */
				try {
					const Moderater = (message.author.id == member.user.id) ? bot.user.id : message.author.id
					let automod;
					if (Moderater == bot.user.id) automod = '[AUTO-MOD]'
					/** ------------------------------------------------------------------------------------------------
					* VERIFICA O MODO DE PUNIÇÃO E A APLICA
					* ------------------------------------------------------------------------------------------------ */
					//EXPULSA O USUARIO QUANDO ATINGIR 3 ADVERTENCIAS
					if (settings.Auto_ModOption == 'kick') {
						//ALERTA NO CANAL
						embed = new Embed(bot, message.guild)
							.setColor(15158332)
							.setAuthor({ name: message.translate('misc:SUCCESSFULL_WARN', { user: member.user.username }), iconURL: member.user.displayAvatarURL() })
							.setDescription(message.translate('misc:REASON1', { reason: wReason }));
						message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 }));

						//ALERTA NO PRIVADO
						embed = new Embed(bot, message.guild)
							.setTitle('Helpers/warningSystem:WARNING_SYSTEM')
							.setColor(15158332)
							.setThumbnail(message.guild.iconURL())
							.setDescription(message.translate('Addons/auto-mod:AUTOMOD96', { guild: message.guild.name, wReason: wReason, limit: settings.Auto_ModWarningCounter }))
							.addFields({ name: message.translate('Helpers/warningSystem:WARNING_SYSTEM2'), value: `<@${Moderater}> ${automod}`, inline: true })
						// eslint-disable-next-line no-empty-function
						await message.guild.members.cache.get(member.user.id).send({ embeds: [embed] }).catch(() => { });

						// LOG CHANNEL
						if (logChannel) {
							embed = new Embed(bot, message.guild)
								.setColor(15158332)
								.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
								.setDescription(`User has been punished for violating ${wReason}\nThis is the ${res.length + 1} time this has occurred.`);
							logChannel.send({ embeds: [embed] });
						}

						bot.logger.automod(`${member.user.username} foi kickado no servidor ${message.guild.name}. Motivo: [3ª advertencia]`)
						//EVENTO KICK
						// if (member.roles.highest.comparePositionTo(message.guild.members.me.roles.highest) >= 0) 
						await message.guild.members.cache.get(member.user.id).kick(wReason);
						//DELETA A 3 ADVERTENCIA DO BANCO DE DADOS PARA QUANDO O USUARIO RETORNAR, HAVER 2 ADVERTENCIA.
						await WarningSchema.collection.deleteOne({ userID: member.user.id, guildID: message.guild.id });
						message.channel.success('Helpers/warningSystem:KICKED', { USER: member.user.tag }).then(m => m.timedDelete({ timeout: 3500 }));
						//BANE O USUARIO QUANDO ATINGIR 3 ADVERTENCIAS
					} else if (settings.Auto_ModOption == 'ban') {
						//ALERTA NO CANAL
						embed = new Embed(bot, message.guild)
							.setColor(15158332)
							.setAuthor({ name: message.translate('misc:SUCCESSFULL_WARN', { user: member.user.username }), iconURL: member.user.displayAvatarURL() })
							.setDescription(message.translate('misc:REASON1', { reason: wReason }));
						message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 }));

						//ALERTA NO PRIVADO
						embed = new Embed(bot, message.guild)
							.setTitle('Helpers/warningSystem:WARNING_SYSTEM')
							.setColor(15158332)
							.setThumbnail(message.guild.iconURL())
							.setDescription(message.translate('Addons:auto-mod/AUTOMOD97', { guild: message.guild.name, wReason: wReason, limit: settings.Auto_ModWarningCounter }))
							.addFields({ name: message.translate('Helpers/warningSystem:WARNING_SYSTEM2'), value: `<@${Moderater}> ${automod}`, inline: true })
						// eslint-disable-next-line no-empty-function
						await message.guild.members.cache.get(member.user.id).send({ embeds: [embed] }).catch(() => { });

						// LOG CHANNEL
						if (logChannel) {
							embed = new Embed(bot, message.guild)
								.setColor(15158332)
								.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
								.setDescription(`User has been punished for violating ${wReason}\nThis is the ${res.length + 1} time this has occurred.`);
							logChannel.send({ embeds: [embed] });
						}

						bot.logger.automod(`${member.user.username} foi banido no servidor ${message.guild.name}. Motivo: [${settings.Auto_ModWarningCounter}ª advertencia.]`)
						//EVENTO BAN
						// if (member.roles.highest.comparePositionTo(message.guild.members.me.roles.highest) >= 0) 
						await message.guild.members.cache.get(member.user.id).ban({ reason: wReason });
						//DELETA A 3 ADVERTENCIA DO BANCO DE DADOS PARA QUANDO O USUARIO RETORNAR, HAVER 2 ADVERTENCIA.
						await WarningSchema.collection.deleteOne({ userID: member.user.id, guildID: message.guild.id });
						message.channel.success('Helpers/warningSystem:KICKED', { USER: member.user.tag }).then(m => m.timedDelete({ timeout: 3500 }));
					}
					/** ------------------------------------------------------------------------------------------------
					* CAPTURA ALGUM ERROR
					* ------------------------------------------------------------------------------------------------ */
				} catch (err) {
					bot.logger.error(`${err.message} when kicking user.`);
					message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
			}
		}

		/** ------------------------------------------------------------------------------------------------
		* VERIFICA SE A ADVERTENCIA É TEMPORARIA
		* ------------------------------------------------------------------------------------------------ */
		const possibleTime = wReason.split(' ')[0];
		if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
			const time = getTotalTime(possibleTime, message);
			if (!time.success) return;
			//CONECTA AO BANCO DE DADOS
			const newEvent = new timeEventSchema({
				userID: member.user.id,
				guildID: message.guild.id,
				time: new Date(new Date().getTime() + time.success),
				channelID: message.channel.id,
				type: 'warn',
			});
			await newEvent.save();

			/** ------------------------------------------------------------------------------------------------
			* DELETA A ADVERTENCIA DO BANCO DE DADOS QUANDO O TEMPO FINAL CHEGAR
			* ------------------------------------------------------------------------------------------------ */
			setTimeout(async () => {
				//DELETA A ADVERTENCIA NA DB
				await WarningSchema.findByIdAndRemove(newWarn._id);
				//DELETA O EVENTO TEMPORARIO NA DB
				await timeEventSchema.findByIdAndRemove(newEvent._id);
			}, time.success);
		}
		/** ------------------------------------------------------------------------------------------------
		* SE O LOGS DE EVENTOS ESTIVER ATIVADO, ENTÃO ENVIA UM ALERTA DE AVISO/BAN/KICK PARA O CANAL
		* ------------------------------------------------------------------------------------------------ */
		await bot.emit('warning', member, newWarn);
	});
};