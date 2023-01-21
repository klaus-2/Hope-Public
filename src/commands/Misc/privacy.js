// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Privacy extends Command {
	constructor(bot) {
		super(bot, {
			name: 'privacy',
			dirname: __dirname,
			aliases: ['privacidade'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Sends a link to Hope\'s privacy policy.',
			usage: '<prefix><commandName>',
			examples: [
				'.privacy'
			],
			cooldown: 3000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		// Send link to privacy policy
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		const embed = new Embed(bot, message.guild)
			.setAuthor({ name: `Hope Privacy Policy`, iconURL: `${bot.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true })}` })
			.setColor(16775424)
			.setDescription(`You can access my Privacy Policy at this link: [hopebot.top/privacy-policy](https://hopebot.top/privacy-policy).`)
		message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}
};
