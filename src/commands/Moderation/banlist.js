// Dependências
const Command = require('../../structures/Command.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js');

module.exports = class Banlist extends Command {
	constructor(bot) {
		super(bot, {
			name: 'banlist',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.BanMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.BanMembers],
			description: 'Displays the server\'s banned list.',
			usage: '<prefix><commandName>',
			examples: [
				'.banlist'
			],
			cooldown: 3000,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {

		const bans = await message.guild.bans.fetch(); //Obtém a lista de membros banidos do servidor

		if (!bans.first()) return message.channel.error(message.translate('Moderation/banlist:BANLIST2')).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

		let msg = '';

		//Mapeia a lista de membros banidos e adiciona a sua tag à variável msg (USER#0001)
		bans.map(user => {
			msg += `${user.user.tag}, `;
		});

		//Por fim envia a mensagem com todas as tags dos membros banidos, com split no caso de o servidor ter muitos membros banidos e a lista for grande
		message.channel.success(`${message.translate('Moderation/banlist:BANLIST3')}\n\`\`\`${JSON.stringify(msg, { split: true })}\`\`\``);
	}
};
