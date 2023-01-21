// Dependências
const { Embed } = require(`../../utils`),
	{ ApplicationCommandOptionType } = require('discord.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ timeEventSchema } = require('../../database/models'),
	{ time: { getTotalTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Ban extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ban',
			aliases: ['banir'],
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.BanMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.BanMembers],
			description: 'Ban a user.',
			usage: '<prefix><commandName> <user> [reason] [time]',
			examples: [
				'.ban @Klaus',
				'!ban @Hope teste',
				'?ban @Faith praticando spam no chat 3d',
				'>banir @Klaus testando 1d 10h 25m',
				'$banir Hope test 30s'
			],
			cooldown: 5000,
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to ban.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason for the ban.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
				{
					name: 'time',
					description: 'The time till they are unbanned.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// obtem um usuario e motivo
		const reason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('Moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		// Certifique-se de que o usuário não está tentando se punir
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISHMENT').then(m => m.timedDelete({ timeout: 10000 }));

		// Certifique-se de que o usuário não tem permissões de ADMINISTRADOR ou tem um cargo maior
		if (members[0].permissions.has(Flags.Administrator) || members[0].roles.highest.comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
			return message.channel.error('misc:TOO_POWERFUL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Bane o usuário com um motivo e verifica o tempo do ban
		// enviar DM para o usuário
		const embed = new Embed(bot, message.guild)
			.setTitle('Moderation/ban:BAN')
			.setColor(16711709)
			.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true }))
			.setDescription(message.translate('Moderation/ban:BAN1', { guild: message.guild.name }))
			.addFields({ name: message.translate('Moderation/ban:BAN2'), value: message.author.tag, inline: true },
				{ name: message.translate('Moderation/ban:BAN3'), value: reason, inline: true })
		await members[0].send({ embeds: [embed] });

		// ban o usuario do sv
		await members[0].ban({ reason: reason });
		message.channel.success('misc:SUCCESSFULL_BAN', { user: members[0].user.id }).then(m => m.timedDelete({ timeout: 8000 }));

		// Verifique se este ban é temporário
		const possibleTime = message.args[message.args.length - 1];
		if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
			const { error, success: time } = getTotalTime(possibleTime);
			if (error) return message.channel.error(error);

			// se conecta ao banco de dados
			const newEvent = new timeEventSchema({
				userID: members[0].user.id,
				guildID: message.guild.id,
				time: new Date(new Date().getTime() + time),
				channelID: message.channel.id,
				type: 'ban',
			});
			await newEvent.save();

			// desbani o usuario
			setTimeout(async () => {
				message.args[0] = members[0].user.id;
				await bot.commands.get('unban').run(bot, message, settings);

				// deleta do banco de dados
				await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
					if (err) console.log(err);
				});
			}, time);
		}
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
		const member = guild.members.cache.get(args.get('user').value),
			channel = guild.channels.cache.get(interaction.channelId),
			reason = args.get('reason')?.value;

		// Make sure user isn't trying to punish themselves
		if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISHMENT', {}, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 5000 }));

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (member.permissions.has(Flags.Administrator) || member.roles.highest.comparePositionTo(guild.members.me.roles.highest) >= 0) {
			return interaction.reply({ embeds: [channel.error('misc:TOO_POWERFUL', {}, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Ban user with reason and check if timed ban
		try {
			// send DM to user
			try {
				const embed = new Embed(bot, guild)
					.setTitle('Moderation/ban:BAN')
					.setColor(16711709)
					.setThumbnail(guild.iconURL({ format: 'png', dynamic: true }))
					.setDescription(guild.translate('Moderation/ban:BAN1', { guild: guild.name }))
					.addField(guild.translate('Moderation/ban:BAN2'), interaction.user.tag, true)
					.addField(guild.translate('Moderation/ban:BAN3'), reason, true);
				await member.send({ embeds: [embed] });
				// eslint-disable-next-line no-empty
			} catch (e) { }

			// Ban user from guild
			await member.ban({ reason: reason });
			interaction.reply({ embeds: [channel.success('misc:SUCCESSFULL_BAN', { user: member.user }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 8000 }));

			// Check to see if this ban is a tempban
			const possibleTime = args.get('time')?.value;
			if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
				const { error, success: time } = getTotalTime(possibleTime);
				if (error) return interaction.reply({ embeds: [channel.error(error, null, true)] });

				// connect to database
				const newEvent = new timeEventSchema({
					userID: member.user.id,
					guildID: guild.id,
					time: new Date(new Date().getTime() + time),
					channelID: channel.id,
					type: 'ban',
				});
				await newEvent.save();

				// unban user
				setTimeout(async () => {
					await guild.members.unban(member.user);

					// Delete item from database as bot didn't crash
					await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
						if (err) console.log(err);
					});
				}, time);
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
};