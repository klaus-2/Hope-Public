// Dependências
const Command = require('../../structures/Command.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ticketFunçõesSchema } = require('../../database/models');

module.exports = class TDelete extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tdelete',
			dirname: __dirname,
			aliases: ['t-deletar', 'ticket-delete', 't-delete', 'ticket-deletar'],
			userPermissions: [Flags.ManageChannels],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Delete a ticket',
			usage: '<prefix><commandName>',
			examples: [
				'/ticket delete',
				'.tdelete',
				'!ticket-delete',
				'?t-delete',
			],
			cooldown: 3000,
			slash: false,
			slashSite: true,
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		const ticketDeletar = await ticketFunçõesSchema.findOne({
			channelID: message.channel.id,
			guildID: message.guild.id,
		});

		if (!ticketDeletar) return message.channel.error(`Uh-oh! This command does not work on normal channels. Please try again by running this command on a ticket channel.\n**Tip**: Ticket channels start with \`🟢｜ticket-\``).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });

		// VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
		let serverCase = ticketDeletar.ticketCase;
		if (!serverCase || serverCase === null) serverCase = '1';
		let chann;
		let id = ticketDeletar.authorID.toString().substr(0, 4) + ticketDeletar.discriminator;
		if (ticketDeletar.ticketNameType == 1) {
			chann = `${id}`;
		} else if (ticketDeletar.ticketNameType == 2) {
			chann = `${serverCase}`;
		}

		const user = message.author.id;

		if (message.guild.members.cache.find((membro) => membro.id === user).permissions.has(Flags.ManageChannels)) {
			await ticketFunçõesSchema.findOneAndRemove({ messageID: ticketDeletar.msgID, channelID: message.channel.id, guildID: message.guild.id });
			message.channel.send(bot.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD9'));
			setTimeout(() => message.channel.delete(), 5000);
			const voice = message.guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`);
			if (voice) {
				setTimeout(() => message.guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`).delete(), 5000);
			}
		}
	}
	// EXEC - SLASH
	async callback(bot, interaction, guild, { settings }) {
		const member = interaction.user,
			channel = guild.channels.cache.get(interaction.channelId);

		const ticketDeletar = await ticketFunçõesSchema.findOne({
			channelID: channel.id,
			guildID: guild.id,
		});

		if (!ticketDeletar) return interaction.reply({ embeds: [channel.error(`Uh-oh! This command does not work on normal channels. Please try again by running this command on a ticket channel.\n**Tip**: Ticket channels start with \`:green_circle:｜ticket-\``, {}, true)], ephemeral: true });

		// VERIFICAR TODOS CANAIS COMPARANDO OS METODOS ID/COUNT
		let serverCase = ticketDeletar.ticketCase;
		if (!serverCase || serverCase === null) serverCase = '1';
		let chann;
		let id = ticketDeletar.authorID.toString().substr(0, 4) + ticketDeletar.discriminator;
		if (ticketDeletar.ticketNameType == 1) {
			chann = `${id}`;
		} else if (ticketDeletar.ticketNameType == 2) {
			chann = `${serverCase}`;
		}

		const user = member.id;

		if (guild.members.cache.find((membro) => membro.id === user).permissions.has(Flags.ManageChannels)) {
			await ticketFunçõesSchema.findOneAndRemove({ messageID: ticketDeletar.msgID, channelID: channel.id, guildID: guild.id });
			interaction.reply(bot.translate('Events/messageReactionAdd:MESSAGE_REACTION_ADD9'));
			setTimeout(() => channel.delete(), 5000);
			const voice = guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`);
			if (voice) {
				setTimeout(() => guild.channels.cache.find(canal => canal.name === `🟠｜voice-${chann}`).delete(), 5000);
			}
		}
	}
};