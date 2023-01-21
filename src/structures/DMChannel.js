// Dependecies
const { EmbedBuilder } = require('discord.js'),
	{ DMChannel } = require('discord.js');

module.exports = Object.defineProperties(DMChannel.prototype, {
	// Send custom 'error' message
	error: {
		value: function (key, args, returnValue) {
			try {
				//const emoji = this.client.customEmojis['cross'];
				const embed = new EmbedBuilder()
					.setColor(16741245)
					.setDescription(`<:cancel:855859391709577266> ${this.client.translate(key, args, require(`${process.cwd()}/assets/json/defaultGuildSettings.json`).Language) ?? key}`);
				return returnValue ? embed : this.send({ embeds: [embed] });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
	// Send custom 'success' message
	success: {
		value: function (key, args, returnValue) {
			try {
				//const emoji = this.client.customEmojis['checkmark'];
				const embed = new EmbedBuilder()
					.setColor(10147968)
					.setDescription(`<:v_:855859391835799582> ${this.client.translate(key, args, require(`${process.cwd()}/assets/json/defaultGuildSettings.json`).Language) ?? key}`);
				return returnValue ? embed : this.send({ embeds: [embed] });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
	// Check if bot has permission to send custom emoji
	checkPerm: {
		value: function () {
			return true;
		},
	},
});
