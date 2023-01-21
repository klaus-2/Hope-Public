const { votesCheck } = require('../../database/models/index');
const Discord = require('discord.js');
//const webhookVote = new WebhookClient({ id: 'hookID', token: 'hookTOKEN' });
const ms = require('ms')
const math = require("mathjs");

module.exports.run = async (bot, message, settings) => {

	/** ------------------------------------------------------------------------------------------------
	* VOTE WEBWOOK
	* ------------------------------------------------------------------------------------------------ */
	//const wlchannels = ['859283392536510474', '859283392536510475', '860159363347120188']
	//const channel = message.guild.channels.cache.get(wl)
	const argss = message.content.split(' ').shift();
	//const user = message.content.match(/<@!?(\d{17,19})>/g, "", argss[4])
	const week = message.content.slice(1).match(/true/g, "", argss[4])

	let userr = await bot.users.fetch(argss);

	let userV = await votesCheck.findOne({
		_id: userr.id
	});

	if (!userV) {
		await votesCheck.create({
			_id: userr.id,
			totalVotes: 0,
			topgg: 0,
			vdb: 0,
			dbl: 0,
			lastVote: 0
		});

		userV = await votesCheck.findOne({
			_id: userr.id
		});

	};

	const vote_number = userV.totalVotes + 1 || 1;
	//const streak_number = math.evaluate(`${userV.votes_Streaks} + 1`);

	//VERIFICA SE O VOTO É SEMANAL ( EM DOBRO )
	let weekly

	if (week) weekly = true;

	//console.log(weekly)

	const privado = bot.users.cache.get(userr.id)

	const embed = new Discord.MessageEmbed()
		.setColor(5301186)
		.setFooter({ text: "Your premium status is already active and counting." })
		.setAuthor({ name: 'Thank you for your vote!', iconURL: bot.user.displayAvatarURL() })

	if (message.channel.id == "867106710179151923") {

		embed.setDescription(`Yayy! Thank you for your vote in [Top.gg](https://top.gg/bot/901243176814276680) <:Skyeawnnnt:823046654764515338>\nOhh... this was a very beautiful attitude on your part, I think you deserve a reward....\n\nhmmm. ok, I'll give you **12 hours** to enjoy all my **PREMIUM** features.\nThat's it, you deserve it! Enjoy <:SkyeComemorando:823248929503445026>`)

		privado.send({ embeds: [embed] })

		return await userV.updateOne({
			totalVotes: vote_number,
			topgg: Date.now(),
			lastVote: Date.now(),
			//votes_Streaks: streak_number
		});
	} else if (message.channel.id == "880154880235433994") {

		embed.setDescription(`Yayy! Thank you for your vote in [Void Bots](https://voidbots.net/bot/901243176814276680) <:Skyeawnnnt:823046654764515338>\nOhh... this was a very beautiful attitude on your part, I think you deserve a reward....\n\nhmmm. ok, I'll give you **12 hours** to enjoy all my **PREMIUM** features.\nThat's it, you deserve it! Enjoy <:SkyeComemorando:823248929503445026>`)

		privado.send({ embeds: [embed] })

		return await userV.updateOne({
			totalVotes: vote_number,
			vdb: Date.now(),
			lastVote: Date.now(),
			//votes_Streaks: streak_number
		});
	} else if (message.channel.id == "880150360969318470") {

		embed.setDescription(`Yayy! Thank you for your vote in [Discord Bot List](https://discordbotlist.com/bots/Hope-5284) <:Skyeawnnnt:823046654764515338>\nOhh... this was a very beautiful attitude on your part, I think you deserve a reward....\n\nhmmm. ok, I'll give you **12 hours** to enjoy all my **PREMIUM** features.\nThat's it, you deserve it! Enjoy <:SkyeComemorando:823248929503445026>`)

		privado.send({ embeds: [embed] })

		return await userV.updateOne({
			totalVotes: vote_number,
			dbl: Date.now(),
			lastVote: Date.now(),
			//votes_Streaks: streak_number
		});
	};

	/** ------------------------------------------------------------------------------------------------
	* CERTIFICA DE QUE APENAS UM USUARIO QUE DEVA SER PUNIDO, SEJA PUNIDO!
	* ------------------------------------------------------------------------------------------------ */
	return true;
};
