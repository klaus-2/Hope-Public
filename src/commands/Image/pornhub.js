// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Pornhub extends Command {
	constructor(bot) {
		super(bot, {
			name: 'pornhub',
			dirname: __dirname,
			aliases: ['ph', 'phcomment'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Create a fake comment on PornHub.',
			usage: '<prefix><commandName> <user> <message>',
			examples: [
				'.pornhub @Klaus Umm.. nice!',
				'!ph @Klaus Umm.. nice!',
				'?phcomment Umm.. nice!'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'user',
				description: 'User who made comment',
				type: ApplicationCommandOptionType.User,
				required: true,
			}, {
				name: 'text',
				description: 'comment content',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// obtem um usuario
		const members = await message.getMember();
		// obtem um texto
		const text = message.args.join(' ').replace(/<@.?\d*?>/g, '');

		// certifica q um texto foi enviado
		if (!text) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Image/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Image/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });


		// certifica do tamanho do texto
		if (text.length >= 71) return message.channel.error('misc:TEXT_OVERLOAD', { number: 70 }).then(m => m.timedDelete({ timeout: 5000 }));

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
		const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${members[0].user.username}&image=${members[0].user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`)).then(res => res.json());

		// envia o resultado da personalização
		const embed = new Embed(bot, message.guild)
			.setImage(json.message)
			.setColor(16711902)
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Image/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
		message.channel.send({ embeds: [embed] });
		msg.delete();
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user').value);
		const text = args.get('text').value;
		const channel = guild.channels.cache.get(interaction.channelId);

		// make sure the text isn't longer than 80 characters
		if (text.length >= 71) return interaction.reply({ embeds: [channel.error('image/phcomment:TOO_LONG', {}, true)], ephemeral: true });

		await interaction.reply({
			content: guild.translate('misc:GENERATING_IMAGE', {
				EMOJI: bot.customEmojis['loading']
			})
		});
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${member.user.username}&image=${member.user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`)).then(res => res.json());
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
