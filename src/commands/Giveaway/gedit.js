// Dependências
const { time: { getTotalTime } } = require('../../utils'),
{ ApplicationCommandOptionType } = require('discord.js'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class GEdit extends Command {
	constructor(bot) {
		super(bot, {
			name: 'gedit',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-edit', 'editarsorteio', 'g-edit'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Edita um sorteio ativo.',
			usage: 'editarsorteio <ID da mensagem> <tempo adicional> <nova quantidade de ganhadores> <novo premio>',
			cooldown: 3000,
			slash: false,
			slashSite: true,
			options: [
				{
					name: 'id',
					description: 'Message ID of the giveaway.',
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
				{
					name: 'time',
					description: 'Extra time added to the giveaway.',
					type: ApplicationCommandOptionType.Integer,
					required: false,
				},
				{
					name: 'winners',
					description: 'New winner count.',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 10,
					required: false,
				},
				{
					name: 'prize',
					description: 'New prize',
					type: ApplicationCommandOptionType.String,
					maxLength: 256,
					required: false,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Certifique-se de que o ID da mensagem do embed de sorteio seja mencionado
		if (message.args.length <= 3) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Giveaway/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Giveaway/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// Obtem o novo tempo
		const { error, success: time } = getTotalTime(message.args[1]);
		if (error) return message.channel.error(error);

		// Obtem a nova quantidade de ganhadores
		if (isNaN(message.args[2])) return message.channel.error('Giveaway/gedit:INCORRECT_WINNER_COUNT').then(m => m.timedDelete({ timeout: 5000 }));

		// Atualiza o sorteio
		try {
			await bot.giveawaysManager.edit(message.args[0], {
				newWinnerCount: parseInt(message.args[2]),
				newPrize: message.args.slice(3).join(' '),
				addTime: time,
			});
			message.channel.send(message.translate('Giveaway/gedit:EDIT_GIVEAWAY', { time: bot.giveawaysManager.options.updateCountdownEvery / 1000 }));
		} catch (err) {
			bot.logger.error(`Command: 'g-edit' has error: ${err}.`);
			message.channel.send(bot.translate('Giveaway/deletarsorteio:UNKNOWN_GIVEAWAY', { message: message.args[0] }));
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
		const channel = guild.channels.cache.get(interaction.channelId),
			id = args.get('id').value,
			winners = args.get('winners')?.value,
			prize = args.get('prize')?.value;

		// Make sure a time, winner or prize was inputted or no point editing the file.
		if (!time && !winners && !prize) return interaction.reply({ embeds: [channel.error('giveaway/g-edit:NOTHING_TO_EDIT')], fetchReply: true }).then(m => m.timedDelete({ timeout: 5000 }));

		const { error, success: time } = getTotalTime(args.get('time').value ?? 0);
		if (error) return interaction.reply({ embeds: [channel.error(error, null, true)] });

		// Update giveaway
		try {
			await bot.giveawaysManager.edit(id, {
				newWinnerCount: winners ?? bot.giveawaysManager.giveaways.find(g => g.messageID == id).winnerCount,
				newPrize: prize ?? bot.giveawaysManager.giveaways.find(g => g.messageID == id).prize,
				addTime: time,
			});
			interaction.reply({ embeds: [channel.success('Giveaway/gedit:EDIT_GIVEAWAY', { time: bot.giveawaysManager.options.updateCountdownEvery / 1000 }, true)] });
		} catch (err) {
			bot.logger.error(`Command: 'g-edit' has error: ${err}.`);
			interaction.reply(guild.translate('Giveaway/deletarsorteio:UNKNOWN_GIVEAWAY', { message: id }));
		}
	}
};
