// Dependências
const { deleteDB } = require('../../helpers/newGuild'),
	{ Embed } = require('../../utils'),
	{ AttachmentBuilder } = require('discord.js'),
	{ Canvas } = require('canvacord'),
	Event = require('../../structures/Event');

module.exports = class guildDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event	
	async run(bot, guild) {
		if (!bot.isReady() && !guild.available) return;
		bot.logger.log(`[GUILD LEAVE] ${guild.name} (${guild.id}) removed the bot.`);
		await bot.DeleteGuild(guild);

		// Send message to channel that bot has left a server
		let attachment;
		const embed = new Embed(bot, guild)
			.setTitle(`[GUILD LEAVE] ${guild.name}`)
			.setColor('#fd003a');
		if (guild.icon == null) {
			const icon = await Canvas.guildIcon(guild.name ?? 'undefined', 128);
			attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
			embed.setThumbnail('attachment://guildicon.png');
		} else {
			embed.setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }));
		}
		embed.setDescription([
			`\`\`\`Nome do servidor          ::  ${guild.name ?? 'undefined'}\nDono do servidor          ::  ${bot.users.cache.get(guild.ownerId)?.tag}\nQuantidade de membros    ::  ${guild?.memberCount ?? 'undefined'}\`\`\``,
		].join('\n'));

		const modChannel = await bot.channels.fetch(bot.config.SupportServer.GuildChannel);
		if (modChannel) bot.addEmbed(modChannel.id, [embed, attachment]);

		// Clean up database (delete all guild data)
		await deleteDB(guild);
	}
};