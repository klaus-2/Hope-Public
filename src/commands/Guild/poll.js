// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Poll extends Command {
	constructor(bot) {
		super(bot, {
			name: 'poll',
			aliases: ['enquete'],
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
			description: 'Creates a poll for users to vote.',
			usage: '<prefix><commandName> <question>',
			examples: [
				'.poll An imaginary question',
				'!poll An imaginary question'
			],
			cooldown: 3000,
			slash: false,
			options: [
				{
					name: 'poll',
					description: 'What to poll.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Certifique-se de que um texto foi enviado como pergunta da enquete
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Guild/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Guild/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// envia a enquete ao canal
		const embed = new Embed(bot, message.guild)
			.setColor(1)
			.setTitle('Guild/poll:POLL_TITLE', { username: message.author.username })
			.setDescription(message.args.join(' '))
			.setFooter({ text: message.translate('Guild/poll:POLL_FOOTER') })
			.setTimestamp();
		message.channel.send({ embeds: [embed] }).then(async (msg) => {
			// Add reactions to message
			await msg.react('<:v_:855859391835799582>');
			await msg.react('<:cancel:855859391709577266>');
		});
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
		const text = args.get('poll').value;

		// Send poll to channel
		const embed = new Embed(bot, guild)
			.setColor(1)
			.setTitle('Guild/poll:POLL_TITLE', { username: interaction.user.username })
			.setDescription(text)
			.setFooter({ text: message.translate('Guild/poll:POLL_FOOTER') })
			.setTimestamp();
		interaction.reply({ embeds: [embed], fetchReply: true }).then(async (msg) => {
			// Add reactions to message
			await msg.react('<:v_:855859391835799582>');
			await msg.react('<:cancel:855859391709577266>');
		});
	}
};
