// Dependencies
const { Embed } = require('../../utils'),
	{ PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js'),
	{ ReactionRoleSchema, ticketEmbedSchema, ticketFunçõesSchema, ticketReação, loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

const ticketCooldownLol = new Set();
const moment = require('moment');

module.exports = class messageReactionAdd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, reaction, user) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: reaction.message.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: reaction.message.guild.id,
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: reaction.message.guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Uma reação foi adicionada em uma mensagem${!reaction.message.guild ? '' : ` no servidor: ${reaction.message.guild.name} [${reaction.message.guild.id}]`}`);

		// Make sure it's not a BOT and in a guild
		if (user.bot) return;
		if (!reaction.message.guild) return;

		// If reaction needs to be fetched
		try {
			if (reaction.partial) await reaction.fetch();
			if (reaction.message.partial) await reaction.message.fetch();
		} catch (err) {
			return bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${reaction.message.guild.name} [${reaction.message.guild.id}]: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = reaction.message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check for reaction
		const { guild } = reaction.message;
		// eslint-disable-next-line no-empty-function
		const member = await guild.members.fetch(user.id).catch(() => { });
		if (!member) return;

		//ticket stuff
		let db = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
		if (!db) {
			const newSettings = new ticketEmbedSchema({
				tembed_sID: guild.id,
			});
			await newSettings.save().catch(() => { });
			db = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
		}

		// TICKET REACTION
		if (db.ticketType === "reaction") {
			if (db.messageID.includes(reaction.message.id)) {
				// console.log(reaction.emoji.toString())
				// console.log(reaction.emoji.name ?? reaction.emoji.id)
				/* animated: null,
				  name: '😎',
				  id: null,
				  reaction: <ref *1> MessageReaction {
					message: Message {
					  channelId: '1026551541227864188',
					  guildId: '932060771423256616',
					  id: '1027904885699641344',
					  createdTimestamp: 1665142022300,
					  type: 0,
					  system: false,
					  content: '',
					  author: [ClientUser],
					  pinned: false,
					  tts: false,
					  nonce: null,
					  embeds: [Array],
					  components: [],
					  attachments: Collection(0) [Map] {},
					  stickers: Collection(0) [Map] {},
					  position: null,
					  editedTimestamp: null,
					  reactions: [ReactionManager],
					  mentions: [MessageMentions],
					  webhookId: null,
					  groupActivityApplication: null,
					  applicationId: null,
					  activity: null,
					  flags: [MessageFlagsBitField],
					  reference: null,
					  interaction: null
					},
					me: true,
					users: ReactionUserManager { reaction: [Circular *1] },
					_emoji: [Circular *2],
					count: 2
				  }
				} */
				// aq puxar da db ticketreação os dados da msg

				let serverCase = db.ticketCase;
				if (!serverCase || serverCase === null) serverCase = '1';

				let channelReact = reaction.message.guild.channels.cache.get(db.ticketReactChannel)
				let ticketRole = reaction.message.guild.roles.cache.get(db.supportRoleID);
				let ticketCategory = reaction.message.guild.channels.cache.get(db.categoryID)
				let ticketLog = reaction.message.guild.channels.cache.get(db.ticketModlogID)

				reaction.message.reactions.cache.find(r => r.emoji.name == reaction.emoji.name).users.remove(user.id).catch(() => { })

				// VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
				let chann;
				let id = user.id.toString().substr(0, 4) + user.discriminator;
				if (db.ticketNameType == "1") chann = `🟢｜ticket-${id}`;
				if (db.ticketNameType == "2") chann = `🟢｜ticket-${serverCase + 1}`;

				// CRIA UM ARRAY TEMPORARIO PARA JUNTAR TODOS CANAIS ENCONTRADOS
				let array = []

				const type1 = `🟢｜ticket-${id}`;
				const type2 = `Ticket Author Information: **ID:** ${user.id} | **Tag:** ${user.tag}`;

				// VERIFICA TODOS CANAIS PELO TIPO 1
				reaction.message.guild.channels.cache.forEach(channel => {
					if (channel.name == type1) array.push(channel.id)
				})
				// VERIFICA TODOS CANAIS PELO TIPO 2
				reaction.message.guild.channels.cache.forEach(channel => {
					if (channel.topic == type2) array.push(channel.id)
				})

				// OBTEM O LIMITE DE TICKETS DEFINIDO QUE UM USUARIO PODE CRIAR
				let ticketlimit = db.maxTicket
				if (!ticketlimit) ticketlimit = 1
				// OBTEM O TAMANHO DA ARRAY TEMPORARIA
				let arraylength = array.length
				// VERIFICAR NA ARRAY SE HÁ MAIS DO QUE O LIMITE DEFINIDO
				if (arraylength >= ticketlimit || arraylength === ticketlimit) {
					if (ticketCooldownLol.has(user.id)) return;
					if (!reaction.message.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
					if (!reaction.message.channel.permissionsFor(bot.user).has(Flags.EmbedLinks)) return;

					// SE SIM, IMPEDE O USUARIO DE ABRIR OUTRO TICKET
					ticketCooldownLol.add(user.id)
					setTimeout(() => {
						ticketCooldownLol.delete(user.id)
					}, 60000)

					return reaction.message.channel.send({
						embeds: [
							new Embed(bot, reaction.message.guild)
								.setColor(9442302)
								.setDescription(`You cannot open more than ${ticketlimit} ticket at the moment, as you already have ${arraylength} ticket open!\n\nTo open a new ticket, go to (<#${array[0]}>) and close your ticket or ask a server moderator to close it for you.\n\nYou're in **cooldown**. You will be able to *attempt* to open another ticket in **59 seconds**.`)
								.setAuthor({ name: `Hello ${user.username}`, iconURL: user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }) })
								.setFooter({ text: 'Powered by hopebot.top' })
						]
					}).then(m => m.timedDelete({ timeout: 15000 }));
				}

				// create perm array
				const perms = [
					{ id: user, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions] },
					{ id: guild.roles.everyone, deny: [Flags.ViewChannel, Flags.SendMessages] },
					{ id: bot.user, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions, Flags.ManageChannels] },
				];

				if (guild.roles.cache.get(guild.settings.TicketSupportRole)) perms.push({ id: guild.settings.TicketSupportRole, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions] });

				// create channel
				reaction.message.guild.channels.create({
					name: chann,
					type: ChannelType.GuildText,
					permissionOverwrites: perms,
					parent: db.categoryID,
					reason: `Ticket Addon`,
					topic: `Ticket Author Information: **ID:** ${member.user.id} | **Tag:** ${member.user.username}#${member.user.discriminator}`,
				}).then(async (chan) => {

					await chan.permissionOverwrites.create(user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true });
					await db.updateOne({ ticketCase: serverCase + 1 });

					let color = db.embedticket.Cor;
					if (color == "#000000") color = 9442302;

					if (db.ticketPing == true) {
						if (chan) {
							if (!chan.permissionsFor(bot.user).has(Flags.SendMessages) && !chan.permissionsFor(bot.user).has(Flags.EmbedLinks)) return;
							chan.send({ content: `${member} ${ticketRole}` }).then(m => m.timedDelete({ timeout: 1000 }));
						}
					}

					const botões = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('fechar_ticket')
								.setLabel(reaction.message.guild.translate('Events/clickButton:button'))
								.setStyle(ButtonStyle.Success)
								.setEmoji('<:lock:853017312734740500>'),
							new ButtonBuilder()
								.setCustomId('voice_ticket')
								.setLabel(reaction.message.guild.translate('Events/clickButton:button1'))
								.setStyle(ButtonStyle.Success)
								.setEmoji('<:voicechannel:853639025729863680>'),
							new ButtonBuilder()
								.setCustomId('transcript_ticket')
								.setLabel(reaction.message.guild.translate('Events/clickButton:button2'))
								.setStyle(ButtonStyle.Primary)
								.setEmoji('<:transcript:853348232858959902>'),
							new ButtonBuilder()
								.setCustomId('deletar_ticket')
								.setLabel(reaction.message.guild.translate('Events/clickButton:button3'))
								.setStyle(ButtonStyle.Danger)
								.setEmoji('<:delete:853017312033505281>')
						);

					let embed = new Embed(bot, reaction.message.guild)

					if (db.embedticket.color) embed.setColor(db.embedticket.color);
					if (db.embedticket.title !== undefined) embed.setTitle(db.embedticket.title?.replace(/{user}/g, `${member}`)
						.replace(/{user_tag}/g, `${user.tag}`)
						.replace(/{user_name}/g, `${user.username}`)
						.replace(/{user_ID}/g, `${user.id}`)
						.replace(/{guild_name}/g, `${guild.name}`)
						.replace(/{guild_ID}/g, `${member.guild.id}`)
						.replace(/{memberCount}/g, `${guild.memberCount}`)
						.replace(/{size}/g, `${guild.memberCount}`)
						.replace(/{guild}/g, `${guild.name}`)
						.replace(/{member_createdAtAgo}/g, `${moment(user.createdTimestamp).fromNow()}`)
						.replace(/{member_createdAt}/g, `${moment(user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`));
					let textEmbed = db.embedticket.description.replace(/{user}/g, `${member}`)
						.replace(/{user_tag}/g, `${user.tag}`)
						.replace(/{user_name}/g, `${user.username}`)
						.replace(/{user_ID}/g, `${user.id}`)
						.replace(/{guild_name}/g, `${guild.name}`)
						.replace(/{guild_ID}/g, `${member.guild.id}`)
						.replace(/{memberCount}/g, `${guild.memberCount}`)
						.replace(/{size}/g, `${guild.memberCount}`)
						.replace(/{guild}/g, `${guild.name}`)
						.replace(/{member_createdAtAgo}/g, `${moment(user.createdTimestamp).fromNow()}`)
						.replace(/{member_createdAt}/g, `${moment(user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);
					if (textEmbed !== undefined) embed.setDescription(textEmbed);
					// console.log(authorName !== undefined)
					if (db.embedticket.author.name) embed.setAuthor({
						name: db.embedticket.author.name.replace(/{user}/g, `${member}`)
							.replace(/{user_tag}/g, `${user.tag}`)
							.replace(/{user_name}/g, `${user.username}`)
							.replace(/{user_ID}/g, `${user.id}`)
							.replace(/{guild_name}/g, `${guild.name}`)
							.replace(/{guild_ID}/g, `${member.guild.id}`)
							.replace(/{memberCount}/g, `${guild.memberCount}`)
							.replace(/{size}/g, `${guild.memberCount}`)
							.replace(/{guild}/g, `${guild.name}`)
							.replace(/{member_createdAtAgo}/g, `${moment(user.createdTimestamp).fromNow()}`)
							.replace(/{member_createdAt}/g, `${moment(user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)
					});
					if (db.embedticket.author.icon) embed.setAuthor({ name: db.embedticket.author.name, iconURL: db.embedticket.author.icon });
					let footer = db.embedticket.footer;
					if (footer !== undefined) embed.setFooter({
						text: footer.replace(/{user}/g, `${member}`)
							.replace(/{user_tag}/g, `${user.tag}`)
							.replace(/{user_name}/g, `${user.username}`)
							.replace(/{user_ID}/g, `${user.id}`)
							.replace(/{guild_name}/g, `${guild.name}`)
							.replace(/{guild_ID}/g, `${member.guild.id}`)
							.replace(/{memberCount}/g, `${guild.memberCount}`)
							.replace(/{size}/g, `${guild.memberCount}`)
							.replace(/{guild}/g, `${guild.name}`)
							.replace(/{member_createdAtAgo}/g, `${moment(user.createdTimestamp).fromNow()}`)
							.replace(/{member_createdAt}/g, `${moment(user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)
					});
					if (footer && db.embedticket.footerIcon !== undefined) embed.setFooter({ text: footer, iconURL: db.embedticket.footerIcon });
					if (!footer) embed.setFooter({ text: `Powered by hopebot.top` });
					if (db.embedticket.thumbnail === "{userAvatar}") thumbnail = member.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })
					if (db.embedticket.thumbnail !== undefined) embed.setThumbnail(db.embedticket.thumbnail);
					let imagem = db.embedticket.image;
					let image;
					if (imagem === "{userAvatar}") image = member.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })
					if (imagem !== undefined) embed.setImage(image);

					if (db.embedticket.ticketAdditionalMessage) await channelToSend.send({ content: [db.embedticket.ticketAdditionalMessage] });

					const ticketMessage = await chan.send({ embeds: [embed], components: [botões] });

					let novo_ticket = new ticketFunçõesSchema({
						guildID: guild.id,
						messageID: ticketMessage.id,
						channelID: reaction.message.channel.id,
						voiceID: null,
						authorID: user.id,
						tag: user.tag,
						discriminator: user.discriminator,
						ticketNameType: db.ticketNameType,
						ticketCase: serverCase + 1,
					})

					await novo_ticket.save().catch(err => console.log(`messageReactionAdd: ${err.message}`));

					let color2 = db.ticketLogColor
					if (color2 == "#000000") color2 = `#36393f`;

					const embedLog = new Embed(bot, reaction.message.guild)
						// .setColor(color2)
						.setFooter({ text: 'Powered by hopebot.top' })
						.setTitle("Ticket Created")
						.setTimestamp()

					if (db.requireReason == true) embedLog.addFields({ name: "Information", value: `**User:** ${member}\n**Ticket Channel: **${chan.name}\n**Ticket:** #${serverCase + 1}\n**Reason:** ${reasonx}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")} `, inline: false })
					if (db.requireReason == false) embedLog.addFields({ name: "Information", value: `**User:** ${member}\n**Ticket Channel: **${chan.name}\n**Ticket:** #${serverCase + 1}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")} `, inline: false })

					if (ticketLog) {
						ticketLog.send({ embeds: [embedLog] }).catch(() => { })
					}
				})
			}
		}

		// REACTION ROLES
		// check database if reaction is from reaction role embed
		const dbReaction = await ReactionRoleSchema.findOne({
			guildID: guild.id,
			messageID: reaction.message.id,
		});

		if (dbReaction) {

			const rreaction = dbReaction.reactions.find(r => r.emoji === reaction.emoji.toString());
			const cargo = await guild.roles.cache.get(rreaction.roleID);

			let addEmbed = new Embed(bot, reaction.message.guild)
				.setAuthor({ name: reaction.message.translate('Events/messageReactionAdd:TICKET5'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif`, url: `${reaction.message.url}` })
				.setDescription(reaction.message.translate('Events/messageReactionAdd:TICKET6', { cargo: cargo?.name, guild: reaction.message.guild.name }))
				.setFooter({ text: `Powered by hopebot.top` })
				.setColor(12118406)

			let addEmbed2 = new Embed(bot, reaction.message.guild)
				.setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET5'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif` })
				.setDescription(`Hey ${member}! You have successfully received the role **${cargo?.name}** (${cargo}).`)
				.setFooter({ text: `Powered by hopebot.top` })
				.setColor(12118406)

			let remEmbed = new Embed(bot, reaction.message.guild)
				.setAuthor({ name: reaction.message.translate('Events/messageReactionAdd:TICKET7'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif`, url: `${reaction.message.url}` })
				.setDescription(reaction.message.translate('Events/messageReactionAdd:TICKET8', { cargo: cargo?.name, guild: reaction.message.guild.name }))
				.setFooter({ text: `Powered by hopebot.top` })
				.setColor(16734058)

			let errorReaction = new Embed(bot, reaction.message.guild)
				.setAuthor({ name: reaction.message.translate('Events/messageReactionAdd:TICKET9'), iconURL: `https://cdn.dribbble.com/users/6425/screenshots/5039369/error-glitch-gif-3.gif`, url: `${reaction.message.url}` })
				.setDescription(reaction.message.translate('Events/messageReactionAdd:TICKET10'))
				.setFooter({ text: `Powered by hopebot.top` })
				.setColor(16711710)

			if (rreaction) {
				if (cargo) {
					if (dbReaction.option === 1) {
						try {
							if (!member.roles.cache.has(rreaction.roleID)) {

								await member.roles.add(rreaction.roleID).catch(() => { })
								if (dbReaction.dm === true) {
									member.send({ embeds: [addEmbed] }).catch(() => { })
								} else {
									return reaction.message.channel.send({ embeds: [addEmbed2] }).then(m => m.timedDelete({ timeout: 3000 }));
								}
							}
						} catch (err) {
							console.log(err)
							return member.send({ embeds: [errorReaction] }).catch(() => { })
						}
					}

					if (dbReaction.option === 2) {
						try {
							if (!member.roles.cache.has(rreaction.roleID)) {
								await member.roles.add(rreaction.roleID).catch(() => { })
								if (dbReaction.dm === true) {
									member.send({ embeds: [addEmbed] }).catch(() => { })
								} else {
									return reaction.message.channel.send({ embeds: [addEmbed2] }).then(m => m.timedDelete({ timeout: 3000 }));
								}
							}
						} catch (err) {
							return member.send({ embeds: [errorReaction] }).catch(() => { })
						}
					}

					if (dbReaction.option === 3) {
						try {
							if (!member.roles.cache.has(rreaction.roleID)) {
								await member.roles.remove(rreaction.roleID).catch(() => { })
								if (dbReaction.dm === true) {
									member.send({ embeds: [remEmbed] }).catch(() => { })
								} else {
									return reaction.message.channel.send({ embeds: [addEmbed2] }).then(m => m.timedDelete({ timeout: 3000 }));
								}
							}
						} catch (err) {
							if (!reaction.message.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
							return member.send({ embeds: [errorReaction] }).catch(() => { })
						}
					}

					if (dbReaction.option === 4) {
						try {
							if (!member.roles.cache.has(rreaction.roleID)) {
								await member.roles.remove(rreaction.roleID).catch(() => { })
								reactionCooldown.add(user.id);
								if (dbReaction.dm === true) {
									member.send({ embeds: [remEmbed] }).catch(() => { })
								} else {
									return reaction.message.channel.send({ embeds: [addEmbed2] }).then(m => m.timedDelete({ timeout: 3000 }));
								}
							}
						} catch (err) {
							return member.send({ embeds: [errorReaction] }).catch(() => { })
						}
					}

					if (dbReaction.option === 5) {
						try {
							if (!member.roles.cache.has(rreaction.roleID)) {
								await member.roles.remove(rreaction.roleID);
								reaction.message.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id).catch(() => { })

								if (dbReaction.dm === true) {
									member.send({ embeds: [remEmbed] }).catch(() => { })
								} else {
									return reaction.message.channel.send({ embeds: [addEmbed2] }).then(m => m.timedDelete({ timeout: 3000 }));
								}
							}
						} catch (err) {
							if (!reaction.message.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
							return member.send({ embeds: [errorReaction] }).catch(() => { })
						}
					}

					if (dbReaction.option === 6) {

						try {
							if (!member.roles.cache.has(rreaction.roleID)) {

								reaction.message.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id).catch(() => { })
								await member.roles.remove(rreaction.roleID).catch(() => { })
								return;
							} else if (!member.roles.cache.has(rreaction.roleID)) {

								reaction.message.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id).catch(() => { })
								await member.roles.add(rreaction.roleID).catch(() => { })

								if (dbReaction.dm === true) {
									member.send({ embeds: [addEmbed] }).catch(() => { })
								} else {
									return reaction.message.channel.send({ embeds: [addEmbed2] }).then(m => m.timedDelete({ timeout: 3000 }));
								}
							}
						} catch (err) {
							if (!reaction.message.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
							return member.send({ embeds: [errorReaction] }).catch(() => { })
						}
					}
				} else {
					return reaction.message.channel.error(`Uh-oh! The role of this reaction has been **deleted** and **no longer exists** on this server. Please **notify** any *moderation member* about this.`, {}).then(m => m.timedDelete({ timeout: 15000 }));
				}
			}
		}

		// make sure the message author isn't the bot
		if (reaction.message.author.id == bot.user.id) return;

		// Check if event messageReactionAdd is for logging
		if (logDB.MessageEvents.ReactionToggle == true && logDB.MessageEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MessageEvents.EmbedColor;
			if (color == "#000000") color = '#4bd37b';

			const embed = new Embed(bot, reaction.message.guild)
				.setDescription(`**${user.toString()} ${reaction.message.guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD')} ${reaction.emoji.toString()} [${reaction.message.guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD1')}](${reaction.message.url})** `)
				.setColor(color)
				.setFooter({ text: `${reaction.message.guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD2')} ${user.id} | ${reaction.message.guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD3')} ${reaction.message.id}` })
				.setAuthor({ name: `${reaction.message.guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD4')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.MessageEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == reaction.message.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${reaction.message.guild.name} [${reaction.message.guild.id}]: ${err}.`);
			}
		}
	}
};
