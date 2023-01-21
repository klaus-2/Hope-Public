// Dependências
const { fetch } = require('undici'),
	{ Embed } = require(`../../utils`),
	html2md = require('html2markdown'),
	{ decode } = require('he'),
	text = require('../../utils/string'),
	{ PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

module.exports = class Steam extends Command {
	constructor(bot) {
		super(bot, {
			name: 'steam',
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Search for a game or user profile on Steam',
			usage: '<prefix><commandName> <store | user> <query>',
			examples: [
				'.steam user Klaus',
				'!steam store Conan Exiles'
			],
			cooldown: 5000,
			slash: true,
			options: [
				{
					name: 'option',
					description: 'Store = Search for a game/app on Steam store. | User = Searches the user profile of the steam user.',
					type: ApplicationCommandOptionType.String,
					choices: [...['store', 'user'].map(opt => ({ name: opt, value: opt }))].slice(0, 24),
					required: true,
				},
				{
					name: 'query',
					description: 'The name of the game/app or user to search according to the option chosen.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		switch (message.args[0]) {
			case 'store':
				const query = message.args.slice(1).join(' ') || 'Doki Doki Literature Club';

				const res = await fetch(`https://store.steampowered.com/api/storesearch/?cc=us&l=en&term=${encodeURI(query)}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
				if (!res || !res.total) return message.channel.error('Pesquisas/steam-loja:STEAM_LOJA', { query: query }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

				const body = await fetch(`https://store.steampowered.com/api/appdetails/?cc=us&l=en&appids=${res.items[0].id}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
				if (!body) return message.channel.send(message.translate('Pesquisas/steam-loja:STEAM_LOJA', { query: query })).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

				const data = body[res.items[0].id].data;
				const platformLogo = { windows: '<:windows:767062364042166321>', mac: '<:mac:767062376440659978>', linux: '<:linux:767062376440659978>' };
				const platformrequirements = { windows: 'pc_requirements', mac: 'mac_requirements', linux: 'linux_requirements' };
				const current = data.price_overview ? `${message.translate('Pesquisas/steam-loja:STEAM_LOJA1')}${data.price_overview.final / 100}` : message.translate('Pesquisas/steam-loja:STEAM_LOJA2');
				const original = data.price_overview ? `${message.translate('Pesquisas/steam-loja:STEAM_LOJA1')}${data.price_overview.initial / 100}` : message.translate('Pesquisas/steam-loja:STEAM_LOJA2');
				const price = current === original ? current : `~~${original}~~ ${current}`;
				const platforms = Object.entries(data.platforms).filter(([platform, has]) => has).map(([platform]) => {
					return {
						name: '\u200b', inline: true,
						value: `${platformLogo[platform]} ${decode(html2md(data[platformrequirements[platform]].minimum)).split(message.translate('Pesquisas/steam-loja:STEAM_LOJA3'))[0]}`
					}
				});
				platforms[0].name = message.translate('Pesquisas/steam-loja:STEAM_LOJA4');

				const embed = new Embed(bot, message.guild)
					.setColor(12317183)
					.setAuthor({ name: 'Steam', iconURL: 'https://i.imgur.com/xxr2UBZ.png', url: 'http://store.steampowered.com/' })
					.setTitle(data.name)
					.setURL(`http://store.steampowered.com/../${data.steam_appid}`)
					.setImage(res.items[0].tiny_image)
					.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Pesquisas/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
					.addFields([
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA5')}`, value: `•\u2000 ${price}`, inline: true },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA6')}`, value: `•\u2000 ${data.metacritic?.score || '???'}`, inline: true },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA7')}`, value: `•\u2000 ${data.recommendations ? data.recommendations.total : '???'}`, inline: true },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA8')}`, value: `•\u2000 ${data.release_date ? data.release_date.date : '???'}`, inline: true },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA9')}`, value: `${data.developers.map(m => `• ${m}`).join('\n')}`, inline: true },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA10')}`, value: `${data.publishers ? data.publishers.join(', ') || '???' : '???'}`, inline: true },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA11')}`, value: `${data.categories.map(m => `• ${m.description}`).join('\n')}`, inline: true },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA12')}`, value: `${data.genres.map(m => `• ${m.description}`).join('\n')}`, inline: true },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA13')}`, value: `${data.dlc ? data.dlc.length : 0}`, inline: true },
						{ name: '\u200b', value: `${text.truncate(decode(data.detailed_description.replace(/(<([^>]+)>)/ig, ' ')), 980)}` },
						{ name: `${message.translate('Pesquisas/steam-loja:STEAM_LOJA14')}`, value: `\u2000${text.truncate(html2md(data.supported_languages), 997)}` },
						...platforms
					])
				message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
				break;

			case 'user':
				const msg = await message.channel.send(message.translate('Pesquisas/steam:STEAM'));
				const token = bot.config.api_keys.steam;
				const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${message.args.slice(1).join(' ')}`;

				// buscar dados do usuário
				fetch(url, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(body => {
					if (body.response.success === 42) {
						msg.delete();
						return message.channel.error('misc:UNKNOWN_USER').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
					}

					const id = body.response.steamid;
					const summaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${id}`;
					const bans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${id}`;
					const state = [message.translate('Pesquisas/steam:STEAM1'), message.translate('Pesquisas/steam:STEAM2'), message.translate('Pesquisas/steam:STEAM3'), message.translate('Pesquisas/steam:STEAM4'), message.translate('Pesquisas/steam:STEAM5'), message.translate('Pesquisas/steam:STEAM6'), message.translate('Pesquisas/steam:STEAM7')];

					// obtem dados pessoais
					fetch(summaries, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(body2 => {
						if (!body2.response) {
							msg.delete();
							message.channel.error(settings.Language, 'ERROR_MESSAGE', message.translate('Pesquisas/steam:STEAM8')).then(m => m.timedDelete({ timeout: 5000 }));
						}

						const { personaname, avatarfull, realname, personastate, loccountrycode, profileurl, timecreated } = body2.response.players[0];

						// obtem dados de bans
						fetch(bans, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(body3 => {
							if (!body3.players) {
								msg.delete();
								message.channel.error(settings.Language, 'ERROR_MESSAGE', message.translate('Pesquisas/steam:STEAM9')).then(m => m.timedDelete({ timeout: 5000 }));
							}

							const { NumberOfGameBans } = body3.players[0];
							// envia resultados
							const embed = new Embed(bot, message.guild)
								.setColor(12317183)
								.setAuthor({ name: `${message.translate('Pesquisas/steam:STEAM10')} | ${personaname}`, iconURL: avatarfull })
								.setThumbnail(avatarfull)
								.setDescription(`**${message.translate('Pesquisas/steam:STEAM11')}** ${realname || message.translate('Pesquisas/steam:STEAM12')}\n
									**${message.translate('Pesquisas/steam:STEAM13')}** ${state[personastate]}\n
									**${message.translate('Pesquisas/steam:STEAM14')}** :flag_${loccountrycode ? loccountrycode.toLowerCase() : 'white'}:\n
									**${message.translate('Pesquisas/steam:STEAM15')}** ${moment(timecreated * 1000).format('llll')}\n
									**${message.translate('Pesquisas/steam:STEAM16')}** ${message.translate('Pesquisas/steam:STEAM17')} ${NumberOfGameBans}, ${message.translate('Pesquisas/steam:STEAM18')} ${NumberOfGameBans} \n
									**${message.translate('Pesquisas/steam:STEAM19')}** [${message.translate('Pesquisas/steam:STEAM20')}](${profileurl})`)
								.setTimestamp();
							msg.delete();
							message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
						});
					});
				});

				break;
			default:
				message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
				break;
		}
	}
	// EXEC - SLASH
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			option = args.get('option')?.value,
			query = args.get('query')?.value;


		try {
			// Get Interaction Message Data
			// await interaction.deferReply();

			switch (option) {
				case 'store':

					const res = await fetch(`https://store.steampowered.com/api/storesearch/?cc=us&l=en&term=${encodeURI(query)}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
					if (!res || !res.total) return interaction.reply({ embeds: [channel.error('Pesquisas/steam-loja:STEAM_LOJA', { query: query }, true)], ephemeral: true });

					const body = await fetch(`https://store.steampowered.com/api/appdetails/?cc=us&l=en&appids=${res.items[0].id}`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).catch(err => err);
					if (!body) return interaction.reply({ embeds: [channel.error('Pesquisas/steam-loja:STEAM_LOJA', { query: query }, true)], ephemeral: true });

					const data = body[res.items[0].id].data;
					const platformLogo = { windows: '<:windows:767062364042166321>', mac: '<:mac:767062376440659978>', linux: '<:linux:767062376440659978>' };
					const platformrequirements = { windows: 'pc_requirements', mac: 'mac_requirements', linux: 'linux_requirements' };
					const current = data.price_overview ? `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA1')}${data.price_overview.final / 100}` : guild.translate('Pesquisas/steam-loja:STEAM_LOJA2');
					const original = data.price_overview ? `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA1')}${data.price_overview.initial / 100}` : guild.translate('Pesquisas/steam-loja:STEAM_LOJA2');
					const price = current === original ? current : `~~${original}~~ ${current}`;
					const platforms = Object.entries(data.platforms).filter(([platform, has]) => has).map(([platform]) => {
						return {
							name: '\u200b', inline: true,
							value: `${platformLogo[platform]} ${decode(html2md(data[platformrequirements[platform]].minimum)).split(guild.translate('Pesquisas/steam-loja:STEAM_LOJA3'))[0]}`
						}
					});
					platforms[0].name = guild.translate('Pesquisas/steam-loja:STEAM_LOJA4');

					const embed = new Embed(bot, guild)
						.setColor(12317183)
						.setAuthor({ name: 'Steam', iconURL: 'https://i.imgur.com/xxr2UBZ.png', url: 'http://store.steampowered.com/' })
						.setTitle(data.name)
						.setURL(`http://store.steampowered.com/../${data.steam_appid}`)
						.setImage(res.items[0].tiny_image)
						.setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
						.addFields([
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA5')}`, value: `•\u2000 ${price}`, inline: true },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA6')}`, value: `•\u2000 ${data.metacritic?.score || '???'}`, inline: true },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA7')}`, value: `•\u2000 ${data.recommendations ? data.recommendations.total : '???'}`, inline: true },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA8')}`, value: `•\u2000 ${data.release_date ? data.release_date.date : '???'}`, inline: true },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA9')}`, value: `${data.developers.map(m => `• ${m}`).join('\n')}`, inline: true },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA10')}`, value: `${data.publishers ? data.publishers.join(', ') || '???' : '???'}`, inline: true },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA11')}`, value: `${data.categories.map(m => `• ${m.description}`).join('\n')}`, inline: true },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA12')}`, value: `${data.genres.map(m => `• ${m.description}`).join('\n')}`, inline: true },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA13')}`, value: `${data.dlc ? data.dlc.length : 0}`, inline: true },
							{ name: '\u200b', value: `${text.truncate(decode(data.detailed_description.replace(/(<([^>]+)>)/ig, ' ')), 980)}` },
							{ name: `${guild.translate('Pesquisas/steam-loja:STEAM_LOJA14')}`, value: `\u2000${text.truncate(html2md(data.supported_languages), 997)}` },
							...platforms
						])
					interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
					break;

				case 'user':
					// const msg = await interaction.reply(guild.translate('Pesquisas/steam:STEAM'));
					const token = bot.config.api_keys.steam;
					const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${query}`;

					// buscar dados do usuário
					fetch(url, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(body => {
						if (body.response.success === 42) {
							// msg.delete();
							return interaction.reply({ embeds: [channel.error('misc:UNKNOWN_USER', {}, true)], ephemeral: true });
						}

						const id = body.response.steamid;
						const summaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${id}`;
						const bans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${id}`;
						const state = [guild.translate('Pesquisas/steam:STEAM1'), guild.translate('Pesquisas/steam:STEAM2'), guild.translate('Pesquisas/steam:STEAM3'), guild.translate('Pesquisas/steam:STEAM4'), guild.translate('Pesquisas/steam:STEAM5'), guild.translate('Pesquisas/steam:STEAM6'), guild.translate('Pesquisas/steam:STEAM7')];

						// obtem dados pessoais
						fetch(summaries, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(body2 => {
							if (!body2.response) {
								// msg.delete();
								return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: guild.translate('Pesquisas/steam:STEAM8') }, true)], ephemeral: true });
							}

							const { personaname, avatarfull, realname, personastate, loccountrycode, profileurl, timecreated } = body2.response.players[0];

							// obtem dados de bans
							fetch(bans, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(body3 => {
								if (!body3.players) {
									// msg.delete();
									return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: guild.translate('Pesquisas/steam:STEAM9') }, true)], ephemeral: true });
								}

								const { NumberOfGameBans } = body3.players[0];
								// envia resultados
								const embed = new Embed(bot, guild)
									.setColor(12317183)
									.setAuthor({ name: `${guild.translate('Pesquisas/steam:STEAM10')} | ${personaname}`, iconURL: avatarfull })
									.setThumbnail(avatarfull)
									.setDescription(`**${guild.translate('Pesquisas/steam:STEAM11')}** ${realname || guild.translate('Pesquisas/steam:STEAM12')}\n
										**${guild.translate('Pesquisas/steam:STEAM13')}** ${state[personastate]}\n
										**${guild.translate('Pesquisas/steam:STEAM14')}** :flag_${loccountrycode ? loccountrycode.toLowerCase() : 'white'}:\n
										**${guild.translate('Pesquisas/steam:STEAM15')}** ${moment(timecreated * 1000).format('llll')}\n
										**${guild.translate('Pesquisas/steam:STEAM16')}** ${guild.translate('Pesquisas/steam:STEAM17')} ${NumberOfGameBans}, ${guild.translate('Pesquisas/steam:STEAM18')} ${NumberOfGameBans} \n
										**${guild.translate('Pesquisas/steam:STEAM19')}** [${guild.translate('Pesquisas/steam:STEAM20')}](${profileurl})`)
									.setTimestamp();
								// msg.delete();
								interaction.reply({ embeds: [embed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
							});
						});
					});

					break;
				default:
					interaction.reply({ embeds: [channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Pesquisas/${this.help.name}:EXAMPLE`)) })) }) }, true)], ephemeral: true });
					break;
			}
		} catch (error) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
		}
	}
};
