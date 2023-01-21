// Dependências
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
	  * Giveaway delete command
	  * @extends {Command}
*/
module.exports = class GDelete extends Command {
	/**
			* @param {Client} client The instantiating client
			* @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'gdelete',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['sdeletar', 'deletarsorteio', 'g-delete'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Deleta um sorteio',
			usage: 'deletarsorteio <ID da mensagem>',
			cooldown: 3000,
			examples: ['deletarsorteio 818821436255895612'],
			slash: false,
			slashSite: true,
			options: [
				{
					name: 'id',
					description: 'Message ID of the giveaway.',
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
			],
		});
	}

	/**
	   * Function for recieving message.
	   * @param {bot} bot The instantiating client.
	   * @param {message} message The message that ran the command.
	   * @readonly
		*/
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Certifique-se de que o ID da mensagem do embed de sorteio seja informado pelo usuario
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Giveaway/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Giveaway/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// deleta o sorteio
		const messageID = message.args[0];
		try {
			await bot.giveawaysManager.delete(messageID);
			message.channel.send(bot.translate('Giveaway/gdelete:SUCCESS_GIVEAWAY'));
		} catch (err) {
			bot.logger.error(`Command: 'g-delete' has error: ${err}.`);
			message.channel.send(bot.translate('Giveaway/gdelete:UNKNOWN_GIVEAWAY', { message: messageID }));
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
			messageID = args.get('messageID').value;

		// Delete the giveaway
		try {
			await bot.giveawaysManager.delete(messageID);
			interaction.reply({ embeds: [channel.success('Giveaway/gdelete:SUCCESS_GIVEAWAY', {}, true)] });
		} catch (err) {
			bot.logger.error(`Command: 'g-delete' has error: ${err}.`);
			interaction.reply(guild.translate('Giveaway/gdelete:UNKNOWN_GIVEAWAY', { message: messageID }));
		}
	}
};
