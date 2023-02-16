// Dependências
const { get } = require('axios'),
	{ Embed } = require(`../../utils`),
	Command = require('../../structures/Command.js');

module.exports = class Pernas extends Command {
	constructor(bot) {
		super(bot, {
			name: 'thigh',
			aliases: ['pernas'],
			nsfw: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_WEBHOOKS'],
			description: 'Look at NSFW images.',
			usage: 'pernas',
			cooldown: 5000,
			slash: true,
		});
	}

	// Executar comando
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		const phrase = () => {
			const p = [
				message.translate('misc:BUSCAR_DADOS'),
				message.translate('misc:BUSCAR_DADOS1'),
				message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
			];
			return p[Math.floor(Math.random() * p.length)];
		};

		const msg = await message.channel.send(phrase());
		get('https://nekobot.xyz/api/image?type=thigh')
			.then(res => {
				msg.delete();
				/*const embed = new Embed(bot, message.guild)
					.setColor(1)
					.setImage(res.data.message);
				message.channel.send({ embeds: [embed] });*/
				const WebhookNames = ["Ahegao-chan", "MegaMilk", "Suzukawa Rei", "Shichijou Reika", "Mitarai Keiko", "Sakurai Erika", "Belfast", "Suzuhara Lulu", "Kiryuu Coco", "Sesshouin Kiara", "Kagura", "Kama", "Hero-chan", "Honoka", "Iris Lilith Vandella Carmen", "Christina Morgan", "Astolfo", "Takao", "Mei (Pokemon)", "Suomi kp31", "PA15", "Dola", "Weiss Schnee", "Baltimore", "Hyun-sung Seo", "Iris Yuma", "Kashima", "Bari", "Taihou", "Hamazake", "Godguard Brodia", "Miyamae Shiho", "Nijou Aki"]
				const WebhookAvatars = ["9xmBvv0", "waImdvo", "Z8tKkV7", "vSLv9bn", "e5L8mSo", "AkpcTPL", "LHmztxh", "bmEwo0n", "GeA9smM", "xXe89P2", "C24HDRq", "hUyIUqZ", "0qdfV2S", "up7vf1W", "mncvryw", "Ar7JUJ2", "Rdul8FL", "fdwdx4H", "UYBktZQ", "En3ilZ3", "rLqMUFr", "1diobww", "epuvobD", "4QakTZa", "ATwO2dY", "hkentp0", "ISSklge", "hMZ9zSl", "DBearj5", "8Su1c7B", "h8f0God", "dBN6nCu", "usasrUN"]
				const random = Math.floor(Math.random() * (WebhookNames.length - 1))

				return new Promise(async (resolve, reject) => {
					const webhooks = await bot.channels.fetch(message.channel.id).then(c => c.fetchWebhooks());
					let webhook = webhooks.find(wh => wh.name == bot.user.username);
					
					// cria o webhook se não existir
					if (!webhook) {
						webhook = await bot.channels.fetch(message.channel.id).then(c => c.createWebhook(bot.user.username, {
							avatar: bot.user.displayAvatarURL({ format: 'png', size: 1024 }),
						}));
					}

					await webhook.send({
						username: WebhookNames[random],
						avatarURL: `https://i.imgur.com/${WebhookAvatars[random]}.gif`,
						content: res.data.message,
					});

					/*var hook = await message.channel.createWebhook(WebhookNames[random], { avatar: `https://i.imgur.com/${WebhookAvatars[random]}.gif`, reason: `command ${settings.prefix}thigh by ${message.author.username}` })
					await hook.send(res.data.message).catch(err => message.channel.error('misc:ERROR_MESSAGE', { err: err.message }));
					setTimeout(async function () {
						await hook.delete()
					}, 30000);*/
				})
			});
	}
	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId);

		get('https://nekobot.xyz/api/image?type=thigh')
			.then(res => {
				/*const embed = new Embed(bot, guild)
					.setColor(1)
					.setImage(res.data.message);*/
				interaction.reply({ content: res.data.message, ephemeral: true });
			});
	}
};