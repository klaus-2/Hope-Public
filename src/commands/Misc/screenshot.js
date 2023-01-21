// Dependências
const { Embed } = require(`../../utils`),
	validUrl = require('valid-url'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	fetch = require("node-fetch"),
	{ AttachmentBuilder, ApplicationCommandOptionType } = require('discord.js'),
	{ MessageAttachment } = require("discord.js"),
	Command = require('../../structures/Command.js');


module.exports = class Screenshot extends Command {
	constructor(bot) {
		super(bot, {
			name: 'screenshot',
			dirname: __dirname,
			aliases: ['ss'],
			nsfw: true,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AttachFiles],
			description: 'Take a screenshot of a website.',
			usage: '<prefix><commandName> <url>',
			cooldown: 5000,
			examples: [
				'/screenshot',
				'.screenshot https://www.google.com/',
				'!ss https://twitch.tv/'
			],
			slash: true,
			options: [{
				name: 'url',
				description: 'Url of website to screenshot.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		let url = message.args[0];
		if (!url) return message.channel.error(message.translate('Fun/screenshot:SS1')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

		const embedwait = new Embed(bot, message.guild)
			.setDescription(message.translate('Fun/screenshot:FSS_DESC'))

		// envia a msg de espera
		const msg = await message.channel.send({ embeds: [embedwait] });

		// certifica que args seja uma URL valida
		if (!validUrl.isUri(url)) {
			if (message.deletable) message.delete();
			msg.delete();
			return message.channel.error('Fun/screenshot:INVALID_URL').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });
		}

		//const site = /^(https?:\/\/)/i.test(urls) ? urls : `http://${urls}`;

		const { body } = await fetch(`https://image.thum.io/get/width/1920/crop/675/noanimate/${url}`);

		let attachment
		attachment = new AttachmentBuilder(body, { name: 'Hope-ss.png' });

		const embed = new Embed(bot, message.guild)
			.setAuthor({ name: message.translate('Economia/pagar:PAGAR14', { user: message.author.username }), iconURL: bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
			.setDescription(message.translate('Fun/screenshot:SS', { urls: url }))
			.setImage("attachment://Hope-ss.png")
			.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
		msg.delete();
		return message.channel.send({ embeds: [embed], files: [attachment] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
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
		const channel = guild.channels.cache.get(interaction.channelId),
			url = args.get('url').value;

		// Get Interaction Message Data
		await interaction.deferReply();

		const embedwait = new Embed(bot, interaction.guild)
			.setDescription(interaction.guild.translate('Fun/screenshot:FSS_DESC'))

		// envia a msg de espera
		await interaction.editReply({ embeds: [embedwait] });

		// make sure URl is valid
		if (!validUrl.isUri(url)) return interaction.editReply({ content: ' ', embeds: [channel.error('Fun/screenshot:INVALID_URL', {}, true)], ephemeral: true });

		// Make sure website is not NSFW in a non-NSFW channel
		if (!bot.adultSiteList.includes(require('url').parse(url).host) && !channel.nsfw) return interaction.reply({ embeds: [channel.error('Fun/screenshot:BLACKLIST_WEBSITE', {}, true)], ephermal: true });

		const { body } = await fetch(`https://image.thum.io/get/width/1920/crop/675/noanimate/${url}`);

		if (!body) return interaction.editReply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'Failed to fetch screenshot' }, true)] });

		let attachment
		attachment = new AttachmentBuilder(body, { name: 'Hope-ss.png' });

		const embed = new Embed(bot, interaction.guild)
			.setAuthor({ name: interaction.guild.translate('Economia/pagar:PAGAR14', { user: interaction.user.username }), iconURL: bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
			.setDescription(interaction.guild.translate('Fun/screenshot:SS', { urls: url }))
			.setImage("attachment://Hope-ss.png")
			.setFooter({ text: `${interaction.guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${interaction.guild.translate('misc:FOOTER_GLOBAL', { prefix: interaction.guild.settings.prefix })}${interaction.guild.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
		// msg.delete();

		interaction.editReply({ embeds: [embed], files: [attachment] });
	}

	async reply(bot, interaction, channel, message) {
		const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
		if (!message.content.match(urlRegex)) return interaction.reply({ embeds: [channel.error('That is not a website', {}, true)], ephermal: true });
		const url = message.content.match(urlRegex)[0];

		// make sure URl is valid
		if (!validUrl.isUri(url)) return interaction.reply({ embeds: [channel.error('Fun/screenshot:INVALID_URL', {}, true)], ephermal: true });

		// Make sure website is not NSFW in a non-NSFW channel
		if (!bot.adultSiteList.includes(require('url').parse(url).host) && !channel.nsfw) return interaction.reply({ embeds: [channel.error('Fun/screenshot:BLACKLIST_WEBSITE', {}, true)], ephermal: true });

		// display phrases' definition
		await interaction.deferReply();

		const { body } = await fetch(`https://image.thum.io/get/width/1920/crop/675/noanimate/${url}`);

		const embedwait = new Embed(bot, interaction.guild)
			.setDescription(interaction.guild.translate('Fun/screenshot:FSS_DESC'))

		// envia a msg de espera
		const msg = await interaction.editReply({ embeds: [embedwait] });

		if (!body) {
			interaction.editReply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'Failed to fetch screenshot' }, true)] });
		} else {

			let attachment
			attachment = new AttachmentBuilder(body, { name: 'Hope-ss.png' });

			const embed = new Embed(bot, interaction.guild)
				.setAuthor({ name: interaction.guild.translate('Economia/pagar:PAGAR14', { user: interaction.user.username }), iconURL: bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
				.setDescription(interaction.guild.translate('Fun/screenshot:SS', { urls: url }))
				.setImage("attachment://Hope-ss.png")
				.setFooter({ text: `${interaction.guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${interaction.guild.translate('misc:FOOTER_GLOBAL', { prefix: interaction.guild.settings.prefix })}${interaction.guild.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
			// msg.delete();

			interaction.editReply({ embeds: [embed], files: [attachment] });
		}
	}
};