// Dependências
const { time: { getTotalTime, getReadableTime } } = require('../../utils'),
{ ApplicationCommandOptionType } = require('discord.js'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class SlowMode extends Command {
	constructor(bot) {
		super(bot, {
			name: 'slowmode',
			dirname: __dirname,
			aliases: ['slow-mode'],
			guildOnly: true,
			userPermissions: [Flags.ManageChannels],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks,Flags.ManageChannels],
			description: 'Enables or disables slow mode on a channel.',
			usage: '<prefix><commandName> [<time> | disable]',
			examples: [
				'.slowmode 1m',
				'!slowmode disable'
			],
			cooldown: 5000,
			slash: false,
			options: [
				{
					name: 'input',
					description: 'How long for slowmode',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Deleta a mensagem, se tiver permissão
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// obtem o tempo
		let time;
		if (message.args[0] == 'desativar' || message.args[0] == 'disable') {
			time = 0;
		} else if (message.args[0]) {
			const { error, success } = getTotalTime(message.args[0]);
			if (error) return message.channel.error(error);
			time = success;
		} else {
			return message.channel.error('misc:NOT_NUMBER').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Ativa slowmode
		await message.channel.setRateLimitPerUser(time / 1000);
		message.channel.success('misc:SUCCESSFULL_SLOWMODE', { time: getReadableTime(time) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 })}});
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
		const input = args.get('input'),
			channel = guild.channels.cache.get(interaction.channelId);

		// get time
		let time;
		if (input == 'off') {
			time = 0;
		} else if (input) {
			const { error, success } = getTotalTime(args.get('input').value);
			if (error) return interaction.reply({ embeds: [channel.error(error, null, true)] });
			time = success;
		}

		// Activate slowmode
		try {
			await channel.setRateLimitPerUser(time / 1000);
			interaction.reply({ embeds: [channel.error('moderation/slowmode:SUCCESS', { TIME: time == 0 ? guild.translate('misc:OFF') : getReadableTime(time) }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
};
