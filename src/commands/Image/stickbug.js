const { AttachmentBuilder } = require('discord.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Stickbug extends Command {
	constructor(bot) {
		super(bot, {
			name: 'stickbug',
			dirname: __dirname,
			aliases: ['stick-bug'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AttachFiles],
			description: 'Create a stickbug meme.',
			usage: '<prefix><commandName> [user | attachment]',
			examples: [
				'.stickbug',
				'!stickbug @Klaus',
				'?stick-bug [attachmenet]'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'user',
				description: 'User\'s avatar to stickbug.',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// obtem uma image, por default usara a foto de perfil do author
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

		// personaliza a img
		const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=stickbug&url=${files[0]}`)).then(res => res.json());

		// envia a img
		msg.delete();
		const attachment = new AttachmentBuilder(json.message, { name: 'Hope-stickbug.mp4' });
		message.channel.send({ files: [attachment] });
	};

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({
			content: guild.translate('misc:GENERATING_IMAGE', {
				EMOJI: bot.customEmojis['loading']
			})
		});
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=stickbug&url=${member.user.displayAvatarURL({ format: 'png', size: 1024 })}`)).then(res => res.json());
			const attachment = new AttachmentBuilder(json.message, 'stickbug.mp4');

			interaction.editReply({ content: ' ', files: [attachment] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};