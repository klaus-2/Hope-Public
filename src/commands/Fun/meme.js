// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ fetch } = require('undici'),
	utility = require('../../utils/timeFormatter.js'),
	Command = require('../../structures/Command.js');

module.exports = class Meme extends Command {
	constructor(bot) {
		super(bot, {
			name: 'meme',
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get a random meme.',
			usage: '<prefix><commandName>',
			examples: [
				'/meme',
				'.meme'
			],
			cooldown: 5000,
			slash: true,
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

		// const subredditsbr = [ 'MemesBrasil', 'MemesBR' ];

		const subreddits = [
			'memes',
			'meme',
			'bonehurtingjuice',
			'surrealmemes',
			'dankmemes',
			'meirl',
			'me_irl',
			'funny'
		];

		var randSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
		// var randSubredditbr = subredditsbr[Math.floor(Math.random() * subredditsbr.length)];
		await fetch(`https://www.reddit.com/r/${randSubreddit}.json`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(data => {
			let info = []
			const res = data.data.children.filter(m => m.data.post_hint === 'image')
			res.forEach(post => {
				info.push({ title: post.data.title, up: post.data.ups, downs: post.data.downs, link: `https://www.reddit.com${post.data.permalink}`, image: post.data.url, upvote_ratio: post.data.upvote_ratio, created: post.data.created })
			})

			const reddit = info[Math.floor(Math.random() * info.length)]

			const probability = reddit.upvote_ratio;
			const percentage = Math.round((probability * 100));
			const calc = reddit.up - (reddit.up * (percentage / 100));
			const newPercentage = 100 - percentage;

			if (!reddit) return message.channel.error(settings.Language, 'ERROR_MESSAGE', `Falha em r/${randSubreddit}`).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

			const meme = new Embed(bot, message.guild)
				.setFooter({ text: `👍 ${utility.commatize(reddit.up)} (${utility.commatize(percentage)}% of upvotes) | 👎 ${utility.commatize(Math.round(calc.toFixed(2)))} (${utility.commatize(newPercentage)}% of downvotes)\n${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}` })
				.setColor(65475)
				.setTitle(reddit.title)
				.setURL(reddit.link)
				.setImage(reddit.image)

			return new Promise(async (resolve, reject) => {
				msg.delete();
				await message.channel.send({ embeds: [meme] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
			})
		})
	}
	// EXEC - SLASH
	async callback(bot, interaction, guild, args) {
		const member = interaction.user;
		const channel = guild.channels.cache.get(interaction.channelId);

		try {
			// Get Interaction Message Data
			await interaction.deferReply();

			// RANDOM LOADING MSG
			const phrase = () => {
				const p = [
					guild.translate('misc:BUSCAR_DADOS'),
					guild.translate('misc:BUSCAR_DADOS1'),
					guild.translate('misc:BUSCAR_DADOS2', { prefix: guild.settings.prefix }),
				];
				return p[Math.floor(Math.random() * p.length)];
			};

			const msg = await interaction.editReply(phrase());

			const subreddits = [
				'memes',
				'meme',
				'bonehurtingjuice',
				'surrealmemes',
				'dankmemes',
				'meirl',
				'me_irl',
				'funny'
			];

			var randSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
			await fetch(`https://www.reddit.com/r/${randSubreddit}.json`, { method: 'GET', headers: { "Content-Type": "application/json", "Accept": "application/json" } }).then(res => res.json()).then(data => {
				let info = []
				const res = data.data.children.filter(m => m.data.post_hint === 'image')
				res.forEach(post => {
					info.push({ title: post.data.title, up: post.data.ups, downs: post.data.downs, link: `https://www.reddit.com${post.data.permalink}`, image: post.data.url, upvote_ratio: post.data.upvote_ratio, created: post.data.created })
				})

				const reddit = info[Math.floor(Math.random() * info.length)]

				const probability = reddit.upvote_ratio;
				const percentage = Math.round((probability * 100));
				const calc = reddit.up - (reddit.up * (percentage / 100));
				const newPercentage = 100 - percentage;

				if (!reddit) return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: `Failed to connect to r/${randSubreddit}` }, true)], ephemeral: true });

				const meme = new Embed(bot, guild)
					.setFooter({ text: `👍 ${utility.commatize(reddit.up)} (${utility.commatize(percentage)}% of upvotes) | 👎 ${utility.commatize(Math.round(calc.toFixed(2)))} (${utility.commatize(newPercentage)}% of downvotes)\n${guild.translate('misc:FOOTER_GLOBALL', { username: member.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}` })
					.setColor(65475)
					.setTitle(reddit.title)
					.setURL(reddit.link)
					.setImage(reddit.image)

				return new Promise(async (resolve, reject) => {
					// msg.delete();
					await interaction.editReply({ content: ' ', embeds: [meme] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
				})
			})
		} catch (error) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
		}
	}
}