// Dependências
const { AttachmentBuilder } = require('discord.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ Embed } = require(`../../utils`),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class QRcode extends Command {
	constructor(bot) {
		super(bot, {
			name: 'qrcode',
			dirname: __dirname,
			aliases: ['qr-code'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Create a QR code.',
			usage: '<prefix><commandName> <text | link | attachment>',
			examples: [
				'.qrcode https://www.google.com/',
				'!qrcode [attachment]',
				'?qrcode hello'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'text',
				description: 'URL',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// Obtem um texto para codificação em QR (incluindo o anexo)
		const text = (!message.args[0]) ? await message.getImage().then(r => r[0]) : message.args.join(' ');

		if (!message.args[0]) {
			return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Image/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Image/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}

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
		const attachment = new AttachmentBuilder(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(/ /g, '%20')}`, { name: 'HOPE-QRCODE.png' });
		// envia a img
		const embed = new Embed(bot, message.guild)
			.setThumbnail('attachment://HOPE-QRCODE.png')
			.setAuthor({ name: `${message.translate('Image/qrcode:QR1')} ${message.author.username}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
			.setDescription(`${message.translate('Image/qrcode:QR2')} \n\`\`\`yaml\n${message.args.join(' ')}\`\`\` ${message.translate('Image/qrcode:QR3')}`)
			.setColor(16711902)
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Image/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
		message.channel.send({ embeds: [embed], files: [attachment] });
		msg.delete();
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const text = args.get('text').value;
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({
			content: guild.translate('misc:GENERATING_IMAGE', {
				EMOJI: bot.customEmojis['loading']
			})
		});

		try {
			const attachment = new AttachmentBuilder(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(/ /g, '%20')}`, { name: 'QRCODE.png' });
			const embed = new Embed(bot, guild)
				.setImage('attachment://QRCODE.png');
			interaction.editReply({ content: ' ', embeds: [embed], files: [attachment] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};
