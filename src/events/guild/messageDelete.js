// Dependencies
const { Embed } = require('../../utils'),
	{ ReactionRoleSchema, GiveawaySchema, loggingSystem } = require('../../database/models'),
	{ ChannelType } = require('discord-api-types/v10'),
	Event = require('../../structures/Event');

module.exports = class messageDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, message) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: message.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: message.guild.id,
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: message.guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Uma mensagem foi deletada${!message.guild ? '' : ` no servidor: ${message.guild.name} [${message.guild.id}]`}.`);

		// Make sure the message wasn't deleted in a Dm channel
		if (message.channel.type == ChannelType.DM) return;

		// If someone leaves the server and the server has default discord messages, it gets removed but says message content is null (Don't know why)
		if (!message.content && message.attachments.size == 0 && message.embeds[0]) return;

		// if the message is a partial or a webhook return
		if (message.partial || message.webhookID) return;

		//SNIPE SYSTEM
		bot.snipe = new Map();
		bot.snipe.set(message.channel.id, {
			content: message.content,
			author: message.author.username,
			image: message.attachments.first()
				? message.attachments.first().proxyURL
				: null
		});

		// Check if the message was a giveaway/reaction role embed
		try {
			// check reaction roles
			const rr = await ReactionRoleSchema.findOneAndRemove({ messageID: message.id, channelID: message.channel.id });
			if (rr) bot.logger.log('Um reaction role foi deletado.');

			// check giveaways
			const g = await GiveawaySchema.findOneAndRemove({ messageID: message.id, channelID: message.channel.id });
			if (g) {
				await bot.giveawaysManager.delete(message.id);
				bot.logger.log('Um sorteio foi deletado.');
			}
		} catch (err) {
			bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${message.guild.name} [${message.guild.id}]: ${err.message}.`);
		}

		// Make sure its not the bot
		if (message.author.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = message.guild?.settings ?? [];
		if (Object.keys(settings).length == 0) return;

		// Check if ModLog plugin is active
		if (message.content.startsWith(settings.prefix)) return;

		// Check if event messageDelete is for logging
		if (logDB.MessageEvents.DeletedToggle == true && logDB.MessageEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MessageEvents.EmbedColor;
			if (color == "#000000") color = '#fd003a';

			// shorten message if it's longer then 1024
			let shortened = false;
			let content = message.content;
			if (content.length > 1024) {
				content = content.slice(0, 1020) + '...';
				shortened = true;
			}

			// Basic message construct
			const embed = new Embed(bot, message.guild)
				.setDescription(`**${message.guild.translate('Events/messageDelete:MESSAGE_DELETE')} ${message.author.toString()} ${message.guild.translate('Events/messageDelete:MESSAGE_DELETE1')} ${message.channel.toString()}**`)
				.setColor(color)
				.setFooter({ text: `${message.guild.translate('Events/messageDelete:MESSAGE_DELETE2')} ${message.author.id} | ${message.guild.translate('Events/messageDelete:MESSAGE_DELETE3')} ${message.id}` })
				.setAuthor({ name: `${message.guild.translate('Events/messageDelete:MESSAGE_DELETE4')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
				.setTimestamp();

			if (message.content.length > 0) embed.addFields({ name: `${message.guild.translate('Events/messageDelete:MESSAGE_DELETE5')} ${shortened ? message.guild.translate('Events/messageDelete:MESSAGE_DELETE6') : ''}:`, value: `${message.content.length > 0 ? content : message.guild.translate('Events/messageDelete:MESSAGE_DELETE7')}`, inline: false })

			// check for attachment deletion
			if (message.attachments.size > 0) {
				//console.log(message.attachments.map(file => `${file.url} \n`));
				//console.log(message.attachments);
				embed.addFields({
					'name': `${message.guild.translate('Events/messageDelete:MESSAGE_DELETE8')}`,
					'value': `${message.attachments.map(file => file.url).join('\n')}`,
				});
			}

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.MessageEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == message.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${message.guild.name} [${message.guild.id}]: ${err.message}.`);
			}
		}
	}
};
