// Dependencies
const { Collection, PermissionsBitField } = require('discord.js'),
	{ Embed } = require(`../../utils`),
	fs = require('fs'),
	Event = require('../../structures/Event');

module.exports = class slashCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, interaction) {
		const guild = bot.guilds.cache.get(interaction.guildId),
			cmd = bot.commands.get(interaction.commandName),
			channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id);

		// Check to see if the command is being run in a blacklisted channel
		if ((guild.settings.CommandChannelToggle) && (guild.settings.CommandChannels.includes(channel.id))) {
			return interaction.reply({ embeds: [channel.error('misc:BLACKLISTED_CHANNEL', { user: member.user }, true)], ephermal: true });
		}

		// Make sure NSFW commands are only being run in a NSFW channel
		if (!channel.nsfw && cmd.conf.nsfw) {
			const isnsfw = fs.readFileSync(bot.guilds.cache.get(interaction.guildId).translate('misc:NSFW'), 'utf8');
			const nsfw = JSON.parse(isnsfw).frases;
			const randomNSFW = nsfw[Math.floor(Math.random() * nsfw.length)];
			const embed = new Embed(bot, interaction)
				.setColor(16741245)
				.setDescription(`${randomNSFW.texto}`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		// Check for bot permissions
		let neededPermissions = [];
		cmd.conf.botPermissions.forEach((perm) => {
			if ([PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Connect].includes(perm)) {
				if (!member.voice.channel) return;
				if (!member.voice.channel.permissionsFor(bot.user).has(perm)) {
					neededPermissions.push(perm);
				}
			} else if (!channel.permissionsFor(bot.user)?.has(perm)) {
				neededPermissions.push(perm);
			}
		});

		// Display missing bot permissions
		if (neededPermissions.length > 0) {
			const perms = new PermissionsBitField();
			neededPermissions.forEach((item) => perms.add(BigInt(item)));
			bot.logger.error(`Missing permission: \`${perms.toArray().join(', ')}\` in [${guild.id}].`);
			return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: perms.toArray().map((p) => bot.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
		}

		// Check for user permissions
		neededPermissions = [];
		cmd.conf.userPermissions.forEach((perm) => {
			if (!channel.permissionsFor(member).has(perm)) neededPermissions.push(perm);
		});

		// Display missing user permissions
		if (neededPermissions.length > 0) {
			const perms = new PermissionsBitField();
			neededPermissions.forEach((item) => perms.add(BigInt(item)));
			return interaction.reply({ embeds: [channel.error('misc:USER_PERMISSION', { PERMISSIONS: perms.toArray().map((p) => bot.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
		}

		// Check to see if user is in 'cooldown'
		if (!bot.cooldowns.has(cmd.help.name)) {
			bot.cooldowns.set(cmd.help.name, new Collection());
		}

		const now = Date.now(),
			timestamps = bot.cooldowns.get(cmd.help.name),
			cooldownAmount = (member.user.premium ? cmd.conf.cooldown * 0.75 : cmd.conf.cooldown);

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return interaction.reply({ embeds: [channel.error('misc:COMMAND_COOLDOWN', { seconds: timeLeft.toFixed(1) }, true)], ephemeral: true });
			}
		}

		// Run slash command
		if (bot.config.debug) bot.logger.debug(`Interaction: ${interaction.commandName} was ran by ${interaction.user.username}.`);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		await cmd.callback(bot, interaction, guild, interaction.options);
		timestamps.set(interaction.user.id, now);
		// this.commandsUsed++;
	}
};
