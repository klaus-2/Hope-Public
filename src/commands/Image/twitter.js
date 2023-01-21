// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Twitter extends Command {
	constructor(bot) {
		super(bot, {
			name: 'twitter',
			dirname: __dirname,
			aliases: ['tweet'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Create a fake tweet on Twitter.',
			usage: '<prefix><commandName> [user] <text>',
			examples: [
				'.twitter @Klaus Hello',
				'!tweet @Hope Hello',
				'?twitter Hello'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'user',
				description: 'User who made tweet',
				type: ApplicationCommandOptionType.User,
				required: true,
			}, {
				name: 'text',
				description: 'tweet content',
				type: ApplicationCommandOptionType.String,
				maxLength: 61,
				required: true,
			}],
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// obtem um usuario
		const members = await message.getMember();
		if (message.args.join(' ').replace(/<@.?\d*?>/g, '').length == message.args.length) message.args.shift();

		// obtem um texto
		const text = message.args.join(' ').replace(/<@.?\d*?>/g, '');

		// certifica de q exista um texto
		if (message.args.length == 0) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Image/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Image/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		// define o limite do tamanho do texto
		if (text.length >= 61) return message.channel.error('misc:TEXT_OVERLOAD', { number: 60 }).then(m => m.timedDelete({ timeout: 5000 }));

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
		const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${members[0].user.username}&text=${text}`)).then(res => res.json());

		// envia a img
		const embed = new Embed(bot, message.guild)
			.setImage(json.message)
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Image/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
			.setColor(16711902)
		message.channel.send({ embeds: [embed] });
		msg.delete();
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user').value);
		const text = args.get('text').value;
		const channel = guild.channels.cache.get(interaction.channelId);

		// make sure the text isn't longer than 80 characters
		if (text.length >= 61) return interaction.reply({ embeds: [channel.error('image/twitter:TOO_LONG', {}, true)], ephemeral: true });

		await interaction.reply({
			content: guild.translate('misc:GENERATING_IMAGE', {
				EMOJI: bot.customEmojis['loading']
			})
		});
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${member.user.username}&text=${text}`)).then(res => res.json());
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
