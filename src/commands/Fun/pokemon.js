// Dependências
const { Embed } = require(`../../utils`),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Pokemon extends Command {
	constructor(bot) {
		super(bot, {
			name: 'pokemon',
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Get information about a Pokemon.',
			usage: '<prefix><commandName> <pokemon name>',
			cooldown: 5000,
			examples: [
				'.pokemon',
				'.pokemon charizard'
			],
			slash: false,
			options: [{
				name: 'pokemon',
				// nameLocalized: 'en-US',
				// nameLocalizations: bot.languages.map(({ name }) => ({ [name]: bot.translate(`${this.help.category.toLowerCase()}/${this.help.name}:USAGE`, {}, name) }), bot.commands.get('pokemon')),
				description: 'The specified pokemon to gather information on.',
				// descriptionLocalized: 'en-Us',
				// descriptionLocalizations:bot.languages.map(({ name }) => ({ [name]: bot.translate(`${this.help.category.toLowerCase()}/${this.help.name}:USAGE`, {}, name) }), bot.commands.get('pokemon')),
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();
		// Pega o nome do pokemon pelo args
		const pokemon = message.args.join(' ');

		if (!pokemon) {
			return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Fun/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Fun/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
		}

		const phrase = () => {
			const p = [
				message.translate('misc:BUSCAR_DADOS'),
				message.translate('misc:BUSCAR_DADOS1'),
				message.translate('misc:BUSCAR_DADOS2', { prefix: settings.prefix }),
			];
			return p[Math.floor(Math.random() * p.length)];
		};

		const msg = await message.channel.send(phrase());

		// Procura pelo pokemon
		const res = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${message.args.join(' ')}`)
			.then((info) => info.json())
			.catch((err) => {
				// Se acontecer algum problema
				bot.logger.error(`Comando: '${this.help.name}' ocorreu um error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { err: err.message }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
			});
		msg.delete();

		// Envia o resultado da pesquisa
		const embed = new Embed(bot, message.guild)
			.setAuthor({ name: res.name, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.typeIcon}` })
			.setDescription(`${message.translate('Fun/pokemon:FPOKE_DESC')} **${res.info.type}**. ${res.info.description}`)
			.setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.photo}`)
			.setTimestamp()
			.setColor(16279836)
			.setFooter({ text: `${message.translate('Fun/pokemon:FPOKE_DESC1')} - ${res.info.weakness} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.weaknessIcon}` });
		message.channel.send({ embeds: [embed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
	}
	/**
   * Function for receiving interaction.
   * @param {bot} bot The instantiating client
   * @param {interaction} interaction The interaction that ran the command
   * @param {guild} guild The guild the interaction ran in
   * @param {args} args The options provided in the command, if any
   * @returns {embed}
*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			pokemon = args.get('pokemon').value;
		// Search for pokemon
		try {
			const res = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${pokemon}`).then(info => info.json());
			// Send response to channel
			const embed = new Embed(bot, guild)
				.setAuthor({ name: res.name, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.typeIcon}` })
				.setDescription(`${guild.translate('Fun/pokemon:FPOKE_DESC')} **${res.info.type}**. ${res.info.description}`)
				.setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.photo}`)
				.setFooter({ text: `${guild.translate('Fun/pokemon:FPOKE_DESC1')} - ${res.info.weakness} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Fun/${this.help.name}:USAGEE`)}`, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.weaknessIcon}` });
			return interaction.reply({ embeds: [embed] });
		} catch (err) {
			// An error occured when looking for account
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { err: err.message }, true)], ephemeral: true });
		}
	}
};
