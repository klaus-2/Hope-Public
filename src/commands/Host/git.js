// Dependencies
const { execSync } = require('child_process'),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

class Git extends Command {
	constructor(bot) {
		super(bot, {
			name: 'git',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Displays git information',
			usage: 'git',
			cooldown: 3000,
			examples: ['git'],
            slash: false,
		});
	}

	// EXEC - PREFIX
	async run(bot, message) {
		const t = await execSync('git status').toString();
		message.channel.send({ content: `\`\`\`css\n${t}\n\`\`\`` });
	}
    
	// EXEC - SLASH
	async callback(bot, interaction) {
		const t = await execSync('git status').toString();
		interaction.reply({ content: `\`\`\`css\n${t}\n\`\`\`` });
	}
}

module.exports = Git;