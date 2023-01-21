// Dependências
const { Embed } = require(`../../utils`),
	{ ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require('discord.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');
const { votesCheck } = require(`../../database/models`);

module.exports = class Clear extends Command {
	constructor(bot) {
		super(bot, {
			name: 'clear',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['cl', 'purge', 'apagar'],
			userPermissions: [Flags.ManageMessages],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageMessages],
			description: 'Deletes a certain amount of messages.',
			usage: '<prefix><commandName> <quantity> [user]',
			examples: [
				'.clear 10',
				'!clear 250',
				'?cl 75 @Klaus',
				'>purge 2'
			],
			cooldown: 7000,
			slash: false,
			options: [
				{
					name: 'number',
					description: 'The number of messages to delete.',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 1000,
					required: true,
				},
				{
					name: 'user',
					description: 'The delete messages only from this user.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
				{
					name: 'flag',
					description: 'Show how many messages were deleted.',
					type: ApplicationCommandOptionType.String,
					choices: ['-show'].map(i => ({ name: i, value: i })),
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Obtem o numero de mensagens para remover
		const amount = message.args[0];

		// verifica se algo foi enviado
		if (!amount) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// certifica que o que foi enviado seja um numero e define seu limite
		if (isNaN(amount) || (amount > 1000) || (amount < 1)) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Moderation/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		//Limita a exclusão de mais de 200 para servidores PREMIUM
		//Se conecta a Database pelo ID do usuario
		let dbVote = await votesCheck.findOne({ _id: message.author.id });
		if (!dbVote) {

			const newSettings1 = new votesCheck({
				_id: message.author.id,
				totalVotes: 0,
				topgg: 0,
				vdb: 0,
				dbl: 0,
				lastVote: 0,
			});
			await newSettings1.save();
			dbVote = await votesCheck.findOne({ _id: message.author.id });
		}

		let DBL_INTERVAL = 43200000;
		const checkVote = Date.now() - dbVote.lastVote < DBL_INTERVAL;

		if (checkVote == false && settings.isPremium === "false") {

			if (amount > 200) return message.channel.error('misc:NOT_PREMIUM', { prefix: settings.prefix })

		}

		// Confirma com o usuario se ele tem certeza de deletar mais de 100 mensagens
		if (amount >= 100) {
			const embed = new Embed(bot, message.guild)
				.setTitle('Moderation/clear:TITLE')
				.setDescription(message.translate('Moderation/clear:DESC', { NUM: amount }));

			// create the buttons
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('success')
						.setLabel('Confirm')
						.setStyle(ButtonStyle.Success)
						.setEmoji(':v_:855859391835799582')
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('cancel')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Danger)
						.setEmoji(':cancel:855859391709577266'),
				);

			// Send confirmation message
			await message.channel.send({ embeds: [embed], components: [row] }).then(async msg => {
				// create collector
				const filter = (i) => ['cancel', 'success'].includes(i.customId) && i.user.id === message.author.id;
				const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

				// A button was clicked
				collector.on('collect', async i => {
					// User pressed cancel button
					if (i.customId === 'cancel') {
						embed.setDescription(message.translate('moderation/clear:CON_CNC'));
						msg.edit({ embeds: [embed], components: [] });
					} else {
						// Delete the messages
						await i.reply(message.translate('Moderation/clear:DEL_MSG', { TIME: Math.ceil(amount / 100) * 5, NUM: amount }));
						await bot.delay(5000);

						let x = 0, y = 0;
						const z = amount;
						while (x !== Math.ceil(amount / 100)) {
							try {
								let messages = await message.channel.messages.fetch({ limit: z > 100 ? 100 : z });
								// Apaga mensagens de um usuario se mencionado
								if (message.args[1]) {
									const member = await message.getMember();
									messages = messages.filter((m) => m.author.id == member[0].user.id);
								}

								// apaga mensagens geral
								const delMessages = await message.channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Comando: '${this.help.name}' ocorreu um error: ${err.message}.`));
								y += delMessages.size;
								x++;
								await bot.delay(5000);
							} catch (e) {
								x = Math.ceil(amount / 100);
							}
						}
						message.channel.success('Moderation/clear:SUCCESS', { NUM: y }).then(m => m.timedDelete({ timeout: 3000 }));
					}
				});

				// Se o usuario nao reajir a tempo
				collector.on('end', async () => {
					if (msg.deleted) return;
					if (embed.description == message.translate('Moderation/clear:CON_CNC')) {
						await msg.delete();
					} else {
						embed.setDescription(message.translate('Moderation/clear:CON_TO'));
						await msg.edit({ embeds: [embed], components: [] });
					}
				});
			});
		} else {
			// Deleta a mensagem, se tiver permissãos (menos de 100)
			await message.channel.messages.fetch({ limit: amount }).then(async messages => {
				// Se o usuario mencionado, deleta mensagens (menos de 100)
				if (message.args[1]) {
					const member = message.getMember();
					messages = messages.filter((m) => m.author.id == member[0].user.id);
				}

				// deleta mensagens em geral (menos de 100)
				await message.channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Comando: '${this.help.name}' ocorreu um error: ${err.message}.`));
				message.channel.success('Moderation/clear:SUCCESS', { NUM: messages.size }).then(m => m.timedDelete({ timeout: 3000 }));
			});
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
		const member = guild.members.cache.get(args.get('user')),
			channel = guild.channels.cache.get(interaction.channelId),
			amount = args.get('amount').value;

		// make sure guild is premium if amount > 200
		if (amount > 200 && !guild.premium) return interaction.reply({ embeds: [channel.error('misc:NOT_PREMIUM', { prefix: guild.settings.prefix }, true)] });

		// Confirmation for message deletion over 100
		if (amount >= 100) {
			const embed = new Embed(bot, guild)
				.setTitle('Moderation/clear:TITLE')
				.setDescription(guild.translate('Moderation/clear:DESC', { NUM: amount }));

			// create the buttons
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('success')
						.setLabel('Confirm')
						.setStyle(ButtonStyle.Success)
						.setEmoji(':v_:855859391835799582')
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('cancel')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Danger)
						.setEmoji(':cancel:855859391709577266'),
				);

			// Send confirmation message
			await interaction.reply({ embeds: [embed], components: [row], fetchReply: true }).then(async msg => {
				// create collector
				const filter = (i) => ['cancel', 'success'].includes(i.customId) && i.user.id === interaction.user.id;
				const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

				// A button was clicked
				collector.on('collect', async i => {
					// User pressed cancel button
					if (i.customId === 'cancel') {
						embed.setDescription(guild.translate('moderation/clear:CON_CNC'));
						return msg.edit({ embeds: [embed], components: [] });
					} else {
						// Delete the messages
						await i.reply(guild.translate('Moderation/clear:DEL_MSG', { TIME: Math.ceil(amount / 100) * 5, NUM: amount }));
						await bot.delay(5000);

						let x = 0, y = 0;
						const z = amount;
						while (x !== Math.ceil(amount / 100)) {
							try {
								let messages = await channel.messages.fetch({ limit: z > 100 ? 100 : z });
								// Delete user messages
								if (member) {
									messages = messages.filter((m) => m.author.id == member[0].user.id);
								}

								// delete the message
								const delMessages = await channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`));
								y += delMessages.size;
								x++;
								await bot.delay(5000);
							} catch (e) {
								x = Math.ceil(amount / 100);
							}
						}
						return interaction.reply({ embeds: [channel.success('Moderation/clear:SUCCESS', { NUM: y }, true)] });
					}
				});

				// user did not react in time
				collector.on('end', async () => {
					if (msg.deleted) return;
					if (embed.description == guild.translate('moderation/clear:CON_CNC')) {
						await msg.delete();
					} else {
						embed.setDescription(guild.translate('moderation/clear:CON_TO'));
						await msg.edit({ embeds: [embed], components: [] });
					}
				});
			});
		} else {
			// Delete messages (less than 100)
			await channel.messages.fetch({ limit: amount }).then(async messages => {
				// Delete user messages
				if (member) messages = messages.filter((m) => m.author.id == member[0].user.id);

				// delete the message
				await channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`));
				interaction.reply({ embeds: [channel.success('Moderation/clear:SUCCESS', { NUM: messages.size }, true)] });
			});
		}
	}
};
