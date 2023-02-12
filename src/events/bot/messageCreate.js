// Dependencies
const { Collection, WebhookClient, PermissionsBitField } = require('discord.js'),
	{ WebHooks } = require(`${process.cwd()}/src/config.js`),
	LogCMD = new WebhookClient({ id: WebHooks[0].ID, token: WebHooks[0].TOKEN }),
	moment = require('moment'),
	{ Embed, func: { genInviteLink } } = require(`../../utils`),
	fs = require('fs'),
	autoResponse = require(`../../database/models/autoResponse.js`),
	HopeLevelSystem = require('../../helpers/HopeLevelSystem'),
	Event = require(`../../structures/Event`);

class MessageCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, message) {
		// console.log(Date.now() - message.createdTimestamp + 'ms')
		// record how many messages the bot see
		// bot.messagesSent++;

		// Bloqueia o uso de comandos na DM
		if (!message.guild) return;

		// Should not respond to bots
		if (message.author.bot) return;

		// Get server settings
		const settings = message.guild?.settings ?? require(`${process.cwd()}/assets/json/defaultGuildSettings.json`);
		if (Object.keys(settings).length == 0) return;

		// altera o padrão das datas/times
		moment.locale(message.translate('misc:regiao', {}, bot.guilds.cache.get(message.guild?.settings ?? require(`${process.cwd()}/assets/json/defaultGuildSettings.json`))));

