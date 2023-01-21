// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	delay = ms => new Promise(res => setTimeout(res, ms)),
	Event = require('../../structures/Event');

module.exports = class voiceStateUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, oldState, newState) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: newState.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: newState.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: newState.guild.id });
		}

		// variables for easier coding
		const newMember = newState.guild.members.cache.get(newState.id);
		const channel = newState.guild.channels.cache.get(newState.channel?.id ?? newState.channelId);


		// Get server settings / if no settings then return
		const settings = newState.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Se o usuario for um bot, não registrará o log
		if (newState.id == bot.user.id) return;
		if (newState.bot == true) return;

		//Se conecta a Database pelo ID do usuario
		/*const dbPontos = await PontosSchema.findOne({
			_id: newMember.id,
		});

		if (!dbPontos) {

			const novaDB = await PontosSchema.create({
				_id: newMember.id,
			});

			await novaDB.save().catch(() => { })
		}

		//Se conecta a Database pelo ID do usuario
		const dbPontosUser = await PontosUserSchema.findOne({
			_id: newMember.id,
		});

		if (!dbPontosUser) {

			const novaDBB = await PontosUserSchema.create({
				_id: newMember.id,
			});

			await novaDBB.save().catch(() => { })
		}

		let interval;

		if (oldState.channelId === newState.channelId) return;
		else if ((!oldState.channelId || oldState.channelId === newState.guild.afkChannelID) && newState.channelId && newState.channelId !== newState.guild.afkChannelID) { // Joining channel that is not AFK
			console.log('entrou no voice')
			newMember.interval = setInterval(async function () {
				const padd = math.evaluate(`${dbPontos.registros.pontosVoice} + 1`)
				dbPontos.registros.pontosVoice = padd;
				await dbPontos.save().catch(() => { });
				const puadd = math.evaluate(`${dbPontosUser.banco.pontosAtual} + 1`)
				dbPontosUser.banco.pontosAtual = puadd;
				const puaddd = math.evaluate(`${dbPontosUser.banco.pontosTotal} + 1`)
				dbPontosUser.banco.pontosTotal = puaddd;
				await dbPontosUser.save().catch(() => { });
			}, 60000);
		}
		if (oldState.channelId && (oldState.channelId !== newState.guild.afkChannelID && !newState.channelId || newState.channelId === newState.guild.afkChannelID)) {
			console.log('saiu do voice')
			clearInterval(newMember.interval);
			interval = undefined;
		}*/

		// VERIFICA SE O USUARIO DESATIVOU O AUDIO
		if (logDB.ServerEvents.VoiceDeafenToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = `${newState.serverDeaf ? '#4bd37b' : '#fd003a'}`;

			let embed, updated = false;

			// member has been server (un)deafened
			if (oldState.serverDeaf != newState.serverDeaf) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE')} ${newMember} ${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE1')} ${newState.serverDeaf ? '' : newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE2')}${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE3')} ${channel.toString()}**`)
					.setColor(color)
					.setTimestamp()
					.setFooter({ text: `${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE4')} ${newMember.id}` })
					.setAuthor({ name: `${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE5')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` });

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newState.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}

		// ENTROU NO CANAL DE VOZ
		if (logDB.ServerEvents.VoiceJoinToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = '#4bd37b';

			let embed, updated = false;

			if (!oldState.channelId && newState.channelId) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**A user has just joined a voice channel.**`)
					.setColor(color)
					.addFields({ name: 'User', value: `${newState.member}`, inline: true },
						{ name: 'Channel', value: `<#${newState.channel.id}>`, inline: true })
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id} | Channel: ${newState.channel.id}` })
					.setAuthor({ name: `[EVENT — A USER HAS JOINED A VOICE CHANNEL]`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` });

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newState.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}

		// SAIU DO CANAL DE VOZ
		if (logDB.ServerEvents.VoiceJoinToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = '#fd003a';

			let embed, updated = false;

			// member has been server (un)deafened
			if (oldState.channelId && !newState.channelId) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**A user has just left a voice channel.**`)
					.setColor(color)
					.addFields({ name: 'User', value: `${newState.member}`, inline: true },
						{ name: 'Channel', value: `<#${oldState.channel.id}>`, inline: true })
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id} | Channel: ${oldState.channel.id}` })
					.setAuthor({ name: `[EVENT — A USER HAS LEFT A VOICE CHANNEL]`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` });

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newState.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}

		// FOI MOVIDO DO CANAL DE VOZ
		if (logDB.ServerEvents.VoiceMoveToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 16086051;

			let embed, updated = false;

			if (oldState.channelId && newState.channelId) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**A user has just switched voice channels.**`)
					.setColor(color)
					.addFields({ name: 'Old Channel', value: `<#${oldState.channel.id}>`, inline: true },
						{ name: 'New Channel', value: `<#${newState.channel.id}>`, inline: true })
					.setTimestamp()
					.setFooter({ text: `Old Channel: ${oldState.channel.id} | New Channel: ${newState.channel.id}` })
					.setAuthor({ name: `[EVENT — A USER WAS MOVED FROM A VOICE CHANNEL]`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` });

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newState.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
		// VERIFICA SE O USUARIO REATIVOU O AUDIO
		if (logDB.ServerEvents.VoiceDeafenToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = `${newState.serverMute ? '#fd003a' : '#4bd37b'}`;

			let embed, updated = false;

			if (oldState.serverMute != newState.serverMute) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE6')} ${newMember} ${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE7')} ${newState.serverMute ? '' : newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE8')}${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE9')} ${channel.toString()}**`)
					.setColor(color)
					.setTimestamp()
					.setFooter({ text: `${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE10')} ${newMember.id}` })
					.setAuthor({ name: `${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE11')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` });

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newState.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
		// VERIFICA SE O USUARIO INICOU UMA TRANSMISSÃO
		if (logDB.ServerEvents.VoiceStreamingToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = `${newState.streaming ? '#4bd37b' : '#fd003a'}`;

			let embed, updated = false;

			if (oldState.streaming != newState.streaming) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**${newMember} ${newState.streaming ? newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE12') : newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE13')} ${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE14')} ${channel.toString()}**`)
					.setColor(color)
					.setTimestamp()
					.setFooter({ text: `${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE15')} ${newMember.id}` })
					.setAuthor({ name: `${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE16')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` });
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newState.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}

		// Only keep the bot in the voice channel by its self for 3 minutes
		/* const player = bot.manager?.players.get(newState.guild.id);

		if (!player) return;
		if (!newState.guild.members.cache.get(bot.user.id).voice.channelId) player.destroy();

		// Check for stage channel audience change
		if (newState.id == bot.user.id && channel?.type == 'GUILD_STAGE_VOICE') {
			if (!oldState.channelId) {
				try {
					await newState.guild.me.voice.setSuppressed(false);
				} catch (err) {
					player.pause(true);
				}
			} else if (oldState.suppress !== newState.suppress) {
				player.pause(newState.suppress);
			}
		} */


		if (oldState.id === bot.user.id) return;
		if (!oldState.guild.members.cache.get(bot.user.id).voice.channelId) return;

		// Don't leave channel if 24/7 mode is active
		// if (player.twentyFourSeven) return;

		// Make sure the bot is in the voice channel that 'activated' the event
		/* if (oldState.guild.members.cache.get(bot.user.id).voice.channelId === oldState.channelId) {
			if (oldState.guild.me.voice?.channel && oldState.guild.me.voice.channel.members.filter(m => !m.user.bot).size === 0) {
				const vcName = oldState.guild.me.voice.channel.name;
				await delay(180000);

				// times up check if bot is still by themselves in VC (exluding bots)
				const vcMembers = oldState.guild.me.voice.channel?.members.size;
				 if (!vcMembers || vcMembers === 1) {
					 const newPlayer = bot.manager?.players.get(newState.guild.id);
					(newPlayer) ? player.destroy() : newState.guild.me.voice.disconnect();
					const embed = new Embed(bot, newState.guild)
						// eslint-disable-next-line no-inline-comments
						.setDescription(`${newState.guild.translate('Events/voiceStateUpdate:VOICE_STATE_UPDATE17', { vcName: vcName, prefix: settings.prefix })}`);
					// If you are a [Premium](${bot.config.websiteURL}/premium) member, you can disable this by typing ${settings.prefix}24/7.`);
					//Disconnected due to inactivity. If you want me to stay in the voice channel 24/7, you can get Premium at https://rythm.fm/premium
					try {
						const c = bot.channels.cache.get(player.textChannel);
						if (c) c.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
					} catch (err) {
						bot.logger.error(err.message);
					}
				} 
			}
		} */
	}
};
