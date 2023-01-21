const { EmbedBuilder } = require('discord.js');

module.exports = class HopeEmbed extends EmbedBuilder {
	constructor(bot, guild, data = {}) {
		super(data);
		this.bot = bot;
		this.guild = guild;
		this.setColor(bot.config.embedColor)
			//.setTimestamp();
	}

	// Language translator for title
	setTitle(key, args) {
		const language = this.guild.settings?.Language ?? require(`${process.cwd()}/assets/json/defaultGuildSettings.json`).Language;
		this.data.title = this.bot.translate(key, args, language) ? this.bot.translate(key, args, language) : key;
		return this;
	}
};
