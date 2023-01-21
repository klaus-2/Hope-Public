const { ChannelType } = require('discord-api-types/v10');

module.exports = {
	/* checkMusic: function (member, bot) {
		// Check that a song is being played
		const player = bot.manager?.players.get(member.guild.id);
		if (!player) return member.guild.translate('misc:NO_QUEUE');

		// Check that user is in the same voice channel
		if (member.voice?.channel?.id !== player.voiceChannel) return member.guild.translate('misc:NOT_VOICE');

		// Check if the member has role to interact with music plugin
		if (member.guild.roles.cache.get(member.guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(member.guild.settings.MusicDJRole)) {
				return member.guild.translate('misc:MISSING_ROLE');
			}
		}
		return true;
	}, */
	checkNSFW: function (channel) {
		return channel.nsfw || channel.type == ChannelType.DM;
	},
	genInviteLink: function (bot) {
		return bot.generateInvite({
			permissions: BigInt(1073081686),
			scopes: ['bot', 'applications.commands']
		});
	},
	CalcLevenDist: function (str1 = '', str2 = '') {
		const track = Array(str2.length + 1).fill(null).map(() =>
			Array(str1.length + 1).fill(null));
		for (let i = 0; i <= str1.length; i += 1) {
			track[0][i] = i;
		}
		for (let j = 0; j <= str2.length; j += 1) {
			track[j][0] = j;
		}
		for (let j = 1; j <= str2.length; j += 1) {
			for (let i = 1; i <= str1.length; i += 1) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				track[j][i] = Math.min(
					track[j][i - 1] + 1,
					track[j - 1][i] + 1,
					track[j - 1][i - 1] + indicator,
				);
			}
		}
		return track[str2.length][str1.length];
	},
	getdate: function () {
		const date = new Date(),
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			year = date.getFullYear(),
			month = months[date.getMonth()],
			getdate = date.getDate();
		return `${getdate} ${month} ${year}`;
	},
	convertMilliseconds: function (ms) {
		const seconds = ~~(ms / 1000)
		const minutes = ~~(seconds / 60)
		const hours = ~~(minutes / 60)
		const days = ~~(hours / 24)

		return { days, hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 }
	},
	formatTime: function (time, format = 'dd:hh:mm:ss') {
		const formats = { dd: 'days', hh: 'hours', mm: 'minutes', ss: 'seconds' }

		const newFormat = format
			.replace(/dd|hh|mm|ss/g, match => time[formats[match]].toString().padStart(2, '0'))
			.replace(/^(00:)+/g, '')

		return newFormat.length > 2 ? newFormat : '00:' + newFormat
	},
	autoFormatTime: function (time) {
		return Object.entries(time)
			.filter(e => e[1])
			.map(e => ([e[0].slice(0, -1).padEnd(e[1] > 1 ? e[0].length : 0, 's'), e[1]]))
			.map((e, i, a) => (i === a.length - 1 && a.length > 1) ? `and ${e[1]} ${e[0]}` : (i === a.length - 2 || a.length === 1) ? `${e[1]} ${e[0]}` : `${e[1]} ${e[0]},`)
			.join(' ')
			|| '0 seconds'
	},
};