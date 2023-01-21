// Dependências
const fetch = require('node-fetch'),
	q = require("querystring"),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Docs extends Command {
	constructor(bot) {
		super(bot, {
			name: 'docs',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Exibe a documentação do Discord.js.',
			usage: 'docs <consulta>',
			cooldown: 3000,
			examples: ['docs channel#create'],
			slash: false,
			options: [{
				name: 'input',
				description: 'Search in the discordjs docs',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			}],
		});
	}

	// EXEC - PREFIX
	async run(bot, message) {
		try {
			let src = "master";
			let arg = message.args.join(" ");

			let query = q.stringify({ src: src, q: arg });

			const dio = await fetch(`https://djsdocs.sorta.moe/v2/embed?${query}`);
			const embed = await dio.json();

			if (embed) {
				message.channel.send({ embeds: [embed] });
			} else {
				message.channel.send("> Couldn't find docs related to it");
			};

		} catch (r) {
			console.log(r)
			message.channel.send(r.message);
		};
	}
	
	// EXEC - SLASH
	async callback(bot, interaction) {
		interaction.reply({ content: 'This is currently unavailable.' });
	}
};
