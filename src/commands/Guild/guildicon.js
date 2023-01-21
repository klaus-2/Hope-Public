// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Guildicon extends Command {
	constructor(bot) {
		super(bot, {
			name: 'guildicon',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['servericon', 'fotoservidor', 'fotosv'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Displays the server icon.',
			usage: '<prefix><commandName>',
			examples: [
				'.guildicon',
				'!servericon',
				'?fotosv'
			],
			cooldown: 3000,
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// Verifica a foto do sv e envia a mensagem
		if (message.guild.icon) {
			const embed = new Embed(bot, message.guild)
				.setDescription(`${message.translate('Guild/avatar:AVATAR_DESCRIPTION')}\n[png](${message.guild.iconURL({ format: 'png', size: 1024 })}) | [jpg](${message.guild.iconURL({ format: 'jpg', size: 1024 })}) | [gif](${message.guild.iconURL({ format: 'gif', size: 1024, dynamic: true })}) | [webp](${message.guild.iconURL({ format: 'webp', size: 1024 })})`)
				.setColor(1)
				.setImage(message.guild.iconURL({ dynamic: true, size: 1024 }));
			message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		} else {
			// if (message.deletable) message.delete();
			message.channel.error('Guild/guildicon:NO_GUILD_ICON').then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}
	}
};
