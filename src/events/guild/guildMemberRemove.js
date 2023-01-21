// Dependencies
const { Embed } = require('../../utils'),
	{ PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
	{ RankSchema, welcomeDB, welcome, loggingSystem } = require('../../database/models'),
	moment = require('moment'),
	{ createCanvas, loadImage, registerFont } = require('canvas'),
	Event = require('../../structures/Event');

registerFont(`${process.cwd()}/assets/fonts/calibri-regular.ttf`, { family: 'Calibri' });
registerFont(`${process.cwd()}/assets/fonts/mvboli.ttf`, { family: 'MV Boli' });

module.exports = class guildMemberRemove extends Event {
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
		if (bot.config.debug) bot.logger.debug(`Member: ${member.user.tag} acabou de sair do servidor: ${member.guild.name} [${member.guild.id}].`);

		if (member.user.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberRemove is for logging
		if (logDB.ServerEvents.MemberLeaveToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = '#fd003a';

			const embed = new Embed(bot, member.guild)
				.setDescription(`<:SkyeChoro1:823047534498938880> ${member.user.username} ${member.guild.translate('Events/guildMemberRemove:GUILD_MEMBER_REMOVE')} **${member.guild.memberCount}** ${member.guild.translate('Events/guildMemberRemove:GUILD_MEMBER_REMOVE1')}`)
				.setColor(color)
				.setFooter({ text: `ID: ${member.id}` })
				.setThumbnail(`${member.user.displayAvatarURL()}`)
				.setAuthor({ name: `${member.guild.translate('Events/guildMemberRemove:GUILD_MEMBER_REMOVE2')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.addFields({ name: `${member.guild.translate('Events/guildMemberRemove:GUILD_MEMBER_REMOVE3')}`, value: `${member.partial ? 'Unknown' : `${moment(member.joinedAt).format('llll')} (${Math.round((new Date() - member.joinedAt) / 86400000)} ${member.guild.translate('Events/guildMemberRemove:GUILD_MEMBER_REMOVE4')})`}`, inline: false })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
			}
		}

		if (welcomeAddon) {
			welcomeAddon.leaves.forEach(async (leave) => {
				let xx = leave - Date.now();
				let createdd = Math.floor(xx / 86400000);

				if (6 <= createdd) {
					removeA(welcomeAddon.leaves, leave)
					await welcomeAddon.save().catch(() => { })
				}
			});

			welcomeAddon.leaves.push(Date.now())
			await welcomeAddon.save().catch(() => { })
		};

		/** ------------------------------------------------------------------------------------------------
		* [OLD] WELCOME LEAVE CODE [TEMPORARY]
		* ------------------------------------------------------------------------------------------------ */
		if (dbWelcome.leaveToggle == true && welcomeAddon.leaveToggle == false) {
			if (dbWelcome.leavePrivateToggle == true) {

				let leaveGoodbyeText = dbWelcome.leaveGoodbyeText.replace(/{user}/g, `${member}`)
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

				if (dbWelcome.leaveEmbedToggle == false) {
					member.send({ content: leaveGoodbyeText }).catch(e => bot.logger.error(e.message));
				} else {
					let embed = new Embed(bot, member.guild)

					let color = dbWelcome.leaveEmbed.color;
					if (color) embed.setColor(color)

					let title = dbWelcome.leaveEmbed.title;
					if (title !== null) embed.setTitle(title)

					let titleUrl = dbWelcome.leaveEmbed.titleURL;
					if (titleUrl !== null) embed.setURL(titleUrl)

					let textEmbed = dbWelcome.leaveEmbed.description.replace(/{user}/g, `${member}`)
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

					let authorName = dbWelcome.leaveEmbed.author.name;

					if (authorName !== null) embed.setAuthor({ name: authorName });

					let authorIcon = dbWelcome.leaveEmbed.author.icon;
					if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

					let authorUrl = dbWelcome.leaveEmbed.author.url;
					if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


					let footer = dbWelcome.leaveEmbed.footer;
					if (footer !== null) embed.setFooter({ text: footer });

					let footerIcon = dbWelcome.leaveEmbed.footerIcon;
					if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

					let timestamp = dbWelcome.leaveEmbed.timestamp;
					if (timestamp === true) embed.setTimestamp()


					let thumbnail = dbWelcome.leaveEmbed.thumbnail;
					if (thumbnail === "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 })
					if (thumbnail !== null) embed.setThumbnail(thumbnail)

					member.send({ embeds: [embed] }).catch(() => { })
				}
			} else {
				const leaveChannel = member.guild.channels.cache.get(dbWelcome.leaveChannel);
				if (leaveChannel) {

					let leaveGoodbyeText = dbWelcome.leaveGoodbyeText.replace(/{user}/g, `${member}`)
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

					if (dbWelcome.leaveEmbedToggle == false) {
						leaveChannel.send({ content: leaveGoodbyeText });
					} else {
						let embed = new Embed(bot, member.guild)

						let color = dbWelcome.leaveEmbed.color;
						if (color) embed.setColor(color)

						let title = dbWelcome.leaveEmbed.title;
						if (title !== null) embed.setTitle(title)

						let titleUrl = dbWelcome.leaveEmbed.titleURL;
						if (titleUrl !== null) embed.setURL(titleUrl)

						let textEmbed = dbWelcome.leaveEmbed.description.replace(/{user}/g, `${member}`)
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

						let authorName = dbWelcome.leaveEmbed.author.name;

						if (authorName !== null) embed.setAuthor({ name: authorName });

						let authorIcon = dbWelcome.leaveEmbed.author.icon;
						if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

						let authorUrl = dbWelcome.leaveEmbed.author.url;
						if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


						let footer = dbWelcome.leaveEmbed.footer;
						if (footer !== null) embed.setFooter({ text: footer });

						let footerIcon = dbWelcome.leaveEmbed.footerIcon;
						if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

						let timestamp = dbWelcome.leaveEmbed.timestamp;
						if (timestamp === true) embed.setTimestamp()


						let thumbnail = dbWelcome.leaveEmbed.thumbnail;
						if (thumbnail === "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (thumbnail !== null) embed.setThumbnail(thumbnail)

						leaveChannel.send({ embeds: [embed] }).catch(() => { })
					}
				}
			}
		}

		/** ------------------------------------------------------------------------------------------------
		* [NEW] WELCOME CODE
		* ------------------------------------------------------------------------------------------------ */
		if (welcomeAddon.leaveToggle == true && welcomeAddon.leavePrivateToggle == true) {
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('warnDM')
						.setLabel(`Sent from server: ${member.guild.name}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true)
				);
			// const channel = member.guild.channels.cache.get(welcomeAddon.welcomeChannel);
			if (member) {
				switch (welcomeAddon.leaveMessageType) {
					case 'message':
						if (welcomeAddon.leaveNotifyMention === true) member.send({ content: `<@${member.user.id}>` });

						member.send({
							content: welcomeAddon.leaveMessageText.replace(/{user_tag}/g, `${member.user.tag}`)
								.replace(/{user_name}/g, `${member.user.username}`)
								.replace(/{userName}/g, `${member.user.username}`)
								.replace(/{user_ID}/g, `${member.id}`)
								.replace(/{guild_name}/g, `${member.guild.name}`)
								.replace(/{guild_ID}/g, `${member.guild.id}`)
								.replace(/{memberCount}/g, `${member.guild.memberCount}`)
								.replace(/{size}/g, `${member.guild.memberCount}`)
								.replace(/{guild}/g, `${member.guild.name}`)
								.replace(/{server}/g, `${member.guild.name}`)
								.replace(/{user}/g, `${member}`).replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
								.replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`),
							components: [row]
						}).catch(e => bot.logger.error(`Erro ao enviar mensagem de leave no privado do usuario (provavelmente está bloqueado)`));
						break;
					case 'embed':
						let embed = new Embed(bot, member.guild)

						let color = welcomeAddon.leaveEmbed.color;
						if (color) embed.setColor(color)

						let title = welcomeAddon.leaveEmbed.title;
						if (title !== null) embed.setTitle(title)

						let titleUrl = welcomeAddon.leaveEmbed.titleURL;
						if (titleUrl !== null) embed.setURL(titleUrl)

						let textEmbed = welcomeAddon.leaveEmbed.description.replace(/{user}/g, `${member}`)
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

						let authorName = welcomeAddon.leaveEmbed.author.name;

						if (authorName !== null) embed.setAuthor({ name: authorName });

						let authorIcon = welcomeAddon.leaveEmbed.author.icon;
						if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

						let authorUrl = welcomeAddon.leaveEmbed.author.url;
						if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


						let footer = welcomeAddon.leaveEmbed.footer;
						if (footer !== null) embed.setFooter({ text: footer });

						let footerIcon = welcomeAddon.leaveEmbed.footerIcon;
						if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

						let timestamp = welcomeAddon.leaveEmbed.timestamp;
						if (timestamp === true) embed.setTimestamp()


						let thumbnail = welcomeAddon.leaveEmbed.thumbnail;
						if (thumbnail == "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (thumbnail !== null) embed.setThumbnail(thumbnail)

						let image = welcomeAddon.leaveEmbed.image;
						if (image == "{userAvatar}") image = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (image !== null) embed.setImage(image)

						if (welcomeAddon.leaveNotifyMention === true) member.send({ content: `<@${member.user.id}>` });

						member.send({ embeds: [embed], components: [row] }).catch(e => bot.logger.error(`Erro ao enviar mensagem de leave no privado do usuario (provavelmente está bloqueado) ou nao configurou corretamente o embed`));
						break;
					case 'image':
						const canvas = createCanvas(770, 380);
						const ctx = canvas.getContext('2d');

						// estrutura
						const base = await loadImage(welcomeAddon?.leaveImageColor?.replace('../../', 'https://hopebot.top/') ?? welcomeAddon.leaveImageModel);
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
						ctx.fillText(`${welcomeAddon.leaveImageTitle.replace(/{userName}/g, `${member.displayName}`)}`, cw / 2, 299);
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
						ctx.fillStyle = welcomeAddon.leaveImageTextColor;
						ctx.textAlign = 'center';
						ctx.shadowColor = welcomeAddon.leaveImageTextColor; // string
						ctx.shadowOffsetX = 2; // integer
						ctx.shadowOffsetY = 3; // integer
						ctx.shadowBlur = 10; // integer
						ctx.fillText(`${welcomeAddon.leaveImageSub.replace(/{number}/g, `${await position}`)}`, cw / 2, 332);
						ctx.closePath();
						ctx.save();

						if (welcomeAddon.leaveNotifyMention === true) member.send({ content: `<@${member.user.id}>` });

						member.send({
							files: [{
								attachment: canvas.toBuffer(),
								name: 'leave-hope-card.png',
							}], components: [row]
						}).catch(e => bot.logger.error(`Erro ao enviar mensagem de leave no privado do usuario (provavelmente está bloqueado) ou nao configurou corretamente o embed`));
						break;
					default:
						break;
				}
			}
		} else if (welcomeAddon.leaveToggle == true && welcomeAddon.leavePrivateToggle == false) {
			const channel = member.guild.channels.cache.get(welcomeAddon.leaveChannel);
			if (channel && channel.viewable && channel.permissionsFor(bot.user).has([Flags.SendMessages, Flags.EmbedLinks])) {
				switch (welcomeAddon.leaveMessageType) {
					case 'message':
						if (welcomeAddon.leaveNotifyMention === true) channel.send({ content: `<@${member.user.id}>` });
						channel.send({
							content: welcomeAddon.leaveMessageText.replace(/{user}/g, `${member}`)
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
						}).catch(e => bot.logger.error(`Erro ao enviar mensagem de leave ao canal ${channel.name} do servidor ${member.guild.name} (${member.guild.id})`));
						break;
					case 'embed':
						let embed = new Embed(bot, member.guild)

						let color = welcomeAddon.leaveEmbed.color;
						if (color) embed.setColor(color)

						let title = welcomeAddon.leaveEmbed.title;
						if (title !== null) embed.setTitle(title)

						let titleUrl = welcomeAddon.leaveEmbed.titleURL;
						if (titleUrl !== null) embed.setURL(titleUrl)

						let textEmbed = welcomeAddon.leaveEmbed.description.replace(/{user}/g, `${member}`)
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

						let authorName = welcomeAddon.leaveEmbed.author.name;

						if (authorName !== null) embed.setAuthor({ name: authorName });

						let authorIcon = welcomeAddon.leaveEmbed.author.icon;
						if (authorIcon !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon });

						let authorUrl = welcomeAddon.leaveEmbed.author.url;
						if (authorUrl !== null) embed.setAuthor({ name: authorName, iconURL: authorIcon, url: authorUrl });


						let footer = welcomeAddon.leaveEmbed.footer;
						if (footer !== null) embed.setFooter({ text: footer });

						let footerIcon = welcomeAddon.leaveEmbed.footerIcon;
						if (footer && footerIcon !== null) embed.setFooter({ text: footer, iconURL: footerIcon });

						let timestamp = welcomeAddon.leaveEmbed.timestamp;
						if (timestamp === true) embed.setTimestamp()


						let thumbnail = welcomeAddon.leaveEmbed.thumbnail;
						if (thumbnail == "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (thumbnail !== null) embed.setThumbnail(thumbnail)

						let image = welcomeAddon.leaveEmbed.image;
						if (image == "{userAvatar}") image = member.user.displayAvatarURL({ dynamic: true, size: 512 })
						if (image !== null) embed.setImage(image)

						if (welcomeAddon.leaveNotifyMention === true) channel.send({ content: `<@${member.user.id}>` });
						channel.send({ embeds: [embed] }).catch(e => bot.logger.error(`Erro ao enviar mensagem de leave ao canal ${channel.name} do servidor ${member.guild.name} (${member.guild.id})`));
						break;
					case 'image':
						const canvas = createCanvas(770, 380);
						const ctx = canvas.getContext('2d');

						// estrutura
						const base = await loadImage(welcomeAddon?.leaveImageColor?.replace('../../', 'https://hopebot.top/') ?? welcomeAddon.leaveImageModel);
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
						ctx.fillText(`${welcomeAddon.leaveImageTitle.replace(/{userName}/g, `${member.displayName}`)}`, cw / 2, 299);
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
						ctx.fillStyle = welcomeAddon.leaveImageTextColor;
						ctx.textAlign = 'center';
						ctx.shadowColor = welcomeAddon.leaveImageTextColor; // string
						ctx.shadowOffsetX = 2; // integer
						ctx.shadowOffsetY = 3; // integer
						ctx.shadowBlur = 10; // integer
						ctx.fillText(`${welcomeAddon.leaveImageSub.replace(/{number}/g, `${await position}`)}`, cw / 2, 332);
						ctx.closePath();
						ctx.save();

						if (welcomeAddon.leaveNotifyMention === true) channel.send({ content: `<@${member.user.id}>` });
						channel.send({
							files: [{
								attachment: canvas.toBuffer(),
								name: 'leave-hope-card.png',
							}],
						}).catch(e => bot.logger.error(`Erro ao enviar mensagem de leave ao canal ${channel.name} do servidor ${member.guild.name} (${member.guild.id})`));
						break;
					default:
						break;
				}
			}
		}

		// Remove member's rank
		try {
			await RankSchema.findOneAndRemove({ userID: member.user.id, guildID: member.guild.id });
		} catch (err) {
			bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${member.guild.name} [${member.guild.id}]: ${err.message}.`);
		}
	}
};

function removeA(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax = arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}