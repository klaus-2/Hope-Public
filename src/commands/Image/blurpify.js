// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Blurpify extends Command {
	constructor(bot) {
		super(bot, {
			name: 'blurpify',
			dirname: __dirname,
			aliases: ['blurp'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Blurpify an image.',
			usage: '<prefix><commandName> [user | attachment]',
			examples: [
				'.blurpify',
				'!blurpify @Klaus',
				'?blurp [anexo]'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'user',
				description: 'User\'s avatar to blurpify.',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// obtem uma imagem, por default, usará o avatar do usuario
		const files = await message.getImage();
		if (!Array.isArray(files)) return;
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

		// personaliza a imagem
		const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${files[0]}`)).then(res => res.json());
		// envia a imagem
		const embed = new Embed(bot, message.guild)
			.setColor(16711902)
			.setImage(json.message)
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
		message.channel.send({ embeds: [embed] });
		msg.delete();
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE') });
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${member.user.displayAvatarURL({ format: 'png', size: 1024 })}`)).then(res => res.json());
			const embed = new Embed(bot, guild)
				.setColor(3447003)
				.setImage(json.message);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true });
		}
	}
};
