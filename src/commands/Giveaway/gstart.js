// Dependências
const { time: { getTotalTime } } = require('../../utils'),
	{ PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

module.exports = class GStart extends Command {
	constructor(bot) {
		super(bot, {
			name: 'gstart',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['criarsorteio', 'siniciar', 'g-start'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
			description: 'Comece um sorteio',
			usage: 'criarsorteio <tempo> <número de vencedores> <premio>',
			cooldown: 60000,
			examples: ['criarsorteio', 'criarsorteio 2h30m 3 nitro classic'],
			slash: false,
			slashSite: true,
			options: [
				{
					name: 'time',
					description: 'Extra time added to the giveaway.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: 'winners',
					description: 'New winner count.',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 10,
					required: true,
				},
				{
					name: 'prize',
					description: 'New prize',
					type: ApplicationCommandOptionType.String,
					maxLength: 256,
					required: true,
				},
				{
					name: 'channel',
					description: 'Channel to post the giveaway in.',
					type: ApplicationCommandOptionType.Channel,
					channelTypes: [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNews],
					required: false,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		//impedir que usem @here / everyone no sorteio ou mencione um usuario como premio... usarei isto por enquanto, farei algo melhor dps
		//const role = message.getRole();
		/*let user = message.guild.members.member(message.mentions.users.first() || message.guild.members.cache.get(message.args[0])) || message.author;
		if (message.args[2] == '@here' || message.args[2] == '@everyone' || message.args[2] == `<@!${user.id}>` || message.args[2] == role) return message.channel.send(message.translate('Giveaway/gstart:CRIAR_SORTEIO2')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});
*/
		//if (message.args[2].startsWith('<@&') && message.args[2].endsWith('>')) return message.channel.send(message.translate('Giveaway/gstart:CRIAR_SORTEIO2')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});

		if (message.content.includes('@')) {
			let cleanedContent = message.content.replace('@', ''); // if you want to replace the @
			return message.channel.send(message.translate('Giveaway/gstart:CRIAR_SORTEIO2')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } }); // if you want to deny completely

		};

		// Certifique-se de que um tempo, contagem de vencedores e prêmio sejam informados pelo usuario
		if (message.args.length <= 2) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Giveaway/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Giveaway/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// obtem o tempo
		const { error, success: time } = getTotalTime(message.args[0]);
		if (error) return message.channel.error(error);

		// Certifique-se de que o número de vencedores é um número
		if (isNaN(message.args[1]) || message.args[1] > 10) return message.channel.error('misc:INCORRECT_WINNER_COUNT').then(m => m.timedDelete({ timeout: 5000 }));

		// Certifique-se de que o prêmio é inferior a 256 caracteres
		if (message.args.slice(2).join(' ').length >= 256) return message.channel.send(message.translate('Giveaway/gstart:CRIAR_SORTEIO3')).then(m => m.timedDelete({ timeout: 5000 }));

		// Inicia o sorteio
		try {
			await bot.giveawaysManager.start(message.channel, {
				duration: time,
				prize: message.args.slice(2).join(' '),
				winnerCount: parseInt(message.args[1]),
				hostedBy: message.member,
				messages: {
					giveaway: message.translate('Giveaway/gstart:giveaway'),
					giveawayEnded: message.translate('Giveaway/gstart:giveawayEnded'),
					timeRemaining: message.translate('Giveaway/gstart:timeRemaining'),
					inviteToParticipate: message.translate('Giveaway/gstart:inviteToParticipate'),
					winMessage: message.translate('Giveaway/gstart:winMessage'),
					embedFooter: message.translate('Giveaway/gstart:FOOTER'),
					noWinner: message.translate('Giveaway/gstart:noWinner'),
					winners: message.translate('Giveaway/gstart:winners'),
					endedAt: message.translate('Giveaway/gstart:endedAt'),
					hostedBy: message.translate('Giveaway/gstart:hostedBy'),
					drawing: 'Drawing: {timestamp}',
					units: {
						seconds: message.translate('time:SECONDS', { amount: '' }).trim(),
						minutes: message.translate('time:MINUTES', { amount: '' }).trim(),
						hours: message.translate('time:HOURS', { amount: '' }).trim(),
						days: message.translate('time:DAYS', { amount: '' }).trim(),
					},
				},
			});
			bot.logger.log(`${message.author.tag} começou um sorteio no servidor: [${message.guild.id}].`);
		} catch (err) {
			bot.logger.error(`Command: 'g-start' has error: ${err}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err }).then(m => m.timedDelete({ timeout: 5000 }));
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(args.get('channel')?.value ?? interaction.channelId),
			winners = args.get('winners').value,
			prize = args.get('prize').value;

		// Get time
		const { error, success: time } = getTotalTime(args.get('time').value);
		if (error) return interaction.reply({ embeds: [channel.error(error, null, true)] });

		// Make sure prize is less than 256 characters
		if (prize.length >= 256) return interaction.reply({ embeds: [channel.error('Giveaway/gstart:CRIAR_SORTEIO3', {}, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 5000 }));

		// Start the giveaway
		try {
			await interaction.deferReply();
			await interaction.editReply(guild.translate('Giveaway/gstart:giveaway'));
			// await interaction.deleteReply();
			await bot.giveawaysManager.start(channel, {
				duration: time,
				prize: prize,
				winnerCount: winners,
				hostedBy: member,
				messages: {
					giveaway: ' ',
					giveawayEnded: guild.translate('Giveaway/gstart:giveawayEnded'),
					timeRemaining: guild.translate('Giveaway/gstart:timeRemaining'),
					inviteToParticipate: guild.translate('Giveaway/gstart:inviteToParticipate'),
					winMessage: guild.translate('Giveaway/gstart:winMessage'),
					embedFooter: guild.translate('Giveaway/gstart:FOOTER'),
					noWinner: guild.translate('Giveaway/gstart:noWinner'),
					winners: guild.translate('Giveaway/gstart:winners'),
					endedAt: guild.translate('Giveaway/gstart:endedAt'),
					hostedBy: guild.translate('Giveaway/gstart:hostedBy'),
					drawing: 'Drawing: {timestamp}',
					units: {
						seconds: guild.translate('time:SECONDS', { amount: '' }).trim(),
						minutes: guild.translate('time:MINUTES', { amount: '' }).trim(),
						hours: guild.translate('time:HOURS', { amount: '' }).trim(),
						days: guild.translate('time:DAYS', { amount: '' }).trim(),
					},
				},
			});
			bot.logger.log(`${member.user.tag} started a giveaway in server: [${guild.id}].`);
		} catch (err) {
			bot.logger.error(`Command: 'g-start' has error: ${err}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true });
		}
	}

};