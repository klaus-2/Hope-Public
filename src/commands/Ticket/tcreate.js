// Dependencies
const { Embed } = require(`../../utils`),
	{ ticketEmbedSchema, ticketFunçõesSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js'),
	Command = require('../../structures/Command.js');

const ticketCooldownLol = new Set();
const moment = require('moment');

module.exports = class TCreate extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tcreate',
			dirname: __dirname,
			aliases: ['t-criar', 't-abrir', 'ticket-create', 't-create', 't-open', 'ticket-criar'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Create a ticket.',
			usage: '<prefix><commandName> [reason]',
			examples: [
				'/ticket create',
				'/ticket create Any reason',
				'.t-create',
				'!t-open Any reason'
			],
			cooldown: 3000,
			slash: false,
			slashSite: true,
			options: [
				{
					name: 'reason',
					description: 'Reason for creating ticket.',
					type: ApplicationCommandOptionType.String,
					maxLength: 2000,
					required: false,
				},
			],
		});
	}

	// Run command
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		//ticket stuff
		let db = await ticketEmbedSchema.findOne({ tembed_sID: message.guild.id });
		if (!db) {
			const newSettings = new ticketEmbedSchema({
				tembed_sID: message.guild.id
			});
			await newSettings.save().catch(() => { });
			db = await ticketEmbedSchema.findOne({ tembed_sID: message.guild.id });
		}

		// Verificando se o servidor ja está com o addon Ticket configurado e ativo
		if (!db.categoryID || db.ticketToggle === false) return message.channel.error(`Uh-oh! The **Administrators** of this server have not yet configured the **Ticket** addon. Please feel free to remind them to configure it.`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

		let serverCase = db.ticketCase;
		if (!serverCase || serverCase === null) serverCase = '1';

		// VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
		let chann;
		let ticketLog = message.guild.channels.cache.get(db.ticketModlogID);
		let ticketRole = message.guild.roles.cache.get(db.supportRoleID);
		let id = message.author.id.toString().substr(0, 4) + message.author.discriminator;
		if (db.ticketNameType == "1") chann = `🟢｜ticket-${id}`;
		if (db.ticketNameType == "2") chann = `🟢｜ticket-${serverCase + 1}`;

		// CRIA UM ARRAY TEMPORARIO PARA JUNTAR TODOS CANAIS ENCONTRADOS
		let array = [];

		const type1 = `🟢｜ticket-${id}`;
		const type2 = `Ticket Author Information: **ID:** ${message.author.id} | **Tag:** ${message.author.tag}`;

		// VERIFICA TODOS CANAIS PELO TIPO 1
		message.guild.channels.cache.forEach(channel => {
			if (channel.name == type1) array.push(channel.id)
		});

		// VERIFICA TODOS CANAIS PELO TIPO 2
		message.guild.channels.cache.forEach(channel => {
			if (channel.topic == type2) array.push(channel.id)
		});

		// OBTEM O LIMITE DE TICKETS DEFINIDO QUE UM USUARIO PODE CRIAR
		let ticketlimit = db.maxTicket;
		if (!ticketlimit) ticketlimit = 1;

		// OBTEM O TAMANHO DA ARRAY TEMPORARIA
		let arraylength = array.length;

		// VERIFICAR NA ARRAY SE HÁ MAIS DO QUE O LIMITE DEFINIDO
		if (arraylength > ticketlimit || arraylength == ticketlimit) {

			if (ticketCooldownLol.has(message.author.id)) return;
			if (!message.channel.permissionsFor(message.guild.members.me).has(Flags.SendMessages)) return;
			if (!message.channel.permissionsFor(message.guild.members.me).has(Flags.EmbedLinks)) return;

			// SE SIM, IMPEDE O USUARIO DE ABRIR OUTRO TICKET
			const limitEmbed = new Embed(bot, message.guild)
				.setDescription(`You cannot open more than ${ticketlimit} ticket at the moment, as you already have ${arraylength} ticket open!\n\nTo open a new ticket, go to (<#${array[0]}>) and close your ticket or ask a server moderator to close it for you.`)
				.setAuthor({ name: `Hello ${message.author.username}`, iconURL: message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }) })
				.setFooter({ text: 'Powered by hopebot.top' })

			ticketCooldownLol.add(message.author.id);
			setTimeout(() => { ticketCooldownLol.delete(message.author.id) }, 10000);
			return message.channel.send({ embeds: [limitEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}

		// make sure ticket has been set-up properly
		// create perm array
		const perms = [
			{ id: message.author, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions] },
			{ id: message.guild.roles.everyone, deny: [Flags.ViewChannel, Flags.SendMessages] },
			{ id: bot.user, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions, Flags.ManageChannels] },
		];

		if (message.guild.roles.cache.get(settings.TicketSupportRole)) perms.push({ id: settings.TicketSupportRole, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions] });

		let reason = message.args.slice(0).join(" ");

		if (db.requireReason == true) {
			const reasonEmbed = new Embed(bot, message.guild)
				.setAuthor({ name: `Hey ${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: 'png' }) })
				.setDescription(`Please provide a reason.\nFollow the example: ${settings.prefix}ticketcreate An reason`)
				.setFooter({ text: 'Powered by hopebot.top' })
				.setTimestamp()

			if (!reason) return message.channel.send({ embeds: [reasonEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		}

		// create channel
		message.guild.channels.create({
			name: chann,
			type: ChannelType.GuildText,
			permissionOverwrites: perms,
			parent: db.categoryID,
			reason: `Ticket Addon`,
			topic: `Ticket Author Information: **ID:** ${message.author.id} | **Tag:** ${message.author.tag}`,
		}).then(async (chan) => {

			await chan.permissionOverwrites.create(message.author.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true });
			await db.updateOne({ ticketCase: serverCase + 1 });


			let color = db.embedticket.Cor;
			if (color == "#000000") color = message.guild.members.me.displayHexColor

			if (db.ticketPing == true) {
				if (chan) {
					if (!chan.permissionsFor(bot.user).has(Flags.SendMessages) && !chan.permissionsFor(bot.user).has(Flags.EmbedLinks)) return;
					chan.send({ content: `${message.author} ${ticketRole}` }).then(m => m.timedDelete({ timeout: 1000 }));
				}
			}

			const botões = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('fechar_ticket')
						.setLabel(message.translate('Events/clickButton:button'))
						.setStyle(ButtonStyle.Success)
						.setEmoji('<:lock:853017312734740500>'),
					new ButtonBuilder()
						.setCustomId('voice_ticket')
						.setLabel(message.translate('Events/clickButton:button1'))
						.setStyle(ButtonStyle.Success)
						.setEmoji('<:voicechannel:853639025729863680>'),
					new ButtonBuilder()
						.setCustomId('transcript_ticket')
						.setLabel(message.translate('Events/clickButton:button2'))
						.setStyle(ButtonStyle.Primary)
						.setEmoji('<:transcript:853348232858959902>'),
					new ButtonBuilder()
						.setCustomId('deletar_ticket')
						.setLabel(message.translate('Events/clickButton:button3'))
						.setStyle(ButtonStyle.Danger)
						.setEmoji('<:delete:853017312033505281>')
				);

			let reasonx = message.args.slice(0).join(" ")
			if (!reasonx) reasonx = `No reason Provided`;
			if (reasonx.length > 1024) reasonx = `Reason Too Long`;
			if (reason.length > 1024) reasonx = `Reason Too Long`;

			const ticketMessage = await chan.send({
				embeds: [new Embed(bot, message.guild)
					.setAuthor({ name: db.embedticket.author.name ?? message.translate('Ticket/ticket-criar:TICKET_CRIAR3', { author: message.author.username }), iconURL: `${db.embedticket.author.icon || bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
					.setThumbnail(db.embedticket.thumbnail || bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }))
					.setDescription(db.embedticket?.description
						.replace(/{user}/g, `${message.author}`)
						.replace(/{user_tag}/g, `${message.author.tag}`)
						.replace(/{user_name}/g, `${message.author.username}`)
						.replace(/{reason}/g, `${reasonx}`)
						.replace(/{user_ID}/g, `${message.author.id}`) ?? `${message.translate('Ticket/ticket-criar:TICKET_CRIAR4')} ${message.guild.roles.cache.get(db.supportRoleID) ? `, <@&${db.supportRoleID}>` : 'Support'} ${message.translate('Ticket/ticket-criar:TICKET_CRIAR5')} ${message.guild.roles.cache.get(db.supportRoleID) ? `, <@&${db.supportRoleID}>` : 'SUPPORT'}, ${message.translate('Ticket/ticket-criar:TICKET_CRIAR6')}`)
					.setColor(db.embedticket.color || 9442302)
					.setFooter({ text: db.embedticket.footer ?? 'Powered by hopebot.top' })
				], components: [botões]
			});

			// reply to user saying that channel has been created
			const successEmbed = new Embed(bot, message.guild)
				.setTitle('Ticket/ticket-criar:TICKET_CRIAR1')
				.setDescription(message.translate('Ticket/ticket-criar:TICKET_CRIAR2', { channel: chan.id }));
			message.channel.send({ embeds: [successEmbed] }).then(m => m.timedDelete({ timeout: 10000 }));

			let novo_ticket = new ticketFunçõesSchema({
				guildID: message.guild.id,
				messageID: ticketMessage.id,
				channelID: ticketMessage.channel.id,
				voiceID: null,
				authorID: message.author.id,
				tag: message.author.tag,
				discriminator: message.author.discriminator,
				ticketNameType: db.ticketNameType,
				ticketCase: serverCase + 1,
			})

			await novo_ticket.save().catch(err => message.channel.error(settings.Language, 'ERROR_MESSAGE', { err: err.message }));

			let color2 = db.ticketLogColor
			if (color2 == "#000000") color2 = `#36393f`;

			const embedLog = new Embed(bot, message.guild)
				.setColor(color2)
				.setFooter({ text: 'Powered by hopebot.top' })
				.setTitle("Ticket Created")
				.setTimestamp()

			if (db.requireReason == true) embedLog.addFields({ name: "Information", value: `**User:** ${message.author}\n**Ticket Channel: **${chan.name}\n**Ticket:** #${serverCase + 1}\n**Reason:** ${reasonx}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")} `, inline: false })
			if (db.requireReason == false) embedLog.addFields({ name: "Information", value: `**User:** ${message.author}\n**Ticket Channel: **${chan.name}\n**Ticket:** #${serverCase + 1}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")} `, inline: false })

			if (ticketLog) {
				ticketLog.send({ embeds: [embedLog] }).catch(() => { })
			}

			// send ticket log (goes in ModLog channel)
			/*if (settings.ModLogEvents.includes('TICKET') && settings.ModLog) {
				const embed2 = new Embed(bot, message.guild)
					.setTitle(message.translate('Ticket/ticket-criar:TICKET_CRIAR8'))
					.addField(message.translate('Ticket/ticket-criar:TICKET_CRIAR9'), channel)
					.addField(message.translate('Ticket/ticket-criar:TICKET_CRIAR10'), message.author)
					.addField(message.translate('Ticket/ticket-criar:TICKET_CRIAR11'), reason)
					.setTimestamp();
				const modChannel = message.guild.channels.cache.get(settings.ModLogChannel);
				if (modChannel) bot.addEmbed(modChannel.id, embed2);
			}*/

			// run ticketcreate event
			// await bot.emit('ticketCreate', ticketLog, embedLog);
		});
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const member = interaction.user,
			channel = guild.channels.cache.get(interaction.channelId),
			reason = args.get('reason')?.value;

		//ticket stuff
		let db = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
		if (!db) {
			const newSettings = new ticketEmbedSchema({
				tembed_sID: guild.id
			});
			await newSettings.save().catch(() => { });
			db = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
		}

		// Verificando se o servidor ja está com o addon Ticket configurado e ativo
		if (!db.categoryID || db.ticketToggle === false) return interaction.reply({ embeds: [channel.error(`Uh-oh! The **Administrators** of this server have not yet configured the **Ticket** addon. Please feel free to remind them to configure it.`, {}, true)], ephemeral: true });

		let serverCase = db.ticketCase;
		if (!serverCase || serverCase === null) serverCase = '1';

		// VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
		let chann;
		let ticketLog = guild.channels.cache.get(db.ticketModlogID);
		let ticketRole = guild.roles.cache.get(db.supportRoleID);
		let id = member.id.toString().substr(0, 4) + member.discriminator;
		if (db.ticketNameType == "1") chann = `🟢｜ticket-${id}`;
		if (db.ticketNameType == "2") chann = `🟢｜ticket-${serverCase + 1}`;

		// CRIA UM ARRAY TEMPORARIO PARA JUNTAR TODOS CANAIS ENCONTRADOS
		let array = [];

		const type1 = `🟢｜ticket-${id}`;
		const type2 = `Ticket Author Information: **ID:** ${member.id} | **Tag:** ${member.tag}`;

		// VERIFICA TODOS CANAIS PELO TIPO 1
		guild.channels.cache.forEach(channel => {
			if (channel.name == type1) array.push(channel.id)
		});

		// VERIFICA TODOS CANAIS PELO TIPO 2
		guild.channels.cache.forEach(channel => {
			if (channel.topic == type2) array.push(channel.id)
		});

		// OBTEM O LIMITE DE TICKETS DEFINIDO QUE UM USUARIO PODE CRIAR
		let ticketlimit = db.maxTicket;
		if (!ticketlimit) ticketlimit = 1;

		// OBTEM O TAMANHO DA ARRAY TEMPORARIA
		let arraylength = array.length;

		// VERIFICAR NA ARRAY SE HÁ MAIS DO QUE O LIMITE DEFINIDO
		if (arraylength > ticketlimit || arraylength == ticketlimit) {

			if (ticketCooldownLol.has(member.id)) return;
			if (!channel.permissionsFor(guild.members.me).has(Flags.SendMessages)) return;
			if (!channel.permissionsFor(guild.members.me).has(Flags.EmbedLinks)) return;

			// SE SIM, IMPEDE O USUARIO DE ABRIR OUTRO TICKET
			const limitEmbed = new Embed(bot, guild)
				.setDescription(`You already have ${arraylength} open tickets, as the current guild's ticket limit is ${ticketlimit} `)
				.setAuthor({ name: `Hello ${member.username}`, iconURL: member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }) })
				.setFooter({ text: 'Powered by hopebot.top' })

			ticketCooldownLol.add(member.id);
			setTimeout(() => { ticketCooldownLol.delete(member.id) }, 10000);
			return interaction.reply({ embeds: [limitEmbed], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		}

		// make sure ticket has been set-up properly
		// create perm array
		const perms = [
			{ id: member, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions] },
			{ id: guild.roles.everyone, deny: [Flags.ViewChannel, Flags.SendMessages] },
			{ id: bot.user, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions, Flags.ManageChannels] },
		];

		if (guild.roles.cache.get(guild.settings.TicketSupportRole)) perms.push({ id: guild.settings.TicketSupportRole, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.AttachFiles, Flags.ReadMessageHistory, Flags.AddReactions] });

		if (db.requireReason === true) {
			const reasonEmbed = new Embed(bot, guild)
				.setAuthor({ name: `Hey ${member.username}`, iconURL: member.displayAvatarURL({ format: 'png' }) })
				.setDescription(`Please provide a reason.\nFollow the example: /ticketcreate An reason`)
				.setFooter({ text: 'Powered by hopebot.top' })
				.setTimestamp()

			if (!reason) return interaction.reply({ embeds: [reasonEmbed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		}

		// create channel
		try {
			// create channel
			guild.channels.create({
				name: chann,
				type: ChannelType.GuildText,
				permissionOverwrites: perms,
				parent: db.categoryID,
				reason: `Ticket Addon`,
				topic: `Ticket Author Information: **ID:** ${member.id} | **Tag:** ${member.tag}`,
			}).then(async (chan) => {

				await chan.permissionOverwrites.create(member.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true });
				await db.updateOne({ ticketCase: serverCase + 1 });


				let color = db.embedticket.Cor;
				if (color == "#000000") color = guild.members.me.displayHexColor

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
							.setLabel(guild.translate('Events/clickButton:button'))
							.setStyle(ButtonStyle.Success)
							.setEmoji('<:lock:853017312734740500>'),
						new ButtonBuilder()
							.setCustomId('voice_ticket')
							.setLabel(guild.translate('Events/clickButton:button1'))
							.setStyle(ButtonStyle.Success)
							.setEmoji('<:voicechannel:853639025729863680>'),
						new ButtonBuilder()
							.setCustomId('transcript_ticket')
							.setLabel(guild.translate('Events/clickButton:button2'))
							.setStyle(ButtonStyle.Primary)
							.setEmoji('<:transcript:853348232858959902>'),
						new ButtonBuilder()
							.setCustomId('deletar_ticket')
							.setLabel(guild.translate('Events/clickButton:button3'))
							.setStyle(ButtonStyle.Danger)
							.setEmoji('<:delete:853017312033505281>')
					);

				let reasonx = reason;
				if (!reasonx) reasonx = `No reason Provided`;
				if (reasonx.length > 1024) reasonx = `Reason Too Long`;
				if (reason?.length > 1024) reasonx = `Reason Too Long`;

				const ticketMessage = await chan.send({
					embeds: [new Embed(bot, guild)
						.setAuthor({ name: db.embedticket.author.name ?? guild.translate('Ticket/ticket-criar:TICKET_CRIAR3', { author: member.username }), iconURL: `${db.embedticket.author.icon || bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
						.setThumbnail(db.embedticket.thumbnail || bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 }))
						.setDescription(db.embedticket?.description
							.replace(/{user}/g, `${member}`)
							.replace(/{user_tag}/g, `${member.tag}`)
							.replace(/{user_name}/g, `${member.username}`)
							.replace(/{reason}/g, `${reasonx}`)
							.replace(/{user_ID}/g, `${member.id}`) ?? `${guild.translate('Ticket/ticket-criar:TICKET_CRIAR4')} ${guild.roles.cache.get(db.supportRoleID) ? `, <@&${db.supportRoleID}>` : 'Support'} ${guild.translate('Ticket/ticket-criar:TICKET_CRIAR5')} ${guild.roles.cache.get(db.supportRoleID) ? `, <@&${db.supportRoleID}>` : 'SUPPORT'}, ${guild.translate('Ticket/ticket-criar:TICKET_CRIAR6')}`)
						.setColor(db.embedticket.color || 9442302)
						.setFooter({ text: db.embedticket.footer ?? 'Powered by hopebot.top' })
					], components: [botões]
				});

				// reply to user saying that channel has been created
				const successEmbed = new Embed(bot, guild)
					.setTitle('Ticket/ticket-criar:TICKET_CRIAR1')
					.setDescription(guild.translate('Ticket/ticket-criar:TICKET_CRIAR2', { channel: chan.id }));
				interaction.reply({ embeds: [successEmbed] }).then(() => {
					setTimeout(function () {
						interaction.deleteReply();
					}, 10000);
				});

				let novo_ticket = new ticketFunçõesSchema({
					guildID: guild.id,
					messageID: ticketMessage.id,
					channelID: ticketMessage.channel.id,
					voiceID: null,
					authorID: member.id,
					tag: member.tag,
					discriminator: member.discriminator,
					ticketNameType: db.ticketNameType,
					ticketCase: serverCase + 1,
				})

				await novo_ticket.save().catch(err => interaction.reply({ embeds: [channel.error('ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true }));

				let color2 = db.ticketLogColor
				if (color2 == "#000000") color2 = `#36393f`;

				const embedLog = new Embed(bot, guild)
					.setColor(color2)
					.setFooter({ text: 'Powered by hopebot.top' })
					.setTitle("Ticket Created")
					.setTimestamp()

				if (db.requireReason == true) embedLog.addFields({ name: "Information", value: `**User:** ${member}\n**Ticket Channel: **${chan.name}\n**Ticket:** #${serverCase + 1}\n**Reason:** ${reasonx}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")} `, inline: false })
				if (db.requireReason == false) embedLog.addFields({ name: "Information", value: `**User:** ${member}\n**Ticket Channel: **${chan.name}\n**Ticket:** #${serverCase + 1}\n**Date:** ${moment(new Date()).format("dddd, MMMM Do YYYY")} `, inline: false })

				if (ticketLog) {
					ticketLog.send({ embeds: [embedLog] }).catch(() => { })
				}

				// send ticket log (goes in ModLog channel)
				/*if (settings.ModLogEvents.includes('TICKET') && settings.ModLog) {
					const embed2 = new Embed(bot, message.guild)
						.setTitle(message.translate('Ticket/ticket-criar:TICKET_CRIAR8'))
						.addField(message.translate('Ticket/ticket-criar:TICKET_CRIAR9'), channel)
						.addField(message.translate('Ticket/ticket-criar:TICKET_CRIAR10'), message.author)
						.addField(message.translate('Ticket/ticket-criar:TICKET_CRIAR11'), reason)
						.setTimestamp();
					const modChannel = message.guild.channels.cache.get(settings.ModLogChannel);
					if (modChannel) bot.addEmbed(modChannel.id, embed2);
				}*/

				// run ticketcreate event
				await bot.emit('ticketCreate', ticketLog, embedLog);
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};