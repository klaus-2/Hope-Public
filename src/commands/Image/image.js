// Dependências
const { image_search } = require('duckduckgo-images-api'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ Embed } = require(`../../utils`),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Image extends Command {
	constructor(bot) {
		super(bot, {
			name: 'image',
			dirname: __dirname,
			aliases: ['img', 'imagem'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Find an image based on the chosen theme.',
			usage: '<prefix><commandName> <query>',
			examples: [
				'.image food',
				'!imagem sun',
				'?img moon'
			],
			nsfw: true,
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'topic',
				description: 'Topic for image search',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// Certificando de que um tema foi incluído
		if (!message.args[0]) {
			return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Image/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Image/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}
		const phrase = () => {
			const p = [
				message.translate('misc:BUSCAR_DADOS'),
				message.translate('misc:BUSCAR_DADOS1'),
				message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
			];
			return p[Math.floor(Math.random() * p.length)];
		};

		const msg = await message.channel.send(phrase());
		const results = await image_search({ query: message.args.join(' '), moderate: (message.channel.nsfw || message.channel.type == 'DM') ? false : true, iterations: 2, retries: 2 });

		msg.delete();
		const embed = new Embed(bot, message.guild)
			.setImage(results[Math.floor(Math.random() * results.length)].image)
			.setColor(16711902)
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Image/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const topic = args.get('topic').value;
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({
			content: guild.translate('misc:GENERATING_IMAGE', {
				EMOJI: bot.customEmojis['loading']
			})
		});

		try {
			const results = await image_search({ query: topic, moderate: (channel.nsfw || channel.type == 1) ? false : true, iterations: 2, retries: 2 });
			const embed = new Embed(bot, guild)
				.setImage(results[Math.floor(Math.random() * results.length)].image);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};
