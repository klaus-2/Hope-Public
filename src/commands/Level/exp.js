// Dependências
const { MessageAttachment } = require('discord.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ RankSchema } = require('../../database/models'),
	{ Rank: rank } = require('canvacord'),
	Command = require('../../structures/Command.js');

module.exports = class Exp extends Command {
	constructor(bot) {
		super(bot, {
			name: 'expcard',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AttachFiles],
			description: 'Mostra sua classificação/nível.',
			usage: 'exp [user]',
			cooldown: 3000,
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// obtem um usuario
		const members = await message.getMember();
		if (members[0].user.bot) return channel.error(`Uh-oh! Bots do not have a profile.`, {}, true);

		// Retrieve Rank from databse
		RankSchema.find({
			guildID: message.guild.id,
		}).sort([
			['user', 'descending'],
		]).exec((err, res) => {
			const user = res.find(doc => doc.userID == members[0].user.id);
			// if they haven't send any messages
			if (!user) {
				return message.channel.error(message.translate('level/exp:NO_MESSAGES'));
			}
			// Get rank
			const rankScore = res.indexOf(res.find(i => i.userID == target.user.id));
			// create rank card
			const rankcard = new rank()
				.setAvatar(members[0].user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 }))
				.setCurrentXP(user.Level == 1 ? user.Xp : (user.Xp - (5 * ((user.Level - 1) ** 2) + 50 * (user.Level - 1) + 100)))
				.setLevel(user.Level)
				.setRank(rankScore + 1)
				.setRequiredXP((5 * (user.Level ** 2) + 50 * user.Level + 100) - (5 * ((user.Level - 1) ** 2) + 50 * (user.Level - 1) + 100))
				.setStatus(members[0].presence.status)
				.setProgressBar(['#e766ff', '#e2e57b'], 'GRADIENT')
				.setBackground("IMAGE", "https://i.imgur.com/cJ7JLwQ.png")
				.setUsername(members[0].user.username)
				.setDiscriminator(members[0].user.discriminator);
			// send rank card
			rankcard.build().then(buffer => {
				const attachment = new MessageAttachment(buffer, 'HopeRank.png');
				//msg.delete();
				message.channel.send({ files: [attachment] });
			});

		});
	}
};
