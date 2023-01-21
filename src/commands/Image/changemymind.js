// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class ChangeMyMind extends Command {
	constructor(bot) {
		super(bot, {
			name: 'changemymind',
			dirname: __dirname,
			aliases: ['cmm'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Creates a Changemymind image.',
			usage: '<prefix><commandName> <text>',
			examples: [
				'.changemymind Hope is the best bot in the world <3'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'text',
				description: 'Phrase to use',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// obtem o texto
		const text = message.args.join(' ');

		// certifica que há um texto
		if (!text) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Image/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Image/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// certifica que o texto nao seja mt longo
		if (text.length >= 81) return message.channel.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 80).then(m => m.timedDelete({ timeout: 5000 }));

		// RANDOM LOADING MSG
		const phrase = () => {
			const p = [
				message.translate('misc:BUSCAR_DADOS'),
				message.translate('misc:BUSCAR_DADOS1'),
				message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
			];
			return p[Math.floor(Math.random() * p.length)];
		};

		const msg = await message.channel.send(phrase());

		// personaliza a img
		const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${text}`)).then(res => res.json());

		// envia a img
		const embed = new Embed(bot, message.guild)
			.setColor(16711902)
			.setImage(json.message)
			.setTimestamp()
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Image/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
		message.channel.send({ embeds: [embed] });
		msg.delete();
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const text = args.get('text').value,
			channel = guild.channels.cache.get(interaction.channelId);

		// make sure the text isn't longer than 80 characters
		if (text.length >= 81) return interaction.reply({ embeds: [channel.error('image/changemymind:TOO_LONG', {}, true)], ephemeral: true });

		await interaction.reply({
			content: guild.translate('misc:GENERATING_IMAGE', {
				EMOJI: bot.customEmojis['loading']
			})
		});
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${text}`)).then(res => res.json());
			const embed = new Embed(bot, guild)
				.setColor(3447003)
				.setImage(json.message);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};
