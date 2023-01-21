// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ fetch } = require('undici'),
	utility = require('../../utils/timeFormatter.js'),
	Command = require('../../structures/Command.js');

module.exports = class MemeBR extends Command {
	constructor(bot) {
		super(bot, {
			name: 'memebr',
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Obtém um meme aleatorio.',
			usage: '<prefix><commandName>',
			examples: [
				'.meme'
			],
			cooldown: 5000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
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

		const subredditsbr = [
			'MemesBrasil',
			'MemesBR'
		];

		var randSubredditbr = subredditsbr[Math.floor(Math.random() * subredditsbr.length)];

		await fetch(`https://www.reddit.com/r/${randSubredditbr}.json`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(data => {
			let info = []
			const res = data.data?.children.filter(m => m.data.post_hint === 'image')
			if (!data.error === 403 || data.reason === 'private' || !res) return message.channel.error(`Ocorreu uma falha ao se conectar em r/${randSubredditbr}. Por favor, tente novamente!`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
			res.forEach(post => {
				info.push({ title: post.data.title, up: post.data.ups, downs: post.data.downs, link: `https://www.reddit.com${post.data.permalink}`, image: post.data.url, upvote_ratio: post.data.upvote_ratio, created: post.data.created })
			})

			const reddit = info[Math.floor(Math.random() * info.length)];
			const probability = reddit.upvote_ratio;
			const percentage = Math.round((probability * 100));
			const calc = reddit.up - (reddit.up * (percentage / 100));
			const newPercentage = 100 - percentage;

			if (!reddit) return message.channel.error(settings.Language, 'ERROR_MESSAGE', `Falha em r/${randSubredditbr}`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

			const meme = new Embed(bot, message.guild)
				.setFooter({ text: `👍 ${utility.commatize(reddit.up)} (${utility.commatize(percentage)}% of upvotes) | 👎 ${utility.commatize(Math.round(calc.toFixed(2)))} (${utility.commatize(newPercentage)}% of downvotes)\n${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/meme:USAGEE`)}` })
				.setColor(1)
				.setTitle(reddit.title)
				.setURL(reddit.link)
				.setImage(reddit.image)
				.setTimestamp()

			return new Promise(async (resolve, reject) => {
				msg.delete();
				await message.channel.send({ embeds: [meme] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
			})
		})
	}
}