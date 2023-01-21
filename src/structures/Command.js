// Dependencies
const path = require('path');

// Command structure
class Command {
	constructor(bot, {
		name = null,
		guildOnly = false,
		dirname = false,
		aliases = new Array(),
		botPermissions = new Array(),
		userPermissions = new Array(),
		examples = new Array(),
		nsfw = false,
		ownerOnly = false,
		cooldown = 3000,
		description = '',
		usage = '',
		slash = false,
		slashSite = false,
		options = new Array(),
	}) {
		const category = (dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length - 1, 10)] : 'Other');
		this.conf = { guildOnly, userPermissions, botPermissions, nsfw, ownerOnly, cooldown, slash, slashSite, options };
		this.help = { name, category, aliases, description, usage, examples, cooldown, slash, slashSite };
	}

	// Function for recieving message.
	async run() {
		throw new Error(`Command: ${this.help.name} does not have a run method`);
	}

	// Function for receiving interaction.
	async callback() {
		throw new Error(`Command: ${this.help.name} does not have a callback method`);
	}


	validate({ content, guild }) {
		const args = content.split(' ');

		if (this.options.length >= 1) {
			for (const option of this.options) {
				const index = this.options.indexOf(option);
				switch (option.type) {
					case 'STRING':

						break;
					case 'INTEGER':
					case 'NUMBER':
						if (option.minValue && option.minValue > args[index]) return true;
						if (option.maxValue && option.maxValue > args[index]) return true;
						return false;
					case 'CHANNEL':
						// Check for channel ID or channel mention
						return (guild.channels.cache.get(args[index]) || /^<#[0-9]{18}>/g.match(args[index]));
					case 'ROLE':
						// Check for role ID or channel mention
						return (guild.roles.cache.get(args[index]) || /^<@&[0-9]{18}>/g.match(args[index]));
					default:
						return true;
				}
			}
		} else {
			return true;
		}
	}
}

module.exports = Command;