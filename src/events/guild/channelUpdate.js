// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	{ ChannelType } = require('discord-api-types/v10'),
	Event = require('../../structures/Event');

module.exports = class channelUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, oldChannel, newChannel) {
		const { type, guild, name } = newChannel;

		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: guild.id });
		}

		if (oldChannel.type === ChannelType.DM) {
			return;
		}

		const inf = {
			0: guild.translate('Events/channelCreate:CHANNEL_CREATE'),
			2: guild.translate('Events/channelCreate:CHANNEL_CREATE1'),
			4: guild.translate('Events/channelCreate:CHANNEL_CREATE2'),
			13: 'Stage channel',
			5: 'Announcement channel',
			14: 'Directory channel',
			15: 'Forum channel',
			12: 'Private Thread channel',
			11: 'Public Thread channel',
			10: 'News Thread channel',
			5: 'News channel'
		};

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Channel: ${newChannel.type == ChannelType.DM ? newChannel.recipient.tag : newChannel.name} has been updated${newChannel.type == ChannelType.DM ? '' : ` in guild: ${newChannel.guild.id}`}. (${inf[newChannel.type]})`);

		// Get server settings / if no settings then return
		const settings = newChannel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELDELETE log
		const regEx = /^🟢｜ticket([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?$/i;
		if (regEx.test(name)) return;

		// CHECK A COR E DEFINE A COR DEFAULT
		let color = logDB.ServerEvents.EmbedColor;
		if (color == "#000000") color = 16086051;

		// Check if event channelDelete is for logging
		if (logDB.ServerEvents.ChannelUpdateToggle == true && logDB.ServerEvents.Toggle == true) {
			let embed, updated = false;

			// Channel name change
			if (oldChannel.name != newChannel.name) {
				embed = new Embed(bot, newChannel.guild)
					.setDescription(`**${inf[type]} __${oldChannel.name}__ ${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE2')}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE3')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields(
						{ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE4')}`, value: `${oldChannel.name}`, inline: true },
						{ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE5')}`, value: `${newChannel.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// channel topic (description) change
			if (oldChannel.topic != newChannel.topic) {
				embed = new Embed(bot, newChannel.guild)
					.setDescription(`**${inf[type]}  __${oldChannel.name}__ ${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE6')}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE7')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields(
						{ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE8')}`, value: `${oldChannel.topic ?? newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE10')}`, inline: true },
						{ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE9')}`, value: `${newChannel.topic ?? newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE10')}`, inline: true })
					.setTimestamp();
				updated = true;
			}

			if (oldChannel.rtcRegion != newChannel.rtcRegion) {
				embed = new Embed(bot, newChannel.guild)
					.setDescription(`**${inf[type]}  __${oldChannel.name}__ ${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE17')}**`)
					//.setDescription(`**${newChannel.type === 'category' ? 'Category' : 'Channel'} region changed of ${newChannel.toString()}**`)
					.setColor(color)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE16'), iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.addFields(
						{ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE8')}`, value: `${oldChannel.rtcRegion}`, inline: true },
						{ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE9')}`, value: `${newChannel.rtcRegion}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// Check for permission change
			const permDiff = oldChannel.permissionOverwrites.cache.filter(x => {
				if (newChannel.permissionOverwrites.cache.find(y => y.allow.bitfield == x.allow.bitfield) && newChannel.permissionOverwrites.cache.find(y => y.deny.bitfield == x.deny.bitfield)) {
					return false;
				}
				return true;
			}).concat(newChannel.permissionOverwrites.cache.filter(x => {
				if (oldChannel.permissionOverwrites.cache.find(y => y.allow.bitfield == x.allow.bitfield) && oldChannel.permissionOverwrites.cache.find(y => y.deny.bitfield == x.deny.bitfield)) {
					return false;
				}
				return true;
			}));

			if (permDiff.size) {
				embed = new Embed(bot, newChannel.guild)
					.setDescription(`**${inf[type]}  __${oldChannel.name}__ ${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE11')}`)
					.setColor(color)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE12')}`, iconURL: `https://media.giphy.com/media/3kIkf9hTaie4ieG9D0/giphy.gif` })
					.setTimestamp();
				for (const permID of permDiff.keys()) {
					// load both overwrites into variables
					const oldPerm = oldChannel.permissionOverwrites.cache.get(permID) || {};
					const newPerm = newChannel.permissionOverwrites.cache.get(permID) || {};
					const oldBitfields = {
						allowed: oldPerm.allow ? oldPerm.allow.bitfield : 0,
						denied: oldPerm.deny ? oldPerm.deny.bitfield : 0,
					};
					const newBitfields = {
						allowed: newPerm.allow ? newPerm.allow.bitfield : 0,
						denied: newPerm.deny ? newPerm.deny.bitfield : 0,
					};
					// load roles / guildmember for that overwrite
					let role;
					let member;
					if (oldPerm.type === 0 || newPerm.type === 0) {
						role = newChannel.guild.roles.cache.get(newPerm.id || oldPerm.id);
					}
					if (oldPerm.type === 1 || newPerm.type === 1) {
						member = await newChannel.guild.members.fetch(newPerm.id || oldPerm.id);
					}
					// make text about what changed
					let value = '';
					if (oldBitfields.allowed !== newBitfields.allowed) {
						value += `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE13')} \`${oldBitfields.allowed}\` ➔ \`${newBitfields.allowed}\`\n`;
					}
					if (oldBitfields.denied !== newBitfields.denied) {
						value += `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE14')} \`${oldBitfields.denied}\` ➔ \`${newBitfields.denied}\``;
					}
					if (!value.length) value = `${newChannel.guild.translate('Events/channelUpdate:CHANNEL_UPDATE15')}`;

					// add field to embed
					embed.addFields({
						'name': role ? role.name + ` (ID: ${role.id}):` : member?.user.username + ` (ID: ${member?.id}):`,
						'value': value,
					});
				}
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => { });
					if (modChannel && modChannel.guild.id == newChannel.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${newChannel.guild.name} [${newChannel.guild.id}]: ${err.message}.`);
				}
			}
		}
	}
};
