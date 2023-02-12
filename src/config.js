const config = {
	ownerID: [''],
	ownerName: '',
	client_id: "",
	secret: "",
	token: '',
	disabledCommands: [],
	disabledFeatures: [],
	websiteURL: '',
	Botlist: {
		Topgg: '',
		Voidbots: '',
		DiscordBotList: '',
	},
	VoteChannel: {
		Topgg: '',
		Voidbots: '',
		DiscordBotList: '',
	},
	SupportServer: {
		link: '',
		GuildID: '',
		GuildChannel: '',
		DefaultInvite: '',
		RecommendedInvite: '',
		FullPermissions: '',
		NoModerator: '',
		BasicPermissions: '',
	},
	// URL to mongodb
	MongoDBURL: '',
	rateLimitChannelID: '',
	embedColor: '',
	WebHooks: [
		{ ID: '', TOKEN: '' },
		{ ID: '', TOKEN: '' },
		{ ID: '', TOKEN: '' },
		{ ID: '', TOKEN: '' },
		{ ID: '', TOKEN: '' },
		{ ID: '', TOKEN: '' },
		{ ID: '', TOKEN: '' },
	],
	debug: false,
};

module.exports = config;