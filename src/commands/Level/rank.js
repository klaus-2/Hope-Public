// Dependencies
const { Embed } = require('../../utils'),
	{ paginate } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

// Show the ordinal for the ranks
// eslint-disable-next-line no-sparse-arrays
const ordinal = (num) => `${num.toLocaleString('en-US')}${[, 'st', 'nd', 'rd'][(num / 10) % 10 ^ 1 && num % 10] || 'th'}`;

/**
 * Leaderboard command
 * @extends {Command}
*/
class Leaderboard extends Command {
	/**
	   * @param {Client} client The instantiating client
	   * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'rank',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['lb', 'levels', 'ranks', 'leaderboard'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Exibe o placar de nível do servidor.',
			usage: 'rank',
			cooldown: 3000,
			examples: ['level userID', 'level @mention', 'level username'],
			slash: false,
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
	   * @param {message} message The message that ran the command
	   * @readonly
	*/
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message

		try {
			const res = await this.createLeaderboard(bot, message.guild);
			if (Array.isArray(res)) {
				paginate(bot, message.channel, res, message.author.id);
			} else if (typeof (res) == 'object') {
				message.channel.send({ embeds: [res] });
			} else {
				message.channel.send({ content: res });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	/**
	   * Function for receiving interaction.
	   * @param {bot} bot The instantiating client
	   * @param {interaction} interaction The interaction that ran the command
	   * @param {guild} guild The guild the interaction ran in
	   * @readonly
	*/
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId);

		// Retrieve Ranks from database
		try {
			const res = await this.createLeaderboard(bot, guild);
			if (Array.isArray(res)) {
				paginate(bot, interaction, res, interaction.user.id);
			} else if (typeof (res) == 'object') {
				interaction.reply({ embeds: [res] });
			} else {
				interaction.reply({ content: res });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true });
		}
	}

	/**
	 * Function for creating leaderboard paginator
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @returns {embed}
	*/
	async createLeaderboard(bot, interaction, guild) {
		const res = guild.levels.sort(({ Xp: a }, { Xp: b }) => b - a);

		// if an error occured
		const embed = new Embed(bot, guild)
			.setAuthor({ name: guild.translate('Level/rank:LEADERBOARD_TITLE'), iconURL: `${bot.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
			//.setURL(`${bot.config.websiteURL}/leaderboard/${message.guild.id}`)
			.setColor(513136)
			.setThumbnail(guild.iconURL())
			.addField(guild.translate('Level/rank:LVL_RANK'), ` \`${guild.name}\``, true)
			.setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Level/${this.help.name}:USAGEE`)}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', dynamic: true })}` })
		if (!res[0]) {
			// If there no results
			embed.addField({ name: guild.translate('Level/rank:LEADERBOARD_FIELDT'), value: guild.translate('Level/rank:LEADERBOARD_FIELDDESC') });
			return embed;
		} else {
			// Get number of pages to generate
			let pagesNum = Math.ceil(res.length / 10);
			if (pagesNum === 0) pagesNum = 1;

			// generate pages
			const pages = [];
			await guild.members.fetch();
			for (let i = 0; i < pagesNum; i++) {
				const embed2 = new Embed(bot, guild)
					.setAuthor({ name: guild.translate('Level/rank:LEADERBOARD_TITLE'), iconURL: `${bot.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
					//.setURL(`${bot.config.websiteURL}/leaderboard/${message.guild.id}`)
					.setColor(513136)
					.setThumbnail(guild.iconURL())
					.addField(guild.translate('Level/rank:LVL_RANK'), ` \`${guild.name}\``, true)
					.setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Level/${this.help.name}:USAGEE`)}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', dynamic: true })}` })
				for (let j = 0; j < 10; j++) {
					if (res[(i * 10) + j]) {
						// eslint-disable-next-line no-empty-function
						const name = guild.members.cache.get(res[(i * 10) + j].userID) || 'User left';
						if (name == 'User left') {
							embed2.addField(`${ordinal((i * 10) + j + 1)} ${name}`, `**XP:** ${res[(i * 10) + j].Xp.toLocaleString(guild.settings.Language)} | **${guild.translate('Level/rank:LVL_RANK1')}** ${res[(i * 10) + j].Level.toLocaleString(guild.settings.Language)}`);
							//embed2.fields.push({ name: 
						} else {
							embed2.addField(`${ordinal((i * 10) + j + 1)} ${name.user.username}`, `**XP:** ${res[(i * 10) + j].Xp.toLocaleString(guild.settings.Language)} | **${guild.translate('Level/rank:LVL_RANK1')}** ${res[(i * 10) + j].Level.toLocaleString(guild.settings.Language)}`);
						}
					}
				}
				// interact with paginator
				pages.push(embed2);
				if (i == pagesNum - 1 && pagesNum > 1) {
					return pages;
				} else if (pagesNum == 1) {
					return embed2;
				}
			}
		}
	}
}

module.exports = Leaderboard;