// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'),
	randoStrings = require("randostrings"),
	random = new randoStrings,
	talkedRecently = new Map(),
	{ shortUrl } = require('../../database/models/index'),
	rgx = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/,
	ipLoggers = [
		"viral.over-blog.com",
		"gyazo.in",
		"ps3cfw.com",
		"urlz.fr",
		"webpanel.space",
		"steamcommumity.com",
		"imgur.com.de",
		"fuglekos.com",
		"grabify.link",
		"leancoding.co",
		"stopify.co",
		"freegiftcards.co",
		"joinmy.site",
		"curiouscat.club",
		"catsnthings.fun",
		"catsnthings.com",
		"xn--yutube-iqc.com",
		"gyazo.nl",
		"yip.su",
		"iplogger.com",
		"iplogger.org",
		"iplogger.ru",
		"2no.co",
		"02ip.ru",
		"iplis.ru",
		"iplo.ru",
		"ezstat.ru",
		"whatstheirip.com",
		"hondachat.com",
		"bvog.com",
		"youramonkey.com",
		"pronosparadise.com",
		"freebooter.pro",
		"blasze.com",
		"blasze.tk",
		"ipgrab.org",
		"gyazos.com",
		"discord.kim",
		"https://viral.over-blog.com",
		"https://gyazo.in",
		"https://ps3cfw.com",
		"https://urlz.fr",
		"https://webpanel.space",
		"https://steamcommumity.com",
		"https://imgur.com.de",
		"https://fuglekos.com",
		"https://grabify.link",
		"https://leancoding.co",
		"https://stopify.co",
		"https://freegiftcards.co",
		"https://joinmy.site",
		"https://curiouscat.club",
		"https://catsnthings.fun",
		"https://catsnthings.com",
		"https://xn--yutube-iqc.com",
		"https://gyazo.nl",
		"https://yip.su",
		"https://iplogger.com",
		"https://iplogger.org",
		"https://iplogger.ru",
		"https://2no.co",
		"https://02ip.ru",
		"https://iplis.ru",
		"https://iplo.ru",
		"https://ezstat.ru",
		"https://whatstheirip.com",
		"https://hondachat.com",
		"https://bvog.com",
		"https://youramonkey.com",
		"https://pronosparadise.com",
		"https://freebooter.pro",
		"https://blasze.com",
		"https://blasze.tk",
		"https://ipgrab.org",
		"https://gyazos.com",
		"https://discord.kim",
		"http://viral.over-blog.com",
		"http://gyazo.in",
		"http://ps3cfw.com",
		"http://urlz.fr",
		"http://webpanel.space",
		"http://steamcommumity.com",
		"http://imgur.com.de",
		"http://fuglekos.com",
		"http://grabify.link",
		"http://leancoding.co",
		"http://stopify.co",
		"http://freegiftcards.co",
		"http://joinmy.site",
		"http://curiouscat.club",
		"http://catsnthings.fun",
		"http://catsnthings.com",
		"http://xn--yutube-iqc.com",
		"http://gyazo.nl",
		"http://yip.su",
		"http://iplogger.com",
		"http://iplogger.org",
		"http://iplogger.ru",
		"http://2no.co",
		"http://02ip.ru",
		"http://iplis.ru",
		"http://iplo.ru",
		"http://ezstat.ru",
		"http://whatstheirip.com",
		"http://hondachat.com",
		"http://bvog.com",
		"http://youramonkey.com",
		"http://pronosparadise.com",
		"http://freebooter.pro",
		"http://blasze.com",
		"http://blasze.tk",
		"http://ipgrab.org",
		"http://gyazos.com",
		"http://discord.kim"
	],
	Command = require('../../structures/Command.js');

module.exports = class Shorturl extends Command {
	constructor(bot) {
		super(bot, {
			name: 'shorturl',
			dirname: __dirname,
			aliases: ['surl', 'short-url', 'encurtarurl'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Shortens the URL that you submit.',
			usage: '<prefix><commandName> <url>',
			examples: [
				'.shorturl https://www.google.com',
				'!surl https://www.google.com',
				'?encurtarurl https://www.google.com'
			],
			slash: true,
			options: [{
				name: 'url',
				description: 'The Url you wish to shorten',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
			cooldown: 1000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		if (talkedRecently.has(message.author.id)) return message.channel.error(`Uh-oh! You are blocked from using this command and can only use it again <t:${(Math.floor(talkedRecently.get(message.author.id)))}:R>. Try again later!`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		let kaka = random.password({ length: 8, string: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" })

		let link = message.args[0];

		if (!link) return message.channel.error(`Uh-oh! You need to enter the link you want to shorten. Please check and try again!`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

		if (link.includes("porn") || ipLoggers.includes(link) || link.includes("sex") || link.includes("grabify") || link.includes("iplogger") || link.includes("2no") || link.includes("yip") || link.includes("iplis") || link.includes("02ip") || link.includes("ezstat") || link.includes("logger")) return message.channel.error(`${message.author} please do not use that link, you have been **blocked** from the following command for **2 hours.**`) + talkedRecently.set(message.author.id, Math.floor(new Date().getTime() / 1000.0) + 7200);
		setTimeout(() => {
			talkedRecently.delete(message.author.id);
		}, 3600000 * 2);


		if (!rgx.test(message.args[0])) return message.channel.error(`Uh-oh! Sorry, but the link you used is not a valid link, please check and try again!`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

		await shortUrl.create({ full: link, short: kaka, guildID: message.guild.id, memberID: message.author.id })
		return message.channel.success(`Your Link has been created!\n\n**Short Url:** [https://hopebot.top/url/${kaka}](https://hopebot.top/url/${kaka})\n**Full url:** ${message.args[0]}\n\n**Please note that by making urls you abide by our [policy](https://hopebot.top/url)**`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}
	// EXEC - SLASH
	async callback(bot, interaction, guild, args) {
		const member = interaction.user;
		const channel = guild.channels.cache.get(interaction.channelId);

		try {
			// Get Interaction Message Data
			await interaction.deferReply();

			if (talkedRecently.has(member.id)) return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! You are blocked from using this command and can only use it again <t:${(Math.floor(talkedRecently.get(member.id)))}:R>. Try again later!`, {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

			let kaka = random.password({ length: 8, string: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" })

			let link = args.get('url')?.value;

			if (link.includes("porn") || ipLoggers.includes(link) || link.includes("sex") || link.includes("grabify") || link.includes("iplogger") || link.includes("2no") || link.includes("yip") || link.includes("iplis") || link.includes("02ip") || link.includes("ezstat") || link.includes("logger")) return interaction.editReply({ content: ' ', embeds: [channel.error(`${member} please do not use that link, you have been **blocked** from the following command for **2 hours.**`, {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } }) + talkedRecently.set(member.id, Math.floor(new Date().getTime() / 1000.0) + 7200);
			setTimeout(() => {
				talkedRecently.delete(member.id);
			}, 3600000 * 2);

			if (!rgx.test(args.get('url')?.value)) return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! Sorry, but the link you used is not a valid link, please check and try again!`, {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

			await shortUrl.create({ full: link, short: kaka, guildID: guild.id, memberID: member.id })
			return interaction.editReply({ content: ' ', embeds: [channel.success(`Your Link has been created!\n\n**Short Url:** [https://hopebot.top/url/${kaka}](https://hopebot.top/url/${kaka})\n**Full url:** ${link}\n\n**Please note that by making urls you abide by our [policy](https://hopebot.top/url)**`, {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		} catch (error) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
		}
	}
};