		// Check if bot was mentioned
		if (new RegExp(`/<@(!?)${bot.user.id}>/g`).test(message.content)) {
			if (message.deletable) message.timedDelete({ timeout: 90000 });
			const embed = new Embed(bot, message.guild)
				.setAuthor({ name: `${message.translate('Events/message:MENSAGEM40')}`, iconURL: `${bot.user.displayAvatarURL({ format: 'png' })}` })
				.setFooter({ text: `${message.translate('Events/message:MENSAGEM41', { prefix: settings.prefix })}` })
				.setThumbnail(`${bot.user.displayAvatarURL({ format: 'png' })}`)
				.setDescription([
					`${message.translate('Events/message:MENSAGEM42', { prefix: settings.prefix })}`,
				].join('\n\n'))
				.addFields({
					name: `${message.translate('Events/message:MENSAGEM43')}`, value: [
						`${message.translate('Events/message:MENSAGEM44', { inviteLink: genInviteLink(bot) })}`,
					].join('\n'), inline: false
				},
					{
						name: `${message.translate('Events/message:MENSAGEM45')}`, value: [
							`${message.translate('Events/message:MENSAGEM46', { link: bot.config.SupportServer.link })}`,
						].join('\n'), inline: false
					});
			return message.reply({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 90000 }));
		}

		/** ------------------------------------------------------------------------------------------------
		* ADDON AUTO-MENSAGENS
		* ------------------------------------------------------------------------------------------------ */
		if (settings.AutoMessageToggle === "true") {
			const channel = message.guild.channels.cache.get(settings.AutoMessageChannel);
			let counter = 0;
			if (++counter === settings.AutoMessageCount) {
				channel.send({ content: settings.AutoMessage });
				counter = 0;
			}
		}

		/** ------------------------------------------------------------------------------------------------
		* ADDON AUTO-RESPOSTAS
		* ------------------------------------------------------------------------------------------------ */
		const autoResponseSettings = await autoResponse.findOne({ guildId: message.guild.id, name: message.content.toLowerCase() });

		if (autoResponseSettings && autoResponseSettings.name) {

			message.reply(autoResponseSettings.content.replace(/{user}/g, `${message.author}`)
				.replace(/{user_tag}/g, `${message.author.tag}`)
				.replace(/{user_name}/g, `${message.author.username}`)
				.replace(/{user_ID}/g, `${message.author.id}`)
				.replace(/{guild_name}/g, `${message.guild.name}`)
				.replace(/{guild_ID}/g, `${message.guild.id}`)
				.replace(/{memberCount}/g, `${message.guild.members.memberCount}`)
				.replace(/{size}/g, `${message.guild.members.memberCount}`)
				.replace(/{guild}/g, `${message.guild.name}`)
				.replace(/{member_createdAtAgo}/g, `${moment(message.author.createdTimestamp).fromNow()}`)
				.replace(/{member_createdAt}/g, `${moment(message.author.createdAt).format('Do MMMM YYYY, h:mm:ss a')}`));
			return;
		}

		// Check if message was a command
		const args = message.content.split(/ +/);
		if ([settings.prefix, `<@${bot.user.id}>`, `<@!${bot.user.id}>`].find(p => message.content.startsWith(p))) {
			const command = args.shift().slice(settings.prefix.length).toLowerCase();
			let cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
			if (!cmd && [`<@${bot.user.id}>`, `<@!${bot.user.id}>`].find(p => message.content.startsWith(p))) {
				// check to see if user is using mention as prefix
				cmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
				args.shift();
				if (!cmd) return;
			} else if (!cmd) {
				return;
			}
			message.args = args;

			// make sure user is not on banned list
			if (message.author.cmdBanned) {
				if (message.deletable) message.delete();
				return message.channel.error('events/message:BANNED_USER').then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Make sure guild only commands are done in the guild only
			if (!message.guild && cmd.conf.guildOnly) {
				if (message.deletable) message.delete();
				return message.channel.error('misc:GUILD_COMMAND_ERROR').then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Check to see if the command is being run in a blacklisted channel
			if ((settings.CommandChannelToggle) && (settings.CommandChannels.includes(message.channel.id))) {
				if (message.deletable) message.delete();
				return message.channel.error('misc:BLACKLISTED_CHANNEL', { user: message.author }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Make sure NSFW commands are only being run in a NSFW channel
			if ((message.channel.type !== 'DM') && ((!message.channel.nsfw) && (cmd.conf.nsfw))) {
				if (message.deletable) message.delete();
				const isnsfw = fs.readFileSync(message.translate('misc:NSFW'), 'utf8');
				const nsfw = JSON.parse(isnsfw).frases;
				const randomNSFW = nsfw[Math.floor(Math.random() * nsfw.length)];
				const embed = new Embed(bot, message.guild)
					.setColor(16741245)
					.setDescription(`${randomNSFW.texto}`);
				return message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 10000 }));
			}

			// Check if the command is from a disabled plugin
			if (!settings.plugins.includes(cmd.help.category) && cmd.help.category != 'Dono') return;

			// Make sure user does not have access to ownerOnly commands
			if (cmd.conf.ownerOnly && !bot.config.ownerID.includes(message.author.id)) {
				if (message.deletable) message.delete();
				return message.channel.error('Events/message:MESSAGE26').then(m => m.timedDelete({ timeout: 5000 }));
			}

			// check permissions
			if (message.guild) {
				// check bot permissions
				let neededPermissions = [];
				cmd.conf.botPermissions.forEach((perm) => {
					if ([PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Connect].includes(perm)) {
						if (!message.member.voice.channel) return;
						if (!message.member.voice.channel.permissionsFor(bot.user).has(perm)) {
							neededPermissions.push(perm);
						}
					} else if (!message.channel.permissionsFor(bot.user).has(perm)) {
						neededPermissions.push(perm);
					}

				});

				if (neededPermissions.length > 0) {
					const perms = new PermissionsBitField();
					neededPermissions.forEach((item) => perms.add(BigInt(item)));
					bot.logger.error(`Missing permission: \`${perms.toArray().join(', ')}\` in [${message.guild.id}].`);
					if (message.channel.permissionsFor(bot.user).has(PermissionsBitField.Flags.SendMessages)) {
						if (message.deletable) message.delete();
						return message.member.send({ content: message.translate('misc:MISSING_PERMISSION1', { PERMISSIONS: perms.toArray().map((p) => message.translate(`permissions:${p}`)).join(', '), guild: message.guild.name }) }).then(() => {
							// do nothing.
						}).catch(() => {
							return message.channel.send(message.translate('misc:MISSING_PERMISSION', { PERMISSIONS: perms.toArray().map((p) => message.translate(`permissions:${p}`)).join(', ') }));
						});
					} else {
						bot.logger.error(`Missing permission: \`${neededPermissions.join(', ')}\` in [${message.guild.id}].`);
						if (message.deletable) message.delete();
						return message.channel.send(message.translate('misc:MISSING_PERMISSION', { PERMISSIONS: perms.toArray().map((p) => message.translate(`permissions:${p}`)).join(', ') }));
					}
				}

				// check user permissions
				neededPermissions = [];
				cmd.conf.userPermissions.forEach((perm) => {
					if (!message.channel.permissionsFor(message.member).has(perm)) {
						neededPermissions.push(perm);
					}
				});

				if (neededPermissions.length > 0) {
					const perms = new PermissionsBitField();
					neededPermissions.forEach((item) => perms.add(BigInt(item)));
					if (message.deletable) message.delete();
					return message.channel.error('misc:USER_PERMISSION', { PERMISSIONS: perms.toArray().map((p) => message.translate(`permissions:${p}`)).join(', ') }).then(m => m.timedDelete({ timeout: 10000 }));
				}
			}

			// Check to see if user is in 'cooldown'
			if (!bot.cooldowns.has(cmd.help.name)) {
				bot.cooldowns.set(cmd.help.name, new Collection());
			}

			const now = Date.now();
			const timestamps = bot.cooldowns.get(cmd.help.name);
			const cooldownAmount = (message.author.premium ? cmd.conf.cooldown * 0.75 : cmd.conf.cooldown);

			if (timestamps.has(message.author.id)) {
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					if (message.deletable) message.delete();
					return message.channel.error('misc:COMMAND_COOLDOWN', { seconds: timeLeft.toFixed(0) }).then(m => m.timedDelete({ timeout: 5000 }));
				}
			}

			// run the command
			// bot.commandsUsed++;
			// if (bot.config.debug) bot.logger.cmd(`Comando: ${cmd.help.name} utilizado por ${message.author.tag}${!message.guild ? ' no privado' : ` no servidor: ${message.guild.name} (${message.guild.id})`}.`);
			message.channel.sendTyping();
			cmd.run(bot, message, settings);
			const timestamp = `[${moment().format('HH:mm:ss:SSS')}]:`;
			LogCMD.send(`${timestamp} \`CMD\`\nServidor: **${message.guild.name}** ID: (\`${message.guild.id}\`)\nForma ultilizada: **${message.content}**\nNome do comando: **${cmd.help.name}**\nUtilizado por: **${message.author.tag}** (\`${message.author.id}\`)\nNo canal: **#${message.channel.name}** (\`${message.channel.id}\`)`);
			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		} else if (message.guild) {
			if (settings.plugins.includes('Addons')) {
				// AUTO-MOD
				require('../../features/AUTO-MOD/AntiMassMentions').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiMassEmojis').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiMassSpoilers').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiMassLines').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiEveryone').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiSpam').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiNSFW').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiCaps').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiExternalLinks').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiInvites').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiBadWords').run(bot, message, settings);
				require('../../features/AUTO-MOD/AntiZAlgo').run(bot, message, settings);
				// This makes sure that if the auto-mod punished member, level plugin would not give XP
			} else if (settings.plugins.includes('Level')) {
				new HopeLevelSystem(bot, message).check();
			}
		}
	}
}

module.exports = MessageCreate;