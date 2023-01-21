// Dependencies
const { Embed } = require('../../utils'),
	{ ReactionRoleSchema, loggingSystem } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class messageReactionRemove extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, reaction, user) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: reaction.message.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: reaction.message.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: reaction.message.guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Uma reação foi removida de uma mensagem${!reaction.message.guild ? '' : ` no servidor: ${reaction.message.guild.name} [${reaction.message.guild.id}]`}`);

		// Check for reaction
		const { guild } = reaction.message;
		// eslint-disable-next-line no-empty-function
		const member = await guild.members.fetch(user.id).catch(() => { });
		if (!member) return;

		// check database if reaction is from reaction role embed
		const dbReaction = await ReactionRoleSchema.findOne({
			guildID: guild.id,
			messageID: reaction.message.id,
		});

		if (dbReaction) {
			const rreaction = dbReaction.reactions.find(r => r.emoji === reaction.emoji.toString());
			if (rreaction) {
				// Add or remove role depending if they have it or not
				try {
					if (member.roles.cache.has(rreaction.roleID)) {
						return await member.roles.remove(rreaction.roleID);
					}
				} catch (err) {
					const channel = await bot.channels.fetch(dbReaction.channelID).catch(() => bot.logger.error(`Missing channel for reaction role in guild: ${guild.id}`));
					if (channel) channel.send(`${reaction.message.guild.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD5')} ${member}: ${guild.roles.cache.get(rreaction.roleID)}`).then(m => m.timedDelete({ timeout: 5000 }));
				}
			}
		}

		// Make sure it's not a BOT and in a guild
		if (user.bot) return;
		if (!reaction.message.guild) return;

		// If reaction needs to be fetched
		try {
			if (reaction.partial) await reaction.fetch();
			if (reaction.message.partial) await reaction.message.fetch();
		} catch (err) {
			return bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${reaction.message.guild.name} [${reaction.message.guild.id}]: ${err.message}.`);
		}

		// make sure the message author isn't the bot
		if (reaction.message.author.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = reaction.message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageReactionRemove is for logging
		if (logDB.MessageEvents.ReactionToggle == true && logDB.MessageEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MessageEvents.EmbedColor;
			if (color == "#000000") color = '#fd003a';

			const embed = new Embed(bot, reaction.message.guild)
				.setDescription(`**${user.toString()} ${reaction.message.guild.translate('Events/messageReactionRemove:MESSAGE_REACTION_REMOVE')} ${reaction.emoji.toString()} [${reaction.message.guild.translate('Events/messageReactionRemove:MESSAGE_REACTION_REMOVE1')}](${reaction.message.url})** `)
				.setColor(color)
				.setFooter({ text: `${reaction.message.guild.translate('Events/messageReactionRemove:MESSAGE_REACTION_REMOVE2')} ${user.id} | ${reaction.message.guild.translate('Events/messageReactionRemove:MESSAGE_REACTION_REMOVE3')} ${reaction.message.id}` })
				.setAuthor({ name: `${reaction.message.guild.translate('Events/messageReactionRemove:MESSAGE_REACTION_REMOVE4')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.MessageEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == reaction.message.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${reaction.message.guild.name} [${reaction.message.guild.id}]: ${err.message}.`);
			}
		}
	}
};
