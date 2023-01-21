// Dependências
const { AttachmentBuilder } = require('discord.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ post } = require('axios'),
	{ Embed } = require(`../../utils`),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

// image types
const image_1 = ['3000years', 'ad', 'affect', 'approved', 'beautiful', 'beautiful', 'bobross', 'brazzers', 'burn', 'challenger', 'circle', 'color', 'confusedstonk', 'crush', 'ddungeon', 'delete', 'dictator', 'discordblack', 'discordblue', 'distort', 'ednaldo', 'emboss', 'facepalm', 'fire', 'frame', 'gay', 'glitch', 'greyscale', 'hitler', 'instagram', 'invert', 'jail', 'jokeoverhead', 'karaba', 'magik', 'missionpassed', 'mms', 'moustache', 'notstonk', 'posterize', 'poutine', 'ps4', 'rainbow', 'redple', 'rejected', 'rip', 'scary', 'sepia', 'sharpen', 'shit', 'sniper', 'stonk', 'subzero', 'tatoo', 'thanos', 'thomas', 'tobecontinued', 'trash', 'triggered', 'unsharpen', 'utatoo', 'wanted', 'wasted'];
const image_2 = ['afusion', 'batslap', 'vs'];

module.exports = class Generate extends Command {
	constructor(bot) {
		super(bot, {
			name: 'generate',
			dirname: __dirname,
			aliases: ['gerar'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AttachFiles],
			description: 'Generates a custom image.',
			usage: '<prefix><commandName> [option] [user]',
			examples: [
				'.generate 3000years',
				'.generate affect @Klaus',
				'!gerar batslap @Klaus @Hope',
				'?generate vs @Hope [attachment]'
			],
			cooldown: 5000,
			slash: false,
			options: [{
				name: 'option',
				description: 'Option',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [{ name: 'list', value: 'list' }, ...image_1.map(item => ({ name: item, value: item })), ...image_2.map(item => ({ name: item, value: item }))].slice(0, 24),
			}, {
				name: 'user',
				description: 'User\'s avatar to manipulate.',
				type: ApplicationCommandOptionType.User,
				required: false,
			}, {
				name: 'user2',
				description: 'Second user\'s avatar to manipulate.',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// If user wants to see generate list
		if (!message.args[0] || ['list', '?'].includes(message.args[0]) || (!image_1.includes(message.args[0]) && !image_2.includes(message.args[0]))) {
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('Image/generate:GENERATE_DESC', { IMG_1: `${image_1.join('`, `')}`, IMG_2: `${image_2.join('`, `')}` }))
				.setColor(16711902)
			return message.channel.send({ embeds: [embed] });
		}

		if (message.args[0] === 'ednaldo') {
			message.args[1] = message.args[1];
			await bot.commands.get('ednaldo').run(bot, message, settings);
		}

		const genplus = [
			"ad",
			"affect",
			"beautiful",
			"bobross",
			"color",
			"confusedstonk",
			"delete",
			"discordblack",
			"discordblue",
			"facepalm",
			"hitler",
			"jail",
			"jokeoverhead",
			"karaba",
			"mms",
			"notstonk",
			"poutine",
			"rainbow",
			"rip",
			"shit",
			"stonk",
			"tatoo",
			"thomas",
			"trash",
			"wanted",
			"wasted",
		];

		if (genplus.includes(message.args[0])) {
			message.args[1] = message.args[1];
			await bot.commands.get('plusgen').run(bot, message, settings);
		}

		const ignore = [
			"ednaldo",
			"ad",
			"affect",
			"beautiful",
			"bobross",
			"color",
			"confusedstonk",
			"delete",
			"discordblack",
			"discordblue",
			"facepalm",
			"hitler",
			"jail",
			"jokeoverhead",
			"karaba",
			"mms",
			"notstonk",
			"poutine",
			"rainbow",
			"rip",
			"shit",
			"stonk",
			"tatoo",
			"thomas",
			"trash",
			"wanted",
			"wasted",
		];

		// Get image, defaults to author's avatar
		const choice = message.args[0];
		if (ignore.includes(choice)) return;
		message.args.shift();
		const files = await message.getImage();
		if (!Array.isArray(files)) return;

		// Check if 2 images are needed
		if (image_2.includes(choice) && !files[1]) return message.channel.error('Image/generate:NEED_TWOIMG').then(m => m.timedDelete({ timeout: 5000 }));
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
		// get image
		const options = image_1.includes(choice) ? { 'url': files[0] } : { 'avatar': files[1], 'url': files[0] };
		const image = await post(`https://v1.api.amethyste.moe/generate/${choice}`, options, {
			responseType: 'arraybuffer',
			headers: {
				'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
			},
		}).catch(err => {
			// if an error occured
			msg.delete();
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		});
		// send embed
		if (!image || !image.data) return;
		const attachment = new AttachmentBuilder(image.data, { name: `${choice}.${choice == 'triggered' ? 'gif' : 'png'}` });
		msg.delete();
		message.channel.send({ files: [attachment] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const option = args.get('option').value;
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
		const member2 = guild.members.cache.get(args.get('user2')?.value ?? interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE') });

		try {
			// If user wants to see generate list
			if (option === 'list') {
				const embed = new Embed(bot, guild)
					.setDescription(guild.translate('Image/generate:GENERATE_DESC', { IMG_1: `${image_1.join('`, `')}`, IMG_2: `${image_2.join('`, `')}` }))
					.setColor(16711902)
				return interaction.editReply({ embeds: [embed] });
			}

			if (option === 'ednaldo') {
				await bot.commands.get('ednaldo').run(bot, member, guild.settings);
			}

			const genplus = [
				"ad",
				"affect",
				"beautiful",
				"bobross",
				"color",
				"confusedstonk",
				"delete",
				"discordblack",
				"discordblue",
				"facepalm",
				"hitler",
				"jail",
				"jokeoverhead",
				"karaba",
				"mms",
				"notstonk",
				"poutine",
				"rainbow",
				"rip",
				"shit",
				"stonk",
				"tatoo",
				"thomas",
				"trash",
				"wanted",
				"wasted",
			];

			if (genplus.includes(option)) {
				await bot.commands.get('plusgen').run(bot, member, guild.settings);
			}

			const ignore = [
				"ednaldo",
				"ad",
				"affect",
				"beautiful",
				"bobross",
				"color",
				"confusedstonk",
				"delete",
				"discordblack",
				"discordblue",
				"facepalm",
				"hitler",
				"jail",
				"jokeoverhead",
				"karaba",
				"mms",
				"notstonk",
				"poutine",
				"rainbow",
				"rip",
				"shit",
				"stonk",
				"tatoo",
				"thomas",
				"trash",
				"wanted",
				"wasted",
			];

			// Get image, defaults to author's avatar
			const choice = option;
			if (ignore.includes(choice)) return;
			// message.args.shift();
			const files = await guild.getImage();
			if (!Array.isArray(files)) return;

			// Check if 2 images are needed
			if (image_2.includes(choice) && !files[1]) return interaction.editReply({ content: ' ', embeds: [channel.error('Image/generate:NEED_TWOIMG', {}, true)], ephemeral: true });

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
			// get image
			const options = image_1.includes(choice) ? { 'url': files[0] } : { 'avatar': files[1], 'url': files[0] };
			const image = await post(`https://v1.api.amethyste.moe/generate/${choice}`, options, {
				responseType: 'arraybuffer',
				headers: {
					'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
				},
			}).catch(err => {
				// if an error occured
				msg.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true });
			});
			// send embed
			if (!image || !image.data) return;
			const attachment = new AttachmentBuilder(image.data, { name: `${choice}.${choice == 'triggered' ? 'gif' : 'png'}` });
			msg.delete();
			interaction.editReply({ files: [attachment] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true });
		}
	}
};