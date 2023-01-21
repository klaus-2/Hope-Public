// Dependências
const { Embed } = require(`../../utils`),
	fetch = require('node-fetch'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class WhoWouldWin extends Command {
	constructor(bot) {
		super(bot, {
			name: 'whowouldwin',
			dirname: __dirname,
			aliases: ['www'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Create a whowouldwin image.',
			usage: '<prefix><commandName> <user 1 | attachment> [user 2 | attachment]',
			examples: [
				'.whowouldwin @Klaus',
				'!whowouldwin @Klaus @Hope',
				'?www @Klaus [attachment]'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'user',
				description: 'first user.',
				type: ApplicationCommandOptionType.User,
				required: true,
			}, {
				name: 'user2',
				description: 'second user',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// obtem um usuario
		const files = await message.getImage();
		if (!Array.isArray(files)) return;

		if (!files[1]) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Image/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Image/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });


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

		if (!message.args[0]) {
			return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Image/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Image/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}

		// personaliza a imagem
		const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=whowouldwin&user1=${files[0]}&user2=${files[1]}`)).then(res => res.json());

		// envia a img
		const embed = new Embed(bot, message.guild)
			.setImage(json.message)
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Image/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
			.setColor(16711902)
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		message.channel.send({ embeds: [embed] });
		msg.delete();
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user').value);
		const member2 = guild.members.cache.get(args.get('user2')?.value ?? interaction.user.id);

		const channel = guild.channels.cache.get(interaction.channelId);

		await interaction.reply({
			content: guild.translate('misc:GENERATING_IMAGE', {
				EMOJI: bot.customEmojis['loading']
			})
		});
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=whowouldwin&user1=${member.user.displayAvatarURL({ format: 'png', size: 512 })}&user2=${member2.user.displayAvatarURL({ format: 'png', size: 512 })}`)).then(res => res.json());
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
