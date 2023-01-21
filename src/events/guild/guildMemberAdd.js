// Dependencies
const { Embed } = require('../../utils'),
	{ PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
	moment = require('moment'),
	{ welcomeDB, welcome, stickyRole, loggingSystem } = require('../../database/models'),
	{ createCanvas, loadImage, registerFont } = require('canvas'),
	Event = require('../../structures/Event');

registerFont(`${process.cwd()}/assets/fonts/calibri-regular.ttf`, { family: 'Calibri' });
registerFont(`${process.cwd()}/assets/fonts/mvboli.ttf`, { family: 'MV Boli' });

module.exports = class guildMemberAdd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, member) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: member.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: member.guild.id,
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: member.guild.id });
		}

		let dbWelcome = await welcomeDB.findOne({
			_id: member.guild.id,
		});
		if (!dbWelcome) {
			const newSettings1 = new welcomeDB({
				_id: member.guild.id,
			});
			await newSettings1.save().catch(() => { });
			dbWelcome = await welcomeDB.findOne({ _id: member.guild.id });
		}

		let welcomeAddon = await welcome.findOne({ _id: member.guild.id });
		if (!welcomeAddon) {
			const newSettings = new welcome({
				_id: member.guild.id
			});
			await newSettings.save().catch(() => { });
			welcomeAddon = await welcome.findOne({ _id: member.guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${member.user.tag} acabou de entrar no servidor: ${member.guild.name} [${member.guild.id}].`);

		if (member.user.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (logDB.ServerEvents.MemberJoinToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 3066993;

			const embed = new Embed(bot, member.guild)
				.setDescription(`<:Informao:823004619805294643> ${member.toString()} ${member.guild.translate('Events/guildMemberAdd:GUILD_MEMBER_ADD')}.\n${member.guild.translate('Events/guildMemberAdd:GUILD_MEMBER_ADD3')} **${member.guild.memberCount}** ${member.guild.translate('Events/guildMemberAdd:GUILD_MEMBER_ADD4')} <:SkyeUau1:823047534707605525>`)
				.setColor(color)
				.setFooter({ text: `ID: ${member.id}` })
				.setThumbnail(`${member.user.displayAvatarURL()}`)
				.setAuthor({ name: member.guild.translate('Events/guildMemberAdd:GUILD_MEMBER_ADD5'), iconURL: 'https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif' })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' [WEBHOOK] ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
			}
		}

		/** ------------------------------------------------------------------------------------------------
		* [OLD] WELCOME CODE [TEMPORARY]
		* ------------------------------------------------------------------------------------------------ */
		if (dbWelcome.welcomeToggle == true && welcomeAddon.welcomeToggle == false) {
			// Send private message to user
			if (dbWelcome.welcomePrivateToggle == true) {

				let welcomeMessageText = dbWelcome.welcomeMessageText.replace(/{user}/g, `${member}`)
					.replace(/{user_tag}/g, `${member.user.tag}`)
					.replace(/{user_name}/g, `${member.user.username}`)
					.replace(/{user_ID}/g, `${member.id}`)
					.replace(/{guild_name}/g, `${member.guild.name}`)
					.replace(/{guild_ID}/g, `${member.guild.id}`)
					.replace(/{memberCount}/g, `${member.guild.memberCount}`)
					.replace(/{size}/g, `${member.guild.memberCount}`)
					.replace(/{guild}/g, `${member.guild.name}`)
					.replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
					.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);

				if (dbWelcome.welcomeEmbedToggle == false) {
					member.send(welcomeMessageText).catch(e => bot.logger.error(e.message));
				} else {
					let embed = new Embed(bot, member.guild)

					let color = dbWelcome.welcomeEmbed.color
					if (color) embed.setColor(color)

					let title = dbWelcome.welcomeEmbed.title
					if (title !== null) embed.setTitle(title)

					let titleUrl = dbWelcome.welcomeEmbed.titleURL
					if (titleUrl !== null) embed.setURL(titleUrl)

					let textEmbed = dbWelcome.welcomeEmbed.description.replace(/{user}/g, `${member}`)
						.replace(/{user_tag}/g, `${member.user.tag}`)
						.replace(/{user_name}/g, `${member.user.username}`)
						.replace(/{user_ID}/g, `${member.id}`)
						.replace(/{guild_name}/g, `${member.guild.name}`)
						.replace(/{guild_ID}/g, `${member.guild.id}`)
						.replace(/{memberCount}/g, `${member.guild.memberCount}`)
						.replace(/{size}/g, `${member.guild.memberCount}`)
						.replace(/{guild}/g, `${member.guild.name}`)
						.replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
						.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)

					if (textEmbed !== null) embed.setDescription(textEmbed)

					let authorName = dbWelcome.welcomeEmbed.author.name.replace(/{user_tag}/g, `${member.user.tag}`)
						.replace(/{user_name}/g, `${member.user.username}`)
						.replace(/{user_ID}/g, `${member.id}`)
						.replace(/{guild_name}/g, `${member.guild.name}`)
						.replace(/{guild_ID}/g, `${member.guild.id}`)
						.replace(/{memberCount}/g, `${member.guild.memberCount}`)
						.replace(/{size}/g, `${member.guild.memberCount}`)
						.replace(/{guild}/g, `${member.guild.name}`)

					if (authorName !== null) embed.setAuthor({ name: authorName });

					let authorIcon = dbWelcome.welcomeEmbed.author.icon
					if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon })

					let authorUrl = dbWelcome.welcomeEmbed.author.url
					if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl })


					let footer = dbWelcome.welcomeEmbed.footer
					if (footer !== null) embed.setFooter({ text: footer })

					let footerIcon = dbWelcome.welcomeEmbed.footerIcon
					if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon })

					let timestamp = dbWelcome.welcomeEmbed.timestamp
					if (timestamp === true) embed.setTimestamp()


					let thumbnail = dbWelcome.welcomeEmbed.thumbnail
					if (thumbnail === "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 })
					if (thumbnail !== null) embed.setThumbnail(thumbnail)

					let image = dbWelcome.welcomeEmbed.image
					if (image === "{userAvatar}") image = member.user.displayAvatarURL({ dynamic: true, size: 512 })
					if (image !== null) embed.setImage(image)

					member.send({ embeds: [embed] }).catch(() => { })
				}
			}

			if (dbWelcome.welcomePrivateToggle == false) {
				if (dbWelcome.welcomeEmbedToggle == false) {
					const channel = member.guild.channels.cache.get(dbWelcome.welcomeMessageChannel);
					if (channel && channel.viewable && channel.permissionsFor(bot.user).has([Flags.SendMessages, Flags.EmbedLinks])) channel.send(dbWelcome.welcomeMessageText.replace(/{user}/g, `${member}`)
						.replace(/{user_tag}/g, `${member.user.tag}`)
						.replace(/{user_name}/g, `${member.user.username}`)
						.replace(/{user_ID}/g, `${member.id}`)
						.replace(/{guild_name}/g, `${member.guild.name}`)
						.replace(/{guild_ID}/g, `${member.guild.id}`)
						.replace(/{memberCount}/g, `${member.guild.memberCount}`)
						.replace(/{size}/g, `${member.guild.memberCount}`)
						.replace(/{guild}/g, `${member.guild.name}`)
						.replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
						.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)).catch(e => bot.logger.error(e.message));
				} else {
					const channel = member.guild.channels.cache.get(dbWelcome.welcomeMessageChannel);

					let embed = new Embed(bot, member.guild)

					let color = dbWelcome.welcomeEmbed.color
					if (color) embed.setColor(color)

					let title = dbWelcome.welcomeEmbed.title
					if (title !== null) embed.setTitle(title)

					let titleUrl = dbWelcome.welcomeEmbed.titleURL
					if (titleUrl !== null) embed.setURL(titleUrl)

					let textEmbed = dbWelcome.welcomeEmbed.description.replace(/{user}/g, `${member}`)
						.replace(/{user_tag}/g, `${member.user.tag}`)
						.replace(/{user_name}/g, `${member.user.username}`)
						.replace(/{user_ID}/g, `${member.id}`)
						.replace(/{guild_name}/g, `${member.guild.name}`)
						.replace(/{guild_ID}/g, `${member.guild.id}`)
						.replace(/{memberCount}/g, `${member.guild.memberCount}`)
						.replace(/{size}/g, `${member.guild.memberCount}`)
						.replace(/{guild}/g, `${member.guild.name}`)
						.replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
						.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)

					if (textEmbed !== null) embed.setDescription(textEmbed)

					let authorName = dbWelcome.welcomeEmbed.author.name.replace(/{user_tag}/g, `${member.user.tag}`)
						.replace(/{user_name}/g, `${member.user.username}`)
						.replace(/{user_ID}/g, `${member.id}`)
						.replace(/{guild_name}/g, `${member.guild.name}`)
						.replace(/{guild_ID}/g, `${member.guild.id}`)
						.replace(/{memberCount}/g, `${member.guild.memberCount}`)
						.replace(/{size}/g, `${member.guild.memberCount}`)
						.replace(/{guild}/g, `${member.guild.name}`)

					if (authorName !== null) embed.setAuthor({ name: authorName });

					let authorIcon = dbWelcome.welcomeEmbed.author.icon
					if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

					let authorUrl = dbWelcome.welcomeEmbed.author.url
					if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


					let footer = dbWelcome.welcomeEmbed.footer
					if (footer !== null) embed.setFooter({ text: footer });

					let footerIcon = dbWelcome.welcomeEmbed.footerIcon
					if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

					let timestamp = dbWelcome.welcomeEmbed.timestamp
					if (timestamp === true) embed.setTimestamp()


					let thumbnail = dbWelcome.welcomeEmbed.thumbnail
					if (thumbnail === "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 })
					if (thumbnail !== null) embed.setThumbnail(thumbnail)

					let image = dbWelcome.welcomeEmbed.image
					if (image === "{userAvatar}") image = member.user.displayAvatarURL({ dynamic: true, size: 512 })
					if (image !== null) embed.setImage(image)

					if (channel && channel.viewable && channel.permissionsFor(bot.user).has([Flags.SendMessages, Flags.EmbedLinks])) channel.send({ embeds: [embed] }).catch(() => { })
				}
			}
		}

		/** ------------------------------------------------------------------------------------------------
		* [NEW] WELCOME CODE
		* ------------------------------------------------------------------------------------------------ */
		// MODO PRIVATE
		if (welcomeAddon.welcomeToggle == true && welcomeAddon.welcomePrivateToggle == true) {
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('warnDM')
						.setLabel(`Sent from server: ${member.guild.name}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true)
				);

			if (member) {
				switch (welcomeAddon.messageType) {
					case 'message':
						if (welcomeAddon.welcomeNotifyMention === true) member.send({ content: `<@${member.user.id}>` });
						member.send({
							content: welcomeAddon.welcomeMessageText.replace(/{user}/g, `${member}`)
								.replace(/{user_tag}/g, `${member.user.tag}`)
								.replace(/{user_name}/g, `${member.user.username}`)
								.replace(/{userName}/g, `${member.user.username}`)
								.replace(/{user_ID}/g, `${member.id}`)
								.replace(/{guild_name}/g, `${member.guild.name}`)
								.replace(/{guild_ID}/g, `${member.guild.id}`)
								.replace(/{memberCount}/g, `${member.guild.memberCount}`)
								.replace(/{size}/g, `${member.guild.memberCount}`)
								.replace(/{guild}/g, `${member.guild.name}`)
								.replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
								.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`),
							components: [row]
						}).catch(e => bot.logger.error(`Erro ao enviar mensagem de boas vindas no privado do usuario (provavelmente está bloqueado)`));
						break;
					case 'embed':
						let embed = new Embed(bot, member.guild)

						let color = welcomeAddon.welcomeEmbed.color;
						if (color) embed.setColor(color)

						let title = welcomeAddon.welcomeEmbed.title;
						if (title !== null) embed.setTitle(title)

						let titleUrl = welcomeAddon.welcomeEmbed.titleURL;
						if (titleUrl !== null) embed.setURL(titleUrl)

						let textEmbed = welcomeAddon.welcomeEmbed.description.replace(/{user}/g, `${member}`)
							.replace(/{user_tag}/g, `${member.user.tag}`)
							.replace(/{user_name}/g, `${member.user.username}`)
							.replace(/{userName}/g, `${member.user.username}`)
							.replace(/{user_ID}/g, `${member.id}`)
							.replace(/{guild_name}/g, `${member.guild.name}`)
							.replace(/{guild_ID}/g, `${member.guild.id}`)
							.replace(/{memberCount}/g, `${member.guild.memberCount}`)
							.replace(/{size}/g, `${member.guild.memberCount}`)
							.replace(/{guild}/g, `${member.guild.name}`)
							.replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
							.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)

						if (textEmbed !== null) embed.setDescription(textEmbed)

						let authorName = welcomeAddon.welcomeEmbed.author.name;

						if (authorName !== null) embed.setAuthor({ name: authorName });

						let authorIcon = welcomeAddon.welcomeEmbed.author.icon;
						if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

						let authorUrl = welcomeAddon.welcomeEmbed.author.url;
						if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


						let footer = welcomeAddon.welcomeEmbed.footer;
						if (footer !== null) embed.setFooter({ text: footer });

						let footerIcon = welcomeAddon.welcomeEmbed.footerIcon
						if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

						let timestamp = welcomeAddon.welcomeEmbed.timestamp;
						if (timestamp === true) embed.setTimestamp()


						let thumbnail = welcomeAddon.welcomeEmbed.thumbnail;
						if (thumbnail == "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (thumbnail !== null) embed.setThumbnail(thumbnail)

						let image = welcomeAddon.welcomeEmbed.image;
						if (image == "{userAvatar}") image = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (image !== null) embed.setImage(image)

						if (welcomeAddon.welcomeNotifyMention === true) member.send({ content: `<@${member.user.id}>` });
						member.send({ embeds: [embed], components: [row] }).catch(e => bot.logger.error(`Erro ao enviar mensagem de boas vindas no privado do usuario (provavelmente está bloqueado) ou nao configurou corretamente o embed`));
						break;
					case 'image':
						const canvas = createCanvas(770, 380);
						const ctx = canvas.getContext('2d');

						// estrutura
						const base = await loadImage(welcomeAddon?.welcomeImageColor?.replace('../../', 'https://hopebot.top/') ?? welcomeAddon.welcomeImageModel);
						const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 }));
						const members = [...member.guild.members.cache
							.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
							.values()];

						const position = new Promise((ful) => {
							for (let i = 1; i < members.length + 1; i++) {
								if (members[i - 1].id === member.id) ful(i);
							}
						});

						var cw = canvas.width;
						var ch = canvas.height - 60;
						// rederenzando
						ctx.drawImage(base, 0, 0, 768, 376);
						// ADICIONA O AVATAR DO USUARIO
						ctx.beginPath();
						ctx.arc(cw / 2, ch / 2, 90, 0, Math.PI * 2); // 1 = <<< e >>> | 2 = ^ e ` | 3 = TAMANHO CIRCULO | 4 = sla
						ctx.lineWidth = 8;
						ctx.strokeStyle = '#fff';
						ctx.stroke();
						ctx.closePath();
						ctx.save();
						ctx.clip();
						ctx.drawImage(avatar, 248, 0, 320, 320);
						ctx.restore();
						// ADICIONA O NOME E TAG DO USUARIO
						ctx.beginPath();
						ctx.font = '26px MV Boli';
						ctx.fillStyle = '#FFFFFF';
						// clear the canvas
						ctx.textAlign = 'center';
						// draw the text
						ctx.fillText(`${welcomeAddon.welcomeImageTitle.replace(/{userName}/g, `${member.displayName}`)}`, cw / 2, 299);
						ctx.closePath();
						ctx.save();
						// Start Fill opactiy
						ctx.globalAlpha = .75;
						ctx.beginPath();
						ctx.rect(3, 3, 768, 349);
						ctx.fillStyle = '#17181e00';
						ctx.fill();
						ctx.closePath();
						ctx.beginPath();
						ctx.rect(3, 3, 768, 349);
						ctx.fillStyle = '#17181e00';
						ctx.fill();
						ctx.closePath();
						ctx.beginPath();
						ctx.rect(3, 3, 768, 349);
						ctx.fillStyle = '#17181e00';
						ctx.fill();
						ctx.closePath();
						// End fill opactiy
						// ADD DESC TEXT
						ctx.beginPath();
						ctx.font = '26px MV Boli';
						ctx.fillStyle = welcomeAddon.welcomeImageTextColor;
						ctx.textAlign = 'center';
						ctx.shadowColor = welcomeAddon.welcomeImageTextColor; // string
						ctx.shadowOffsetX = 2; // integer
						ctx.shadowOffsetY = 3; // integer
						ctx.shadowBlur = 10; // integer
						ctx.fillText(`${welcomeAddon.welcomeImageSub.replace(/{number}/g, `${await position}`)}`, cw / 2, 332);
						ctx.closePath();
						ctx.save();

						if (welcomeAddon.welcomeNotifyMention === true) member.send({ content: `<@${member.user.id}>` });
						member.send({
							files: [{
								attachment: canvas.toBuffer(),
								name: 'welcome-hope-card.png',
							}], components: [row]
						}).catch(e => bot.logger.error(`Erro ao enviar mensagem de boas vindas no privado do usuário (provavelmente está bloqueado) ou nao configurou corretamente o embed`));
						break;
					default:
						break;
				}
			}
			// MODO GUILD	
		} else if (welcomeAddon.welcomeToggle == true && welcomeAddon.welcomePrivateToggle == false) {
			const channel = member.guild.channels.cache.get(welcomeAddon.welcomeChannel);
			if (channel && channel.viewable && channel.permissionsFor(bot.user).has([Flags.SendMessages, Flags.EmbedLinks])) {
				switch (welcomeAddon.messageType) {
					case 'message':
						if (welcomeAddon.welcomeNotifyMention === true) channel.send({ content: `<@${member.user.id}>` });
						channel.send({
							content: welcomeAddon.welcomeMessageText.replace(/{user}/g, `${member}`)
								.replace(/{user_tag}/g, `${member.user.tag}`)
								.replace(/{user_name}/g, `${member.user.username}`)
								.replace(/{userName}/g, `${member.user.username}`)
								.replace(/{user_ID}/g, `${member.id}`)
								.replace(/{guild_name}/g, `${member.guild.name}`)
								.replace(/{guild_ID}/g, `${member.guild.id}`)
								.replace(/{memberCount}/g, `${member.guild.memberCount}`)
								.replace(/{size}/g, `${member.guild.memberCount}`)
								.replace(/{guild}/g, `${member.guild.name}`)
								.replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
								.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)
						}).catch(e => bot.logger.error(`Erro ao enviar mensagem de boas-vindas ao canal ${channel.name} do servidor ${member.guild.name} (${member.guild.id})`));
						break;
					case 'embed':
						let embed = new Embed(bot, member.guild)

						let color = welcomeAddon.welcomeEmbed.color
						if (color) embed.setColor(color)

						let title = welcomeAddon.welcomeEmbed.title
						if (title !== null) embed.setTitle(title)

						let titleUrl = welcomeAddon.welcomeEmbed.titleURL
						if (titleUrl !== null) embed.setURL(titleUrl)

						let textEmbed = welcomeAddon.welcomeEmbed.description.replace(/{user}/g, `${member}`)
							.replace(/{user_tag}/g, `${member.user.tag}`)
							.replace(/{user_name}/g, `${member.user.username}`)
							.replace(/{userName}/g, `${member.user.username}`)
							.replace(/{user_ID}/g, `${member.id}`)
							.replace(/{guild_name}/g, `${member.guild.name}`)
							.replace(/{guild_ID}/g, `${member.guild.id}`)
							.replace(/{memberCount}/g, `${member.guild.memberCount}`)
							.replace(/{size}/g, `${member.guild.memberCount}`)
							.replace(/{guild}/g, `${member.guild.name}`)
							.replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
							.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)

						if (textEmbed !== null) embed.setDescription(textEmbed)

						let authorName = welcomeAddon.welcomeEmbed.author.name;

						if (authorName !== null) embed.setAuthor({ name: authorName });

						let authorIcon = welcomeAddon.welcomeEmbed.author.icon;
						if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

						let authorUrl = welcomeAddon.welcomeEmbed.author.url;
						if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


						let footer = welcomeAddon.welcomeEmbed.footer;
						if (footer !== null) embed.setFooter({ text: footer });

						let footerIcon = welcomeAddon.welcomeEmbed.footerIcon
						if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

						let timestamp = welcomeAddon.welcomeEmbed.timestamp;
						if (timestamp === true) embed.setTimestamp()


						let thumbnail = welcomeAddon.welcomeEmbed.thumbnail;
						if (thumbnail == "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (thumbnail !== null) embed.setThumbnail(thumbnail)

						let image = welcomeAddon.welcomeEmbed.image;
						if (image == "{userAvatar}") image = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (image !== null) embed.setImage(image)

						if (welcomeAddon.welcomeNotifyMention === true) channel.send({ content: `<@${member.user.id}>` });
						channel.send({ embeds: [embed] }).catch(e => bot.logger.error(`Erro ao enviar mensagem de boas-vindas ao canal ${channel.name} do servidor ${member.guild.name} (${member.guild.id})`));
						break;
					case 'image':
						const canvas = createCanvas(770, 380);
						const ctx = canvas.getContext('2d');

						// estrutura
						const base = await loadImage(welcomeAddon?.welcomeImageColor?.replace('../../', 'https://hopebot.top/') ?? welcomeAddon.welcomeImageModel);
						const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 }));
						const members = [...member.guild.members.cache
							.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
							.values()];

						const position = new Promise((ful) => {
							for (let i = 1; i < members.length + 1; i++) {
								if (members[i - 1].id === member.id) ful(i);
							}
						});

						var cw = canvas.width;
						var ch = canvas.height - 60;
						// rederenzando
						ctx.drawImage(base, 0, 0, 768, 376);
						// ADICIONA O AVATAR DO USUARIO
						ctx.beginPath();
						ctx.arc(cw / 2, ch / 2, 90, 0, Math.PI * 2); // 1 = <<< e >>> | 2 = ^ e ` | 3 = TAMANHO CIRCULO | 4 = sla
						ctx.lineWidth = 8;
						ctx.strokeStyle = '#fff';
						ctx.stroke();
						ctx.closePath();
						ctx.save();
						ctx.clip();
						ctx.drawImage(avatar, 248, 0, 320, 320);
						ctx.restore();
						// ADICIONA O NOME E TAG DO USUARIO
						ctx.beginPath();
						ctx.font = '26px MV Boli';
						ctx.fillStyle = '#FFFFFF';
						// clear the canvas
						ctx.textAlign = 'center';
						// draw the text
						ctx.fillText(`${welcomeAddon.welcomeImageTitle.replace(/{userName}/g, `${member.displayName}`)}`, cw / 2, 299);
						ctx.closePath();
						ctx.save();
						// Start Fill opactiy
						ctx.globalAlpha = .75;
						ctx.beginPath();
						ctx.rect(3, 3, 768, 349);
						ctx.fillStyle = '#17181e00';
						ctx.fill();
						ctx.closePath();
						ctx.beginPath();
						ctx.rect(3, 3, 768, 349);
						ctx.fillStyle = '#17181e00';
						ctx.fill();
						ctx.closePath();
						ctx.beginPath();
						ctx.rect(3, 3, 768, 349);
						ctx.fillStyle = '#17181e00';
						ctx.fill();
						ctx.closePath();
						// End fill opactiy
						// ADD DESC TEXT
						ctx.beginPath();
						ctx.font = '26px MV Boli';
						ctx.fillStyle = welcomeAddon.welcomeImageTextColor;
						ctx.textAlign = 'center';
						ctx.shadowColor = welcomeAddon.welcomeImageTextColor; // string
						ctx.shadowOffsetX = 2; // integer
						ctx.shadowOffsetY = 3; // integer
						ctx.shadowBlur = 10; // integer
						ctx.fillText(`${welcomeAddon.welcomeImageSub.replace(/{number}/g, `${await position}`)}`, cw / 2, 332);
						ctx.closePath();
						ctx.save();

						if (welcomeAddon.welcomeNotifyMention === true) channel.send({ content: `<@${member.user.id}>` });
						channel.send({
							files: [{
								attachment: canvas.toBuffer(),
								name: 'welcome-hope-card.png',
							}],
						}).catch(e => bot.logger.error(`Erro ao enviar mensagem de boas-vindas ao canal ${channel.name} do servidor ${member.guild.name} (${member.guild.id})`));
						break;
					default:
						break;
				}
			}
		}

		/** ------------------------------------------------------------------------------------------------
		* [ADDON] AUTO-ROLES
		* ------------------------------------------------------------------------------------------------ */
		try {
			let roles = settings.autoroleID;

			if (settings.autoroleToggle === true) {
				roles.forEach(async function (r) {
					let cargo = member.guild.roles.cache.get(r);
					if (cargo) {
						member.roles.add(cargo.id);
					} else {
						return;
					}
				})
			}
		} catch (err) {
			console.log(dbWelcome.welcomeRoleGive);
			bot.logger.error(`Evento: '${this.conf.name}' [WelcomeRoleToggle] ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
		}

		/** ------------------------------------------------------------------------------------------------
		* [ADDON] STICKY-ROLES
		* ------------------------------------------------------------------------------------------------ */
		let sticky = await stickyRole.findOne({
			_id: member.guild.id
		})
		if (!sticky) {
			const newSettingss = new stickyRole({ _id: member.guild.id });
			await newSettingss.save().catch(() => { });
			sticky = await stickyRole.findOne({ _id: member.guild.id });
		}

		let roles = sticky.stickyroleID;

		if (sticky.stickyroleToggle === true) {
			roles.forEach(async function (r) {
				let cargo = member.guild.roles.cache.get(r);
				if (sticky.stickyroleUser.includes(member.user.id)) {
					member.roles.add(cargo.id);
				} else {
					return;
				}
			})
		}

		/** ------------------------------------------------------------------------------------------------
		* [ADDON] AUTO-NICK
		* ------------------------------------------------------------------------------------------------ */
		if (settings.AutoNickToggle === true) {
			if (member.user.bot) return;
			member.setNickname(settings.AutoNickName);
			/* await member.guild
				.createRole({
					name: member.id,
					color: "#f86f6f"
				}) */
		}
		/** ------------------------------------------------------------------------------------------------
		* [AUTO-MOD] ANTI-ALT (Anti new discord accounts)
		* ------------------------------------------------------------------------------------------------ */

		// VERIFICA SE O ADDON ANTI-ALT ESTÁ ATIVO
		if (settings.Auto_ModAntiAlt == true) {
			// bot.logger.debug(`ASD Member: ${member.user.tag} acabou de entrar no servidor: ${member.guild.name} [${member.guild.id}].`);
			// let arr = settings.Auto_ModAntiAltAllowed
			// if (!arr.includes(member.id)) {

			// let altLog = member.guild.channels.cache.get(settings.ModLogchannel);
			const day = Number(settings.Auto_ModAntiAltLimit);
			const x = Date.now() - member.user.createdAt;
			const created = Math.floor(x / 86400000);

			if (day >= created) {
				let action;
				if (settings.Auto_ModAntiAltAction && settings.Auto_ModAntiAltAction.toLowerCase() === "ban") {
					await member.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: 'Alt Account | Alt Detector Module' })
					action = "Banned";
				}
				if (settings.Auto_ModAntiAltAction && settings.Auto_ModAntiAltAction.toLowerCase() === "kick") {
					await member.kick({ reason: "Alt Account | Alt Detector Module" }).catch(() => {
						// do nothing.
					});
					action = "Kicked";
				}

				// EXECUTA A PUNIÇÃO AO USUARIO DE ACORDO COM A OPÇÃO DEFINIDA AO AUTO-MOD PELO BANCO DE DADOS
				bot.logger.automod(`[AUTO-MOD] Anti-ALT: Um usuario foi detectado como ALT, iniciando ações adequadas ao usuario.`);

				const embed = new Embed(bot, bot.guilds.cache.get(member.guild.settings.guildID))
					.setDescription(`**\`${action}\` ${member.user.tag} from the guild.**\n\n**Reason:** Alt Detector\n\n__**Account created at:**__ ${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)
					.setColor(3066993)
					.setFooter({ text: `ID: ${member.id}` })
					.setThumbnail(`${member.user.displayAvatarURL()}`)
					.setAuthor({ name: '[AUTO-MOD — ALT DETECTED]', iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.setTimestamp();

				try {
					const modchannel = await bot.channels.fetch(settings.ModLogchannel).catch(() => {
						// do nothing.
					});
					if (modchannel && modchannel.guild.id == member.guild.id) bot.addEmbed(modchannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
				}
			}
		}

		/** ------------------------------------------------------------------------------------------------
		* VERIFICA SE O USUARIO QUE ENTROU NO SERVIDOR DE SUPORTE É DONO DE UM SERVER COM A HOPE
		* ------------------------------------------------------------------------------------------------ */
		/* if (member.guild.id == '804851508944306236') {
			// Get unique owner count
			let ownerPool = [];
			await bot.guilds.cache.forEach(guild => {
				ownerPool.push(guild.ownerId);
			});

			var owners = ownerPool;

			var uniq = owners.reduce(function (a, b) {
				if (a.indexOf(b) < 0) a.push(b);
				return a;
			}, []);

			uniq.forEach(async function (id) {
				// console.log(id)
				// console.log(owner)
				if (member.id === id) {
					await member.roles.add('899080816989184050');
				} else {
					return;
				}
			})
		} */
	}
};
