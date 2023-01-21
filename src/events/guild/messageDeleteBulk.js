// Dependencies
const { AttachmentBuilder } = require('discord.js'),
	{ Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	moment = require('moment'),
	Event = require('../../structures/Event');

module.exports = class messageDeleteBulk extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, messages) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: messages.first().guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: messages.first().guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: messages.first().guild.id });
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`${messages.size} mensagens foram deletadas no servidor: ${messages.first().channel.guild.name} [${messages.first().channel.guild.id}]`);

		// Get server settings / if no settings then return
		const settings = messages.first().channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageDeleteBulk is for logging
		if (logDB.MessageEvents.PurgedToggle == true && logDB.MessageEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.MessageEvents.EmbedColor;
			if (color == "#000000") color = '#4bd37b';

			// Create file of deleted messages
			let humanLog = `**${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK')} #${messages.first().channel.name} (${messages.first().channel.id}) ${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK6')} ${messages.first().guild.name} (${messages.first().guild.id})**`;
			for (const message of [...messages.values()].reverse()) {
				humanLog += `\r\n\r\n[${moment(message.createdAt).format('llll')}] ${message.author?.tag ?? 'Unknown'} (${message.id})`;
				humanLog += ' : ' + message.content;
			}
			const attachment = new AttachmentBuilder(Buffer.from(humanLog, 'utf-8'), { name: messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK7') });
			// Get modlog channel
			const modChannel = await bot.channels.fetch(logDB.MessageEvents.LogChannel).catch(() => {
				// do nothing.
			});
			if (modChannel) {
				const msg = await modChannel.send({ files: [attachment] });

				// embed
				const embed = new Embed(bot, messages.first().guild.id)
					.setDescription(`**${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK')} ${messages.first().channel.toString()}**`)
					.setColor(color)
					.setFooter({ text: `${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK1')} ${messages.first().channel.id}` })
					.setAuthor({ name: `${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK2')}`, iconURL: "https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif" })
					.addFields({ name: `${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK3')}`, value: `${messages.size}`, inline: true },
						// .addField(`${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK4')}`, `[${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK5')}](https://txt.discord.website/?txt=${modChannel.id}/${msg.attachments.first().id}/DeletedMessages)`, true)
						{ name: `${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK4')}`, value: `[${messages.first().channel.guild.translate('Events/messageDeleteBulk:MESSAGE_DELETE_BULK5')}](https://txt.discord.website/?txt=${modChannel.id}/${msg.attachments.first().id || ''}/DeletedMessages)`, inline: true })
					.setTimestamp();

				bot.addEmbed(modChannel.id, [embed]);
			}
		}
	}
};
