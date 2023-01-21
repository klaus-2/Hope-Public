// Dependências
const { ApplicationCommandOptionType } = require('discord.js'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class GReroll extends Command {
	constructor(bot) {
		super(bot, {
			name: 'greroll',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-reroll', 'srefazer', 'g-reroll', 'refazersorteio'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Refaz um sorteio.',
			usage: 'refazersorteio <ID da mensage> [vencedores]',
			examples: ['refazersorteio 818821436255895612 1'],
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
					name: 'winner',
					description: 'How many winners to reroll.',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 10,
					required: false,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Certifique-se de que o ID da mensagem do embed de sorteio seja mencionado
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Giveaway/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Giveaway/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// Refaz o sorteio
		const messageID = message.args[0];
		try {
			await bot.giveawaysManager.reroll(messageID, {
				winnerCount: !parseInt(message.args[1]) ? bot.giveawaysManager.giveaways.find(g => g.messageID == messageID)?.winnerCount : parseInt(message.args[1]),
				messages: {
					congrat: message.translate('Giveaway/greroll:CONGRAT'),
					error: message.translate('Giveaway/greroll:ERROR'),
				},
			});
			message.channel.send(bot.translate('Giveaway/greroll:SUCCESS_GIVEAWAY'));
		} catch (err) {
			bot.logger.error(`Command: 'g-reroll' has error: ${err}.`);
			message.channel.send(bot.translate('giveaway/g-reroll:UNKNOWN_GIVEAWAY', { ID: messageID }));
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
			messageID = args.get('messageID').value,
			winners = args.get('winner')?.value;

		// re-roll the giveaway
		try {
			await bot.giveawaysManager.reroll(messageID, {
				winnerCount: winners ?? bot.giveawaysManager.giveaways.find(g => g.messageID == messageID)?.winnerCount,
				messages: {
					congrat: guild.translate('Giveaway/greroll:CONGRAT'),
					error: guild.translate('Giveaway/greroll:ERROR'),
				},
			});
			interaction.reply({ embeds: [channel.success('Giveaway/greroll:SUCCESS_GIVEAWAY', {}, true)] });
		} catch (err) {
			bot.logger.error(`Command: 'g-reroll' has error: ${err}.`);
			interaction.reply(guild.translate('Giveaway/deletarsorteio:UNKNOWN_GIVEAWAY', { message: id }));
		}
	}
};
