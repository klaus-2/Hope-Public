// Dependências
const { define } = require('urban-dictionary'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	{ Embed } = require(`../../utils`),
	Command = require('../../structures/Command.js');

module.exports = class Urban extends Command {
	constructor(bot) {
		super(bot, {
			name: 'urban',
			dirname: __dirname,
			nsfw: true,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get the definition of a word from the urban dictionary.',
			usage: '<prefix><commandName> <word>',
			cooldown: 5000,
			examples: [
				'.urban watermelon sugar',
				'!urban nice drip'
			],
			slash: false,
			options: [{
				name: 'phrase',
				description: 'Phrase to look up.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// Get phrase
		const phrase = message.args.join(' ');
		if (!phrase) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Fun/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Fun/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}

		const phrasee = () => {
			const p = [
				message.translate('misc:BUSCAR_DADOS'),
				message.translate('misc:BUSCAR_DADOS1'),
				message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
			];
			return p[Math.floor(Math.random() * p.length)];
		};

		const msg = await message.channel.send(phrasee());

		// Search up phrase in urban dictionary
		define(`${phrase}`, (err, entries) => {
			// send message
			const embed = new Embed(bot, message.guild)
				.setTitle('Fun/urban:URBAN_TITLE', { word: phrase })
				.setURL(entries[0].permalink)
				.setColor(16279836)
				.setThumbnail('https://i.imgur.com/VFXr0ID.jpg')
				.setDescription(message.translate('Fun/urban:URBAN_DESCRIPTION', { definition: entries[0].definition, examples: entries[0].example }))
				.addFields(
					{ name: '👍', value: `${entries[0].thumbs_up}`, inline: true },
					{ name: '👎', value: `${entries[0].thumbs_down}`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
			msg.delete();
			message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
		});
	}
};
