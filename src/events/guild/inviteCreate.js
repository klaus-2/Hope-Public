// Dependencies
const { Embed } = require('../../utils'),
	{ loggingSystem } = require('../../database/models'),
	moment = require('moment'),
	Event = require('../../structures/Event');

module.exports = class inviteCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// Exec event
	async run(bot, invite) {
		// SE CONECTA NA DB DE LOGS
		let logDB = await loggingSystem.findOne({ _id: invite.guild.id });
		if (!logDB) {
			const newSettings = new loggingSystem({
				_id: invite.guild.id
			});
			await newSettings.save().catch(() => { });
			logDB = await loggingSystem.findOne({ _id: invite.guild.id });
		}

		// Get server settings / if no settings then return
		const settings = invite.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (logDB.ServerEvents.InviteToggle == true && logDB.ServerEvents.Toggle == true) {
			// CHECK A COR E DEFINE A COR DEFAULT
			let color = logDB.ServerEvents.EmbedColor;
			if (color == "#000000") color = 3066993;

			const embed = new Embed(bot, invite.guild)
				.setDescription([
					`${invite.guild.translate('Events/inviteCreate:INVITE')} ${invite.channel ? `${invite.guild.translate('Events/inviteCreate:INVITE1')} ${invite.channel}` : ''}`,
					`${invite.guild.translate('Events/inviteCreate:INVITE2')} \`${invite.code}\`.`,
					`${invite.guild.translate('Events/inviteCreate:INVITE3')} \`${invite.maxUses}\`.`,
					`${invite.guild.translate('Events/inviteCreate:INVITE4')} \`${invite.maxAge != 0 ? moment(new Date() + invite.maxAge).format('llll') : invite.guild.translate('Events/inviteCreate:INVITE5')}\`.`,
					`${invite.guild.translate('Events/inviteCreate:INVITE6')} \`${invite.temporary}\``,
				].join('\n'))
				.setColor(color)
				.setFooter({ text: `${invite.guild.translate('Events/inviteCreate:INVITE7')} ${invite?.inviter.id}` })
				.setAuthor({ name: `${invite.guild.translate('Events/inviteCreate:INVITE8')}`, iconURL: `${invite.inviter.displayAvatarURL()}` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(logDB.ServerEvents.LogChannel).catch(() => {
					// do nothing.
				});
				if (modChannel && modChannel.guild.id == invite.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Evento: '${this.conf.name}' ocorreu um error no servidor ${invite.guild.name} [${invite.guild.id}]: ${err.message}.`);
			}
		}
	}
};
