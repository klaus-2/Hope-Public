// Dependencies
const Event = require('../../structures/Event');

class InteractionCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, interaction) {

		// Check if it's message context menu
		if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) return bot.emit('clickMenu', interaction);

		// Check if it's autocomplete
		if (interaction.isAutocomplete()) return bot.emit('autoComplete', interaction);

		// Check if it's a button
		if (interaction.isButton()) return bot.emit('clickButton', interaction);

		// Check if it's a button
		if (interaction.isStringSelectMenu()) return bot.emit('clickSelect', interaction);

		// Check if it's a slash command
		if (interaction.isCommand()) return bot.emit('slashCreate', interaction);
	}
}

module.exports = InteractionCreate;
