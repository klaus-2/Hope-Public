const { MessageEmbed } = require('discord.js');
const { AutoReddit } = require('../../database/models');
const cron = require("node-cron");
let date = Math.floor(Date.now() / 1000);

async function fetchSub(sub) {
	return new Promise((resolve) => {
		try {
			require('request')({ url: `https://reddit.com/r/${sub}/new.json?limit=3`, json: true }, async (err, res, body) => {
				if (!res) res = { statusCode: 404 };
				if (res.statusCode === 200) {
					const posts = [];
					for await (const post of body.data.children.reverse()) {
						if (date <= post.data.created_utc) {
							date = post.data.created_utc;
							const p = post.data;
							posts.push({
								title: p.title || '',
								url: p.url || '',
								permalink: `https://reddit.com${p.permalink}`,
								author: {
									name: p.author || 'Deleted',
								},
								sub: {
									name: p.subreddit || sub,
								},
							});
						}
					}
					if (posts.length === 0) return resolve([]);
					++date;
					return resolve(posts);
				}
			});
		} catch (err) {
			console.log(err);
			resolve([]);
		}
	});
}

module.exports = async (client) => {
	let subreddits, subreddit;
	async function RetrivedDate() {
        /** ------------------------------------------------------------------------------------------------
        * OBTEM OS SUBREDDITS DO BANCO DE DADOS
        * ------------------------------------------------------------------------------------------------ */
		subreddit = await AutoReddit.find({});
		if (!subreddit[0]) return client.logger.error('Sem subreddits para carregar.');

		subreddits = [];
		for (let i = 0; i < subreddit.length; i++) {
			if (subreddit[i].channelIDs.length >= 1) {
				subreddits.push(subreddit[i].subredditName);
			} else {
				await AutoReddit.findOneAndRemove({ subredditName: subreddit[i].subredditName }, (err) => {
					if (err) console.log(err);
				});
			}
		}
	}
	await RetrivedDate();


	const job0 = cron.schedule(
		"* * * * *",
		async () => {
			await RetrivedDate();

			client.logger.ready(`Auto-Reddit online, observando ${subreddits.length} subreddits`);

			subreddits.forEach(async sub => {
				if (sub) {
					const res = await fetchSub(sub);
					if (res.length !== 0) {
						client.logger.debug(`Foram recebidos: ${res.length} novos posts dos subreddit. Compartilhando nos canais designados!`);
						for (let i = 0; i < res.length; i++) {
        					/** ------------------------------------------------------------------------------------------------
        					* ENCONTRA O CANAL E ENTÃO POSTA A QUEUE DE POSTS
        					* ------------------------------------------------------------------------------------------------ */
							for (let z = 0; z < subreddit.length; z++) {
								if (subreddit[z].subredditName == res[i].sub.name) {
									for (let y = 0; y < subreddit[z].channelIDs.length; y++) {
										const channel = client.channels.cache.get(subreddit[z].channelIDs[y]);
										if (channel) {
											const embed = new MessageEmbed()
												.setTitle(`${res[i].title}`)
												.setImage(`${res[i].url}`)
												.setFooter({ text: `Powered by hopebot.top  •  u/${res[i].author.name}  •  r/${res[i].sub.name}` })
												.setURL(`${res[i].permalink}`)
												.setTimestamp()
												.setDescription(`\u2000`)
												.setColor('RANDOM');
											client.addEmbed(channel.id, [embed]);
										}
									}
								}
							}
						}
					}
				}
			});
		},
		{
			timezone: "America/Sao_Paulo",
		}
	);

	job0.start();
};