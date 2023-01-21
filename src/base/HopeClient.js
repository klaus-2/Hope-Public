// Dependencies
const { ActivityType, Client, Collection, GatewayIntentBits: FLAGS, Partials, PermissionsBitField: { Flags: PermissionFlag } } = require('discord.js'),
	{ GuildSchema } = require('../database/models'),
	GiveawaysManager = require('./Manager'),
	path = require('path'),
	{ promisify } = require('util'),
	readdir = promisify(require('fs').readdir);

// Hope Client
module.exports = class Hope extends Client {
	constructor() {
		super({
			partials: [Partials.GuildMember, Partials.User, Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildScheduledEvent],
			intents: [FLAGS.Guilds, FLAGS.GuildMembers, FLAGS.GuildBans, FLAGS.GuildEmojisAndStickers,
			FLAGS.GuildMessages, FLAGS.GuildMessageReactions, FLAGS.DirectMessages, FLAGS.GuildVoiceStates, FLAGS.GuildInvites,
			FLAGS.GuildScheduledEvents, FLAGS.MessageContent],
			presence: {
				status: 'online',
				activities: [{
					name: 'hopebot.top',
					type: ActivityType.Listening,
					url: null,
				}],
			},
		});

		// Logger File
		this.logger = require('../utils/Logger');

		// Basic Giveaway Manager (WIP)
		this.giveawaysManager = new GiveawaysManager(this, {
			storage: false,
			forceUpdateEvery: 15000,
			endedGiveawaysLifetime: 604800000,
			default: {
				embedColor: 12118406,
				reaction: '823004188292022303', // 823004188292022303
				lastChance: {
					enabled: true,
					content: '⚠️ **LAST CHANCE TO ENTER !** ⚠️',
					threshold: 5000,
					embedColor: '#FF0000',
				},
				pauseOptions: {
					isPaused: false,
					content: '⚠️ **THIS GIVEAWAY IS PAUSED !** ⚠️',
					embedColor: '#FFFF00',
					infiniteDurationText: '`Never`',
				},
			},
		});

		// Command Data
		this.aliases = new Collection();
		this.commands = new Collection();
		this.interactions = new Collection();
		this.cooldowns = new Collection();
		this.requests = {};

		// Database file
		this.mongoose = require('../database/mongoose');

		// Config file
		this.config = require('../config.js');

		// Basic stats for the bot (WIP)
		this.messagesSent = 0;
		this.commandsUsed = 0;

		// The array of adult sites for blocking on non-nsfw channels
		this.adultSiteList = [];

		// The collection of embeds for the webhook manager. (Stops API abuse)
		this.embedCollection = new Collection();

		// Custom emojis (WIP)
		this.customEmojis = require(`${process.cwd()}/assets/json/emojis.json`);

		// Bot langs
		this.languages = require('../languages/language-meta.json');

		// Function for waiting (acts like a pause)
		this.delay = ms => new Promise(res => setTimeout(res, ms));
	}

	// Function for deleting guilds settings from database
	async DeleteGuild(guild) {
		try {
			await GuildSchema.findOneAndRemove({ guildID: guild.id });
			return true;
		} catch (err) {
			if (this.config.debug) this.logger.debug(err.message);
			return false;
		}
	}

	// Executes a function once and then loops it
	loop(fn, delay, ...param) {
		fn();
		return setInterval(fn, delay, ...param);
	};

	// Function for loading commands to the bot
	loadCommand(commandPath, commandName) {
		const cmd = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
		this.logger.log(`Loading Command: ${cmd.help.name}.`);
		cmd.conf.location = commandPath;
		this.commands.set(cmd.help.name, cmd);
		cmd.help.aliases.forEach((alias) => {
			this.aliases.set(alias, cmd.help.name);
		});
	}

	// Function for fetching slash command data
	async loadInteractionGroup(category) {
		try {
			const commands = (await readdir('./src/commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
			const arr = [];
			for (const cmd of commands) {
				if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
					const command = new (require(`../commands/${category}${path.sep}${cmd}`))(this);
					if (command.conf.slash) {
						const item = {
							name: command.help.name,
							description: command.help.description,
							defaultMemberPermissions: command.conf.userPermissions.length >= 1 ? command.conf.userPermissions : PermissionFlag.SendMessages,
						};
						if (command.conf.options[0]) item.options = command.conf.options;
						arr.push(item);
					}
				}
			}
			return arr;
		} catch (err) {
			console.log(err);
			return `Unable to load category ${category}: ${err}`;
		}
	}

	// Function for deleting slash command category from guild
	async deleteInteractionGroup(category, guild) {
		try {
			const commands = (await readdir('./src/commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
			const arr = [];
			commands.forEach((cmd) => {
				if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
					const command = new (require(`../commands/${category}${path.sep}${cmd}`))(this);
					if (command.conf.slash) {
						arr.push({
							name: command.help.name,
							description: command.help.description,
							options: command.conf.options,
							defaultPermission: command.conf.defaultPermission,
						});
						guild.interactions.delete(command.help.name, command);
					}
				}
			});
			return arr;
		} catch (err) {
			return `Unable to load category ${category}: ${err}`;
		}
	}

	// Function for unloading commands to the bot
	async unloadCommand(commandPath, commandName) {
		let command;
		if (this.commands.has(commandName)) {
			command = this.commands.get(commandName);
		} else if (this.aliases.has(commandName)) {
			command = this.commands.get(this.aliases.get(commandName));
		}
		if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return false;
	}

	// Function adult sites for blocking on non-nsfw channels
	async fetchAdultSiteList() {
		const blockedWebsites = require(`${process.cwd()}/assets/json/whitelistWebsiteList.json`);
		this.adultSiteList = blockedWebsites.websites;
		return this.adultSiteList;
	}

	// Function for getting translations
	translate(key, args, locale) {
		if (!locale) locale = require(`${process.cwd()}/assets/json/defaultGuildSettings.json`).Language;
		const language = this.translations.get(locale);
		if (!language) return 'Invalid language set in data.';
		return language(key, args);
	}

	// Function for adding embeds to the webhook manager (Stops API abuse)
	addEmbed(channelID, embed) {
		// collect embeds
		if (!this.embedCollection.has(channelID)) {
			this.embedCollection.set(channelID, [embed]);
		} else {
			this.embedCollection.set(channelID, [...this.embedCollection.get(channelID), embed]);
		}
	}

	// Creates and sends system failure embed (WIP)
	sendSystemErrorMessage(guild, error, errorMessage) {

		// Get system channel
		const systemChannelId = '1018839088218001458';
		const systemChannel = guild.channels.cache.get(systemChannelId);

		if ( // Check channel and permissions
			!systemChannel || !systemChannel.viewable || !systemChannel.permissionsFor(guild.me).has([Flags.SendMessages, Flags.EmbedLinks])) return;

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${this.user.tag}`, iconURL: this.user.displayAvatarURL({ format: 'png', dynamic: true })
			})
			.setTitle(`System Error: \`${error}\``)
			.setDescription(`\`\`\`diff\n- System Failure\n+ ${errorMessage}\`\`\``)
			.setTimestamp()
			.setColor('RANDOM');
		systemChannel.send({ embeds: [embed] });
	}
};
