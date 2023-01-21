// Dependências
const { Embed } = require(`../../utils`),
	{ loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');
const Nickname = require(`../../database/models/nicknames`);
const Discord = require('discord.js');

module.exports = class guildMemberUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, oldMember, newMember) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: newMember.guild.id ? oldMember.guild.id : newMember.guild.id });
        if (!logDB) {
            const newSettings = new loggingSystem({
                _id: newMember.guild.id ? oldMember.guild.id : newMember.guild.id,
            });
            await newSettings.save().catch(() => { });
            logDB = await loggingSystem.findOne({ _id: newMember.guild.id ? oldMember.guild.id : newMember.guild.id });
        }

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${newMember.user.tag} foi atualizado no servidor: ${newMember.guild.name} [${newMember.guild.id}].`);

		// Check if guildMember is a partial
		if (oldMember.user.id == bot.user.id) return;

		// if the oldMember is not cached ignore.
		if (oldMember.partial) return;

		// get server settings
		const settings = newMember.guild.settings;
		if (Object.keys(settings).length == 0) return;

		/** ------------------------------------------------------------------------------------------------
		* [AUTO-MOD] ANTI-DEHOISTING (Anti dehoisting nicknames)
		* ------------------------------------------------------------------------------------------------ */
		if (settings.Auto_ModAntiDehoisting == true) {
			if (newMember.displayName.match(/^[^\w\s\d]/)) {
				// const char = newMember.displayName.codePointAt(0);
				// 🠷${newMember.displayName.slice(char <= 0xff ? 1 : 2)}
				const newNick = `CHANGE UR NAME — Hope AUTOMOD`;
				try {
					// EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
					if (bot.config.debug) bot.logger.automod(`[AUTO-MOD] Anti-Dehoisting: Um usuario foi detectado com hoisting, iniciando ações adequadas ao usuario.`);
					await newMember.setNickname(newNick, '[Hope AUTO-MOD] Anti-Dehoisting');
				} catch {
					//
				}
			}
		}


		/* const found = ['!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/']
		found.forEach(async function (nick, i) {
			if (newMember.displayName.includes(nick)) {
				const char = newMember.displayName.codePointAt(0);
				const newNick = `🠷${newMember.displayName.slice(char <= 0xff ? 1 : 2)}`;
				try {
					await newMember.setNickname(newNick, '[AUTO-MOD] Anti-Dehoisting');
				} catch {
					//
				}
			} else if (oldMember.displayName.includes(nick)) {
				const char = oldMember.displayName.codePointAt(0);
				const newNick = `🠷${oldMember.displayName.slice(char <= 0xff ? 1 : 2)}`;
				try {
					await oldMember.setNickname(newNick, '[AUTO-MOD] Anti-Dehoisting');
				} catch {
					//
				}
			}
		}) */


		// VERIFICA SE O APELIDO (NICKNAME) DO USUARIO FOI ALTERADO NO SERVIDOR
		if (logDB.ModerationEvents.NicknameToggle == true && logDB.ModerationEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MemberEvents.EmbedColor;
			if (color == "#000000") color = 16086051;
			let embed, updated = false;

			// nickname change
			if (oldMember.nickname != newMember.nickname) {
				embed = new Embed(bot, newMember.guild)
					.setDescription(`**${newMember.toString()} ${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE')}**`)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setThumbnail(`${newMember.user.displayAvatarURL()}`)
					.setColor(color)
					.setAuthor({ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE1')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields(
						{ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE2')}`, value: `${oldMember.nickname || newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE4')}`, inline: true },
						{ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE3')}`, value: `${newMember.nickname || newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE4')}`, inline: true })
					.setTimestamp();

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ModerationEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newMember.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newMember.guild.name} [${newMember.guild.id}]: ${err.message}.`);
				}
			}
		}
		// VERIFICA SE O USUARIO IMPULSIONOU O SERVIDOR
		if (logDB.ServerEvents.BoostToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MemberEvents.EmbedColor;
			if (color == "#000000") color = '#4bd37b';
			let embed, updated = false;

			// Procure ver se o usuário impulsionou o servidor
			if (!oldMember.premiumSince && newMember.premiumSince) {
				embed = new Embed(bot, newMember.guild)
					.setDescription(`<:Booster:823008269328318504> **${newMember.toString()} ${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE5')}**`)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setColor(color)
					.setThumbnail(`${newMember.user.displayAvatarURL()}`)
					.setAuthor({ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE6')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.setTimestamp();

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newMember.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newMember.guild.name} [${newMember.guild.id}]: ${err.message}.`);
				}
			}
		}
		// VERIFICA SE O USUARIO PAROU DE IMPULSIONAR O SERVIDOR
		if (logDB.ServerEvents.BoostToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MemberEvents.EmbedColor;
			if (color == "#000000") color = '#fd003a';
			let embed, updated = false;

			if (oldMember.premiumSince && !newMember.premiumSince) {
				embed = new Embed(bot, newMember.guild)
					.setDescription(`<:Booster:823008269328318504> **${newMember.toString()} ${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE7')} <:SkyeChoro2:823057602853863425>**`)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setColor(color)
					.setThumbnail(`${newMember.user.displayAvatarURL()}`)
					.setAuthor({ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE8')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.setTimestamp();

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newMember.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newMember.guild.name} [${newMember.guild.id}]: ${err.message}.`);
				}
			}
		}
		// VERIFICA SE O USUARIO ALTEROU O USERNAME
		if (logDB.MemberEvents.NameChangesToggle == true && logDB.MemberEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MemberEvents.EmbedColor;
			if (color == "#000000") color = 16086051;
			let embed, updated = false;

			if (oldMember.username !== newMember.username) {
				embed = new Embed(bot, newMember.guild)
					.setDescription(`**${newMember.toString()} ${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE9')}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setThumbnail(`${newMember.user.displayAvatarURL()}`)
					.setAuthor({ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE10')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields(
						{ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE11')}`, value: `${oldMember.name}`, inline: true },
						{ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE12')}`, value: `${newMember.name}`, inline: true },
					)
					.setTimestamp();

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.MemberEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newMember.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newMember.guild.name} [${newMember.guild.id}]: ${err.message}.`);
				}
			}
		}

		// look for role change
		if (logDB.ModerationEvents.RoleToggle == true && logDB.ModerationEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MemberEvents.EmbedColor;
			if (color == "#000000") color = 16086051;
			let embed, updated = false;

			const rolesAdded = newMember.roles.cache.filter(x => !oldMember.roles.cache.get(x.id));
			const rolesRemoved = oldMember.roles.cache.filter(x => !newMember.roles.cache.get(x.id));
			if (rolesAdded.size != 0 || rolesRemoved.size != 0) {
				const roleAddedString = [];
				for (const role of [...rolesAdded.values()]) {
					roleAddedString.push(role.toString());
				}
				const roleRemovedString = [];
				for (const role of [...rolesRemoved.values()]) {
					roleRemovedString.push(role.toString());
				}
				embed = new Embed(bot, newMember.guild)
					.setDescription(`**${newMember.toString()} ${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE13')}**`)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setColor(color)
					.setThumbnail(`${newMember.user.displayAvatarURL()}`)
					.setAuthor({ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE14')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields(
						{ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE15')} [${rolesAdded.size}]:`, value: `${roleAddedString.length == 0 ? newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE4') : roleAddedString.join('\n ')}`, inline: true },
						{ name: `${newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE16')} [${rolesRemoved.size}]:`, value: `${roleRemovedString.length == 0 ? newMember.guild.translate('Events/guildMemberUpdate:GUILD_MEMBER_UPDATE4') : roleRemovedString.join('\n ')}`, inline: true })
					.setTimestamp();

				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ModerationEvents.LogChannel).catch(() => {
						// do nothing.
					});
					if (modChannel && modChannel.guild.id == newMember.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newMember.guild.name} [${newMember.guild.id}]: ${err.message}.`);
				}
			}
		}

		// last 5 nicknames
		if (oldMember.nickname != newMember.nickname) {
			if (newMember.nickname == null || newMember.nickname == newMember.user.username) {
				return;
			} else {
				const user = await Nickname.findOne({
					discordId: newMember.id,
					guildId: oldMember.guild.id,
				})

				if (!user) {
					const newUser = new Nickname({
						discordId: newMember.id,
						guildId: oldMember.guild.id,
					})
					newUser.nicknames.push(newMember.nickname);
					newUser.save();
				} else {
					if (user.nicknames.length > 4) {
						user.nicknames.splice(-5, 1);
						user.nicknames.push(newMember.nickname);
					} else {
						user.nicknames.push(newMember.nickname);
					}
					user.save().catch(() => {
						// do nothing.
					});
				}
			}
		}
	}
};