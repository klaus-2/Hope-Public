// Dependências
const Command = require('../../structures/Command.js'),
	{ PermissionsBitField: { Flags }, ChannelType } = require('discord.js'),
	{ ticketFunçõesSchema, ticketEmbedSchema } = require('../../database/models');

module.exports = class Tvoice extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tvoice',
			dirname: __dirname,
			aliases: ['t-voice', 'ticket-voice'],
			userPermissions: [Flags.ManageChannels],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Opens a voice channel to Ticket.',
			cooldown: 3000,
			usage: '<prefix><commandName>',
			examples: [
				'/ticket voice',
				'.tvoice',
				'!t-voice',
				'?ticket-voice'
			],
			slash: false,
			slashSite: true,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: message.guild.id });
		if (!dbEmbed) {
			const newSettings = new ticketEmbedSchema({
				tembed_sID: message.guild.id
			});
			await newSettings.save().catch(() => { });
			dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: message.guild.id });
		}

		const ticketMember = await ticketFunçõesSchema.findOne({
			channelID: message.channel.id,
			guildID: message.guild.id,
		});

		if (!ticketMember) return message.channel.error(`Uh-oh! This command does not work on normal channels. Please try again by running this command on a ticket channel.\n**Tip**: Ticket channels start with \`🟢｜ticket-\``).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

		// VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
		let serverCase = ticketMember.ticketCase;
		if (!serverCase || serverCase === null) serverCase = '1';
		let chann;
		let id = ticketMember.authorID.toString().substr(0, 4) + ticketMember.discriminator;
		if (ticketMember.ticketNameType == 1) {
			chann = `${id}`;
		} else if (ticketMember.ticketNameType == 2) {
			chann = `${serverCase}`;
		}
		let author = message.guild.members.cache.get(ticketMember.authorID);

		// VERIFICA SE O JA POSSUI UM CANAL DE VOZ CRIADO
		if (!message.guild.channels.cache.find(canal => canal.name == `🟠｜voice-${chann}`)) {

			// Check if a ticket channel is already open
			if (message.guild.channels.cache.find(channel => channel.name == `🟠｜voice-${message.channel.name.split('-')[1]}`)) {
				return message.channel.error('misc:TICKET_EXISTS').then(m => m.timedDelete({ timeout: 10000 }));
			}

			// VERIFICA SE O USUARIO TEM AS PERMISSÕES NECESSARIAS PARA ABRIR UM CANAL DE VOZ
			const supportRole = message.guild.roles.cache.get(dbEmbed.supportRoleID);
			if (!supportRole) return message.channel.error('misc:NO_SUPPORT_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			const category = message.guild.channels.cache.get(dbEmbed.categoryID);
			if (!category) return message.channel.error('misc:NO_CATEGORY').then(m => m.timedDelete({ timeout: 10000 }));

			// CRIA UM CANAL DE VOZ
			message.guild.channels.create({
				name: `🟠｜voice-${chann}`,
				type: ChannelType.GuildVoice,
				permissionOverwrites: [
					{ id: author, allow: [Flags.SendMessages, Flags.ViewChannel] },
					{ id: supportRole, allow: [Flags.SendMessages, Flags.ViewChannel] },
					{ id: message.guild.roles.everyone, deny: [Flags.SendMessages, Flags.ViewChannel] },
					{ id: bot.user, allow: [Flags.SendMessages, Flags.ViewChannel, Flags.EmbedLinks] }],
				parent: category.id,
				reason: 'User created a voice channel for the ticket',
				topic: `Ticket Author Information: **ID:** ${message.author.id} | **Tag:** ${message.author.tag}`,
			})

			const delay = ms => new Promise(res => setTimeout(res, ms));
			await delay(2000);
			const voice = message.guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`);
			if (voice) {
				ticketMember.voiceID = voice.id;
				message.channel.send(message.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD10', { user: message.author.username, voice: voice.id }))
				await ticketMember.save().catch(err => message.channel.error('ERROR_MESSAGE', { err: err.message }));
			}
		} else if (message.guild.channels.cache.find(canal => canal.name == `🟠｜voice-${chann}`)) {
			// Check if bot has permission to add reactions
			if (!message.channel.permissionsFor(bot.user).has(Flags.ManageChannels)) {
				bot.logger.error(`Faltando permissões: \`MANAGE_CHANNELS\` em [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: Flags.ManageChannels }).then(m => m.timedDelete({ timeout: 10000 }));
			}
			// VERIFICA AS PERMISSÕES NECESSARIAS
			const supportRole = message.guild.roles.cache.get(dbEmbed.supportRoleID);
			if (!supportRole) return message.channel.error('misc:NO_SUPPORT_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			const category = message.guild.channels.cache.get(dbEmbed.categoryID);
			if (!category) return message.channel.error('misc:NO_CATEGORY').then(m => m.timedDelete({ timeout: 10000 }));

			// DELETA O CANAL
			// const voice = guild.channels.cache.find(canal => canal.name === `🟠｜voice-${message.channel.name.split('-')[1]}`);
			message.channel.send(message.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD11', { user: message.author.username }))
			setTimeout(() => message.guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`).delete(), 5000);
		}

		// make sure ticket has been set-up properly
		const supportRole = message.guild.roles.cache.get(dbEmbed.supportRoleID);
		if (!supportRole) return message.channel.error('misc:NO_SUPPORT_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
		const category = message.guild.channels.cache.get(dbEmbed.categoryID);
		if (!category) return message.channel.error('misc:NO_CATEGORY').then(m => m.timedDelete({ timeout: 10000 }));

		// create channel
		message.guild.channels.create({
			name: `🟠｜voice-${message.channel.name.split('-')[1]}`,
			type: ChannelType.GuildVoice,
			permissionOverwrites: [
				{ id: message.channel.name.split('-')[1], allow: [Flags.SendMessages, Flags.ViewChannel] },
				{ id: supportRole, allow: [Flags.SendMessages, Flags.ViewChannel] },
				{ id: message.guild.roles.everyone, deny: [Flags.SendMessages, Flags.ViewChannel] },
				{ id: bot.user, allow: [Flags.SendMessages, Flags.ViewChannel, Flags.EmbedLinks] }],
			parent: category.id,
			reason: 'User created a voice channel for the ticket',
			topic: `Ticket Author Information: **ID:** ${message.author.id} | **Tag:** ${message.author.tag}`,
		})
	}
	// EXEC - SLASH
	async callback(bot, interaction, guild, { settings }) {
		const member = interaction.user,
			channel = guild.channels.cache.get(interaction.channelId);

		let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
		if (!dbEmbed) {
			const newSettings = new ticketEmbedSchema({
				tembed_sID: guild.id
			});
			await newSettings.save().catch(() => { });
			dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
		}

		const ticketMember = await ticketFunçõesSchema.findOne({
			channelID: channel.id,
			guildID: guild.id,
		});

		if (!ticketMember) return interaction.reply({ embeds: [channel.error(`Uh-oh! This command does not work on normal channels. Please try again by running this command on a ticket channel.\n**Tip**: Ticket channels start with \`:green_circle:｜ticket-\``, {}, true)], ephemeral: true });

		// VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
		let serverCase = ticketMember.ticketCase;
		if (!serverCase || serverCase === null) serverCase = '1';
		let chann;
		let id = ticketMember.authorID.toString().substr(0, 4) + ticketMember.discriminator;
		if (ticketMember.ticketNameType == 1) {
			chann = `${id}`;
		} else if (ticketMember.ticketNameType == 2) {
			chann = `${serverCase}`;
		}
		let author = guild.members.cache.get(ticketMember.authorID);

		// VERIFICA SE O JA POSSUI UM CANAL DE VOZ CRIADO
		if (!guild.channels.cache.find(canal => canal.name == `🟠｜voice-${chann}`)) {

			// Check if a ticket channel is already open
			if (guild.channels.cache.find(channel => channel.name == `🟠｜voice-${channel.name.split('-')[1]}`)) return interaction.reply({ embeds: [channel.error('misc:TICKET_EXISTS', {}, true)], ephemeral: true });

			// VERIFICA SE O USUARIO TEM AS PERMISSÕES NECESSARIAS PARA ABRIR UM CANAL DE VOZ
			const supportRole = guild.roles.cache.get(dbEmbed.supportRoleID);
			if (!supportRole) return interaction.reply({ embeds: [channel.error('misc:NO_SUPPORT_ROLE', {}, true)], ephemeral: true });
			const category = guild.channels.cache.get(dbEmbed.categoryID);
			if (!category) return interaction.reply({ embeds: [channel.error('misc:NO_CATEGORY', {}, true)], ephemeral: true });

			// CRIA UM CANAL DE VOZ
			guild.channels.create({
				name: `🟠｜voice-${chann}`,
				type: ChannelType.GuildVoice,
				permissionOverwrites: [
					{ id: author, allow: [Flags.SendMessages, Flags.ViewChannel] },
					{ id: supportRole, allow: [Flags.SendMessages, Flags.ViewChannel] },
					{ id: guild.roles.everyone, deny: [Flags.SendMessages, Flags.ViewChannel] },
					{ id: bot.user, allow: [Flags.SendMessages, Flags.ViewChannel, Flags.EmbedLinks] }],
				parent: category.id,
				reason: 'User created a voice channel for the ticket',
				topic: `Ticket Author Information: **ID:** ${member.id} | **Tag:** ${member.tag}`,
			})

			const delay = ms => new Promise(res => setTimeout(res, ms));
			await delay(2000);
			const voice = guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`);
			if (voice) {
				ticketMember.voiceID = voice.id;
				interaction.reply(guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD10', { user: member.username, voice: voice.id }))
				await ticketMember.save().catch(err => message.channel.error('ERROR_MESSAGE', { err: err.message }));
			}
		} else if (guild.channels.cache.find(canal => canal.name == `🟠｜voice-${chann}`)) {
			// VERIFICA AS PERMISSÕES NECESSARIAS
			const supportRole = guild.roles.cache.get(dbEmbed.supportRoleID);
			if (!supportRole) return interaction.reply({ embeds: [channel.error('misc:NO_SUPPORT_ROLE', {}, true)], ephemeral: true });
			const category = guild.channels.cache.get(dbEmbed.categoryID);
			if (!category) return interaction.reply({ embeds: [channel.error('misc:NO_CATEGORY', {}, true)], ephemeral: true });

			// DELETA O CANAL
			// const voice = guild.channels.cache.find(canal => canal.name === `🟠｜voice-${message.channel.name.split('-')[1]}`);
			interaction.reply(guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD11', { user: member.username }))
			setTimeout(() => guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`).delete(), 5000);
		}

		// make sure ticket has been set-up properly
		const supportRole = guild.roles.cache.get(dbEmbed.supportRoleID);
		if (!supportRole) return interaction.reply({ embeds: [channel.error('misc:NO_SUPPORT_ROLE', {}, true)], ephemeral: true });
		const category = guild.channels.cache.get(dbEmbed.categoryID);
		if (!category) return interaction.reply({ embeds: [channel.error('misc:NO_CATEGORY', {}, true)], ephemeral: true });

		// create channel
		guild.channels.create({
			name: `🟠｜voice-${channel.name.split('-')[1]}`,
			type: ChannelType.GuildVoice,
			permissionOverwrites: [
				{ id: channel.name.split('-')[1], allow: [Flags.SendMessages, Flags.ViewChannel] },
				{ id: supportRole, allow: [Flags.SendMessages, Flags.ViewChannel] },
				{ id: guild.roles.everyone, deny: [Flags.SendMessages, Flags.ViewChannel] },
				{ id: bot.user, allow: [Flags.SendMessages, Flags.ViewChannel, Flags.EmbedLinks] }],
			parent: category.id,
			reason: 'User created a voice channel for the ticket',
			topic: `Ticket Author Information: **ID:** ${member.id} | **Tag:** ${member.tag}`,
		})
	}
};