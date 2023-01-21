const { Schema, model } = require('mongoose');

const guildSchema = Schema({
	guildID: String,
	guildName: String,
	prefix: { type: String, default: require(`${process.cwd()}/assets/json/defaultGuildSettings.json`).prefix },
	// System News
	updatesChannel: { type: String, default: null },
	// VANITY URL
	vanityURL: { type: String, default: null },
	vanityRedirect: { type: String, default: null },
	// 0 = no announcement, 1 = reply, 2 = choosen channel
	LevelOption: { type: Number, default: 0 },
	LevelChannel: { type: String, default: '00' },
	LevelMessage: { type: String, default: 'GG {user}, you have leveled up to {level}!' },
	LevelIgnoreRoles: { type: Array, default: ['No-xp'] },
	LevelIgnoreChannel: { type: Array, default: null },
	LevelMultiplier: { type: Number, default: 1 },
	LevelRoleRewards: { type: Array, default: null },
	// Music plugin
	MusicDJ: { type: Boolean, default: false },
	MusicDJRole: { type: String, default: null },
	// logging plugin
	ModLog: { type: Boolean, default: false },
	ModLogEvents: { type: Array, default: ['GUILDBANADD', 'GUILDMEMBERADD', 'CHANNELCREATE', 'CHANNELDELETE', 'CHANNELUPDATE', 'EMOJICREATE', 'EMOJIDELETE', 'EMOJIUPDATE', 'GUILDBANREMOVE', 'GUILDMEMBERREMOVE', 'GUILDMEMBERUPDATE', 'GUILDUPDATE', 'MESSAGEDELETE', 'MESSAGEDELETEBULK', 'MESSAGEUPDATE', 'ROLECREATE', 'ROLEDELETE', 'ROLEUPDATE', 'VOICESTATEUPDATE', 'REPORT', 'WARNING', 'TICKET'] },
	ModLogChannel: { type: String, default: '00' },
	ModLogIgnoreBot: { type: Boolean, default: true },
	ModLogIgnoreChannel: { type: Array, default: null },
	// CommandCooldown
	// Moderation plugin
	ModeratorRoles: { type: Array, default: null },
	// How many warnings till the user is kicked from server
	ModerationWarningCounter: { type: Number, default: 3 },
	// If moderation commands should be deleted after.
	ModerationClearToggle: { type: Boolean, default: true },
	ModerationClearReplyToggle: { type: Boolean, default: true },
	// If every bot's should be affected by auto-mod
	ModerationIgnoreBotToggle: { type: Boolean, default: true },
	// For ticket command
	TicketToggle: { type: Boolean, default: true },
	TicketSupportRole: { type: String, default: null },
	TicketCategory: { type: String, default: null },
	// Para Comando de Sugestão
	SugestãoToggle: { type: Boolean, default: true },
	SugestãoCanal: { type: String, default: '00' },
	// Para Comando de Rep
	ReputaçãoToggle: { type: String, default: true },
	// ADDON AUTO-NICK
	AutoNickToggle: { type: Boolean, default: false },
	AutoNickName: { type: String, default: 'CHANGE TO YOUR NAME' },
	// ADDON AUTO-MESSAGE
	AutoMessageToggle: { type: String, default: "false" },
	AutoMessage: { type: String, default: null },
	AutoMessageCount: { type: String, default: 20 },
	AutoMessageChannel: { type: String, default: 20 },
	// AUTO ANIMES
	AutoAnimes: { type: Boolean, default: false },
	AutoAnimesCanal: { type: String, default: '00' },
	// CORONA
	AutoCorona: { type: Boolean, default: false },
	CoronaCanal: { type: String, default: '00' },
	// ADDON VERIFY
	Verificar: { type: Boolean, default: false },
	VerificarCanal: { type: String, default: '00' },
	VerificarCargo: { type: String, default: '00' },
	VerificarOpção: { type: Number, default: 0 },
	// Auto-Mod Global Config | 0 = desativado, 1 = deleta a mensagem, 2 = aplica um aviso, 3 = ambos (1 & 2)
	Auto_ModOption: { type: String, default: 'kick' },
	Auto_ModTime: { type: String, default: '5m' },
	Auto_ModLogChannel: { type: String, default: null },
	Auto_ModWarningCounter: { type: Number, default: 3 },
	Auto_ModIgnoreChannel: { type: Array, default: null },
	Auto_ModIgnoreRole: { type: Array, default: null },
	Auto_ModIgnoreUser: { type: Array, default: null },
	// Auto-ModBadwords
	Auto_ModBadwords: { type: String, default: '0' },
	Auto_ModBadwordsTime: { type: String, default: '3m' },
	Auto_ModBadwordsList: { type: Array, default: null },
	Auto_ModBadwordsChannels: { type: Array, default: null },
	Auto_ModBadwordsRole: { type: Array, default: null },
	Auto_ModBadwordsUser: { type: Array, default: null },
	// Auto-ModAntiInvite
	Auto_ModAntiInvite: { type: String, default: '0' },
	Auto_ModAntiInviteTime: { type: String, default: '3m' },
	Auto_ModAntiInviteChannels: { type: Array, default: null },
	Auto_ModAntiInviteRole: { type: Array, default: null },
	Auto_ModAntiInviteUser: { type: Array, default: null },
	// Auto-ModAntiExternalLinks
	Auto_ModAntiExternalLinks: { type: String, default: '0' },
	Auto_ModAntiExternalLinksTime: { type: String, default: '3m' },
	Auto_ModAntiExternalLinksChannels: { type: Array, default: null },
	Auto_ModAntiExternalLinksRole: { type: Array, default: null },
	Auto_ModAntiExternalLinksUser: { type: Array, default: null },
	Auto_ModAntiExternalLinksAllowed: { type: Array, default: null },
	// Auto-ModAntiCaps
	Auto_ModAntiCaps: { type: String, default: '0' },
	Auto_ModAntiCapsTime: { type: String, default: '3m' },
	Auto_ModAntiCapsLimit: { type: String, default: '2' },
	Auto_ModAntiCapsChannels: { type: Array, default: null },
	Auto_ModAntiCapsRole: { type: Array, default: null },
	Auto_ModAntiCapsUser: { type: Array, default: null },
	// Auto-ModAntiMassMentions
	Auto_ModAntiMassMentions: { type: String, default: '0' },
	Auto_ModAntiMassMentionsTime: { type: String, default: '3m' },
	Auto_ModAntiMassMentionsLimit: { type: String, default: '2' },
	Auto_ModAntiMassMentionsChannels: { type: Array, default: null },
	Auto_ModAntiMassMentionsRole: { type: Array, default: null },
	Auto_ModAntiMassMentionsUser: { type: Array, default: null },
	// Auto-ModAntiMassLines
	Auto_ModAntiMassLines: { type: String, default: '0' },
	Auto_ModAntiMassLinesTime: { type: String, default: '3m' },
	Auto_ModAntiMassLinesLimit: { type: String, default: '3' },
	Auto_ModAntiMassLinesChannels: { type: Array, default: null },
	Auto_ModAntiMassLinesRole: { type: Array, default: null },
	Auto_ModAntiMassLinesUser: { type: Array, default: null },
	// Auto-ModAntiEveryone
	Auto_ModAntiEveryone: { type: String, default: '0' },
	Auto_ModAntiEveryoneTime: { type: String, default: '3m' },
	Auto_ModAntiEveryoneChannels: { type: Array, default: null },
	Auto_ModAntiEveryoneRole: { type: Array, default: null },
	Auto_ModAntiEveryoneUser: { type: Array, default: null },
	// Auto-ModAntiNsfw
	Auto_ModAntiNsfw: { type: String, default: '0' },
	Auto_ModAntiNsfwTime: { type: String, default: '3m' },
	Auto_ModAntiNsfwChannels: { type: Array, default: null },
	Auto_ModAntiNsfwRole: { type: Array, default: null },
	Auto_ModAntiNsfwUser: { type: Array, default: null },
	// Auto-ModAntiSpam
	Auto_ModAntiSpam: { type: String, default: '0' },
	Auto_ModAntiSpamTime: { type: String, default: '3m' },
	Auto_ModAntiSpamChannels: { type: Array, default: null },
	Auto_ModAntiSpamRole: { type: Array, default: null },
	Auto_ModAntiSpamUser: { type: Array, default: null },
	// Auto-ModAntiAlt
	Auto_ModAntiAlt: { type: Boolean, default: false }, // true ou false, ativa ou desativa
	Auto_ModAntiAltAllowed: { type: Array, default: null }, // Whitelist um usuario para passar pelo filtro do Alt
	Auto_ModAntiAltLimit: { type: String, default: '2' }, // Limite em dias para data da criação da conta
	Auto_ModAntiAltAction: { type: String, default: 'kick' }, // kick ou ban - ação de punição se detectar
	// Auto-ModAntiMassEmojis
	Auto_ModAntiMassEmojis: { type: String, default: '0' },
	Auto_ModAntiMassEmojisTime: { type: String, default: '3m' },
	Auto_ModAntiMassEmojisLimit: { type: String, default: '3' },
	Auto_ModAntiMassEmojisChannels: { type: Array, default: null },
	Auto_ModAntiMassEmojisRole: { type: Array, default: null },
	Auto_ModAntiMassEmojisUser: { type: Array, default: null },
	// Auto-ModAntiMassSpoilers
	Auto_ModAntiMassSpoilers: { type: String, default: '0' },
	Auto_ModAntiMassSpoilersTime: { type: String, default: '3m' },
	Auto_ModAntiMassSpoilersLimit: { type: String, default: '2' },
	Auto_ModAntiMassSpoilersChannels: { type: Array, default: null },
	Auto_ModAntiMassSpoilersRole: { type: Array, default: null },
	Auto_ModAntiMassSpoilersUser: { type: Array, default: null },
	// Auto-ModAntiDehoisting
	Auto_ModAntiDehoisting: { type: Boolean, default: false }, // true ou false, ativa ou desativa
	// Auto-ModAntiZAlgo
	Auto_ModAntiZAlgo: { type: String, default: '0' },
	Auto_ModAntiZAlgoTime: { type: String, default: '3m' },
	Auto_ModAntiZAlgoChannels: { type: Array, default: null },
	Auto_ModAntiZAlgoRole: { type: Array, default: null },
	Auto_ModAntiZAlgoUser: { type: Array, default: null },
	// MISC
	DisabledCommands: { type: Array, default: ['test'] },
	isPremium: { type: Boolean, default: false },
	premium:
	{
		redeemedBy: {
			id: { type: String, default: null },
			tag: { type: String, default: null },
		},
		redeemedAt: { type: String, default: null },
		expiresAt: { type: String, default: null },
		plan: { type: String, default: null },
		code: { type: String, default: null },
	},
	// language
	Language: { type: String, default: 'en-US' },
	plugins: { type: Array, default: ['Animes', 'Actions', 'Fun', 'Giveaway', 'Guild', 'Image', 'Misc', 'Moderation', 'Addons', 'Ticket', 'Games', 'Host'] },
	version: { type: Number, default: '1.1' },
	//DASHBOARD
	logChannelID: { type: String, default: null },
	modlogcolor: { type: String, default: "#000000" },
	report: {
		reportChannelID: { type: String, default: null },
		reportcolor: { type: String, default: "#000000" },
		disableUser: { type: String, default: false },
		disableIssue: { type: String, default: false },
		upvote: { type: String, default: false },
		reaction: { type: String, default: `1` },
		reportCase: { type: Number, default: '1' },
	},
	autoroleID: { type: Array, default: null },
	autoroleToggle: { type: Boolean, default: false },
});

module.exports = model('Guild', guildSchema);