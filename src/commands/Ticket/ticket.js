// Dependências
const { Embed } = require(`../../utils`),
	{ ticketReação, ticketEmbedSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Ticket extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ticket',
			dirname: __dirname,
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Interact with the ticket commands',
			usage: '<prefix><commandName> [reaction]',
			examples: [
				'/ticket',
				'/ticket reaction',
				'.ticket',
				'!ticket reaction'
			],
			cooldown: 3000,
			slash: true,
			options: [
				{
					name: 'reaction',
					description: 'Create reaction embed',
					type: ApplicationCommandOptionType.Subcommand,
				},
				...bot.commands.filter(c => c.help.category == 'Ticket' && c.help.name !== 'ticket').map(c => ({
					name: c.help.name.replace('t', ''),
					description: c.help.description,
					type: ApplicationCommandOptionType.Subcommand,
					options: c.conf.options,
				})),
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Add ticket reaction embed
		if (message.args[0] == message.translate('Ticket/ticket:TICKET_REAÇÃO')) {
			// Verifica e se conecta ao banco de dados
			let tickett = await ticketReação.findOne({ guildID: message.guild.id });
			if (!tickett) {
				const newSettings = new ticketReação({
					guildID: message.guild.id,
					messageID: null,
					channelID: null,
				});
				await newSettings.save().catch(() => { });
				tickett = await ticketReação.findOne({ guildID: message.guild.id });
			}

			let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: message.guild.id });
			if (!dbEmbed) {
				const newSettings = new ticketEmbedSchema({
					tembed_sID: message.guild.id
				});
				await newSettings.save().catch(() => { });
				dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: message.guild.id });
			}

			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('ticket')
						.setLabel(dbEmbed.ticketembed.BotãoTexto || message.translate('Ticket/ticket:TICKET_REAÇÃO4'))
						.setStyle(ButtonStyle.Primary)
						.setEmoji(dbEmbed.ticketembed.Emoji || '<:ticket:862751559962984498>'),
				);

			const e = new Embed(bot, message.guild)
				.setAuthor({ name: dbEmbed.ticketembed.Titulo || message.translate('Ticket/ticket:TICKET_REAÇÃO1'), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
				.setColor(dbEmbed.ticketembed.Cor || 9442302)
				.setThumbnail(dbEmbed.ticketembed.Thumbnail || 'https://i.imgur.com/dLFpf52.png')
				.setDescription(dbEmbed.ticketembed.Descrição || message.translate('Ticket/ticket:TICKET_REAÇÃO2', { prefix: settings.prefix }))
				.setFooter({ text: dbEmbed.ticketembed.Footer || 'Powered by hopebot.top' });

			message.channel.send({ embeds: [e], components: [row] }).then(async (msg) => {
				await ticketReação.findOneAndUpdate({
					guildID: msg.guild.id,
					messageID: msg.id,
					channelID: msg.channel.id,
				});

				/*await msg.react(dbEmbed.ticketembed.EmojiID || "🎟");
				// set up filter and page number
				const teste = (reaction, user) => {
					return reaction.emoji.name == dbEmbed.ticketembed.Emoji || '🎟' && !user.bot;
				};
				const ação = msg.createReactionCollector({ filter: teste, time: 604800000 });
				ação.on('collect', async (reaction, user) => {
					reaction.users.remove(user.id);
				});*/
			});
		} else {
			const embed = new Embed(bot, message.guild)
				.setTitle('Ticket/ticket:TICKET_REAÇÃO1')
				.setColor(9442302)
				.setThumbnail('https://i.imgur.com/dLFpf52.png')
				.setDescription(message.translate('Ticket/ticket:TICKET_REAÇÃO3', { prefix: settings.prefix }));

			message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
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
		const option = interaction.options.getSubcommand();

		// Get the user's option and run it
		if (option === 'reaction') {
			// Verifica e se conecta ao banco de dados
			let tickett = await ticketReação.findOne({ guildID: guild.id });
			if (!tickett) {
				const newSettings = new ticketReação({
					guildID: guild.id,
					messageID: null,
					channelID: null,
				});
				await newSettings.save().catch(() => { });
				tickett = await ticketReação.findOne({ guildID: guild.id });
			}

			let dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
			if (!dbEmbed) {
				const newSettings = new ticketEmbedSchema({
					tembed_sID: guild.id
				});
				await newSettings.save().catch(() => { });
				dbEmbed = await ticketEmbedSchema.findOne({ tembed_sID: guild.id });
			}

			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('ticket')
						.setLabel(dbEmbed.ticketembed.BotãoTexto || guild.translate('Ticket/ticket:TICKET_REAÇÃO4'))
						.setStyle(ButtonStyle.Primary)
						.setEmoji(dbEmbed.ticketembed.Emoji || '<:ticket:862751559962984498>'),
				);

			const e = new Embed(bot, guild)
				.setAuthor({ name: dbEmbed.ticketembed.Titulo || guild.translate('Ticket/ticket:TICKET_REAÇÃO1'), iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
				.setColor(dbEmbed.ticketembed.Cor || 9442302)
				.setThumbnail(dbEmbed.ticketembed.Thumbnail || 'https://i.imgur.com/dLFpf52.png')
				.setDescription(dbEmbed.ticketembed.Descrição || guild.translate('Ticket/ticket:TICKET_REAÇÃO2', { prefix: '/' }))
				.setFooter({ text: dbEmbed.ticketembed.Footer || 'Powered by hopebot.top' });

			interaction.reply({ embeds: [e], components: [row] }).then(async (msg) => {

				const message = await interaction.fetchReply();

				await ticketReação.findOneAndUpdate({
					guildID: message.guild.id,
					messageID: message.id,
					channelID: message.channel.id,
				});

				/*await msg.react(dbEmbed.ticketembed.EmojiID || "🎟");
				// set up filter and page number
				const teste = (reaction, user) => {
					return reaction.emoji.name == dbEmbed.ticketembed.Emoji || '🎟' && !user.bot;
				};
				const ação = msg.createReactionCollector({ filter: teste, time: 604800000 });
				ação.on('collect', async (reaction, user) => {
					reaction.users.remove(user.id);
				});*/
			});
		} else {
			const command = bot.commands.get(`t${option}`);
			if (command) {
				command.callback(bot, interaction, guild, args);
			} else {
				interaction.reply({ content: 'Error' });
			}
		}
	}
};