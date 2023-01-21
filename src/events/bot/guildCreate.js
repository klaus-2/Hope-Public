// Dependências
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField: { Flags } } = require("discord.js"),
	{ Embed } = require('../../utils'),
	{ createDB } = require('../../helpers/newGuild'),
	{ Canvas } = require('canvacord'),
	{ AttachmentBuilder } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class GuildCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, guild) {
		/** ------------------------------------------------------------------------------------------------
		* DEBUG
		* ------------------------------------------------------------------------------------------------ */
		bot.logger.log(`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot.`);

		/** ------------------------------------------------------------------------------------------------
		* CRIA AS PRINCIPAIS DB DO SERVIDOR PARA FUNCIONAMENTO DE RECURSOS BÁSICOS
		* ------------------------------------------------------------------------------------------------ */
		await createDB(guild);

		/** ------------------------------------------------------------------------------------------------
		* OBTÉM CONFIG DO SERVIDOR OU RERTONA
		* ------------------------------------------------------------------------------------------------ */
		const settings = guild.settings;
		if (Object.keys(settings).length == 0) return;

		/** ------------------------------------------------------------------------------------------------
		* ME AVISA SE ALGUÉM ADICIONAR A Hope EM UM SERVIDOR
		* ------------------------------------------------------------------------------------------------ */
		const membros = guild.members.cache;
		const owner = await guild.fetchOwner();
		const bb = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					// .setCustomId('')
					.setLabel('Owner Profile')
					.setStyle(ButtonStyle.Link)
					.setURL(`discord://-/users/${owner.user.id}`)
			);
		const embed = new Embed(bot, guild)
			.setAuthor({ name: '[EVENT — SERVER ADDED]', iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
			.setDescription(`📝Server name: ${guild.name}\n👨‍💼Server owner: [${owner.user.tag}](https://discordapp.com/users/${owner.user.id})\n👨‍👧‍👦Number of members: ${guild.memberCount}\n👨‍👧‍👦Humanos: ${membros.filter(member => !member.user.bot).size}\n👨‍👧‍👦Bots: ${membros.filter(member => member.user.bot).size}`)
			.setColor('#4bd37b')
			.setFooter({ text: `GUILD ID: ${guild.id} | OWNER ID: ${owner.user.id}` });

		let attachment;
		if (guild.icon == null) {
			const icon = await Canvas.guildIcon(guild.name, 128);
			attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
			embed.setThumbnail('attachment://guildicon.png');
		} else {
			embed.setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }));
		}
		embed.setTimestamp();
		const modChannel = await bot.channels.fetch(bot.config.SupportServer.GuildChannel).catch(() => {
			// do nothing.
		});
		if (modChannel) bot.addEmbed(modChannel.id, [embed, attachment, bb]);

		/** ------------------------------------------------------------------------------------------------
		* ENVIA MSG DE BOAS-VIDAS AO DONO DO SERVIDOR QUE ADICIONOU A HOPE
		* ------------------------------------------------------------------------------------------------ */
		const roww = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					// .setCustomId('')
					.setLabel('Website')
					.setStyle(ButtonStyle.Link)
					.setURL(`https://hopebot.top`),
				new ButtonBuilder()
					// .setCustomId('')
					.setLabel('Support Server')
					.setStyle(5)
					.setURL(`${bot.config.SupportServer.link}`),
				new ButtonBuilder()
					// .setCustomId('')
					.setLabel('Premium')
					.setStyle(ButtonStyle.Link)
					.setDisabled(true)
					.setURL(`https://hopebot.top/premium`)
			);

		const embedd = new Embed(bot, guild)
			.setAuthor({ name: `Hi, I'm  ${bot.user.username}`, iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
			.setThumbnail(bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
			.setTitle('Thank you for adding Hope to your server!')
			.setColor(12118406)
			.setDescription(`
            Hello ${owner.user}, how are you?
            Hope your day is being excellent! ✧ﾟ･: ヽ(◕ヮ◕ヽ)
            I don't know if it was you or someone else who added me on **${guild.name}**, but, since you have **Admin permission** (*or manage server*) I think it would be a good idea to tell you a little bit about myself. <:SkyeTimida:823046655632211989>\n
            As you already know, my name is Hope and I'm just a simple bot for Discord! My goal is to make your server more :ok_hand::fire::top: with more entertainment, better administration and with many functions that you have never seen in other bots!
            Well... enough of this nonsense! Let me tell you a little bit about things that might interest you. :wink:\n
            Here's the basics to get you started:\n
        **Commands:**
        By default my prefix is \`.\` (*yes, a little point*) try using \`.fact\` on your server to make sure I'm up and running!
        Or if you'd rather go straight to the legal part, get my list of over ${bot.commands.size} commands with \`.help\`\n
        **Support Server:**
        If you need help, or if you happen to find some bug/command that isn't working, or maybe you want to suggest something to make me better or even just offer a help to teach me new languages, then how about dropping by my [support server](${bot.config.SupportServer.link})? :blush:\n
        **Vote/Review Hope Bot:**
        [Top.gg](https://top.gg/bot/901243176814276680)\n
        **Languages**
        So far, I can speak 15 different languages (${bot.languages.map((l) => '`' + l.nativeName + '`').join(', ')})
        And my main language is **English**.
        But if you want me to speak another language, just use. the command \`.lang\`
        Besides, as I mentioned above... all help is welcome on my [Support Server](${bot.config.SupportServer.link})
        for teachings of <:SkyeUau:823047534670774303> new languages.\n
        **Website:**
        [hopebot.top](https://hopebot.top)\n
        **Premium:**
        Yes! and no! All Hope features are free, however some have limits.
        And to get rid of these limits, you need to become premium.
        Visit https://hopebot.top/premium and see how to become one!`)
			.setFooter({ text: 'I\'ll stick around. A big kiss and a giant hug from Hope to you <3' });
		await owner.user.send({ embeds: [embedd], components: [roww] });

		/** ------------------------------------------------------------------------------------------------
		* REMOVE O EMOJI DO NICK DA HOPE
		* ------------------------------------------------------------------------------------------------ */
		try {
			await guild.members.me.setNickname('Hope');
		} catch (err) {
			bot.logger.error(`Error ao alterar nick da Hope: ${err.message}.`);
		}
		/** ------------------------------------------------------------------------------------------------
		* CRIAR O CARGO "SULU" NO SERVIDOR
		* ------------------------------------------------------------------------------------------------ */
		// if (guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
		if (!guild.roles.cache.find(r => r.name === 'Pink Flamingo')) {
			await guild.roles.create({
				name: 'Pink Flamingo',
				color: '#ff2b8d',
				setPosition: 1,
				hoist: false,
				reason: "This is Hope's favorite color.",
				permissions: [Flags.ReadMessageHistory],
			})
		}
		// } else {
		// console.log("Sem permissões para criar o cargo da Hope!");
		// }
		// const rolee = guild.roles.cache.find((r) => r.name === 'Sulu');

		/** ------------------------------------------------------------------------------------------------
		* DA O CARGO "SULU" PARA HOPE
		* ------------------------------------------------------------------------------------------------ */
		try {
			// if (guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			const HopeCargo = guild.roles.cache.find(r => r.name === 'Pink Flamingo');
			if (HopeCargo) await guild.members.me.roles.add(HopeCargo);
			// } else {
			// console.log("Sem permissões para criar o cargo da Hope!");
			// }
		} catch (err) {
			bot.logger.error(err.message);
		}
		/** ------------------------------------------------------------------------------------------------
		* OBTÉM COMANDOS SLASH'S POR CATEGORIAS
		* ------------------------------------------------------------------------------------------------ */
		const enabledPlugins = guild.settings.plugins;
		const data = [];
		for (const plugin of enabledPlugins) {
			const g = await bot.loadInteractionGroup(plugin, guild);
			if (Array.isArray(g)) data.push(...g);
		}

		/** ------------------------------------------------------------------------------------------------
		* ATUALIZA COMANDOS SLASH'S NO SERVIDOR QUE ACABOU DE ADICIONAR A HOPE
		* ------------------------------------------------------------------------------------------------ */
		try {
			await bot.guilds.cache.get(guild.id)?.commands.set(data);
			bot.logger.log('Loaded Interactions for guild: ' + guild.name);
		} catch (err) {
			bot.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
		}
	}
};

