// Dependencies
const Client = require('./base/HopeClient.js');
require('./structures');

const bot = new Client(),
	{ promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	path = require('path');

// Load commands
(async () => {
	// load commands
	await loadCommands();

	// load events
	await loadEvents();

	// load translations
	bot.translations = await require('./helpers/HopeLanguageManager')();

	// Connect bot to database
	bot.mongoose.init(bot);

	try {
		require('./features/Addons/sticky')(bot);
	} catch (e) {
		bot.logger.error(e);
	}

	try {
		require('./features/Addons/advanced-suggestions-en')(bot);
	} catch (e) {
		bot.logger.error(e);
	}

	try {
		require('./features/Addons/aniversario')(bot);
	} catch (e) {
		bot.logger.error(e);
	}

	// Connect bot to discord API
	const token = bot.config.token;
	bot.login(token).catch(e => bot.logger.error(e.message));
})();

// load commands
async function loadCommands() {
	const cmdFolders = (await readdir('./src/commands/')).filter((v, i, a) => a.indexOf(v) === i);
	bot.logger.log('-{ Loading command(s): 1 }-');
	// loop through each category
	cmdFolders.forEach(async (dir) => {
		if (bot.config.disabledFeatures.includes(dir) || dir == 'commandexample.js') return;
		const commands = (await readdir('./src/commands/' + dir + '/')).filter((v, i, a) => a.indexOf(v) === i);
		// loop through each command in the category
		commands.forEach((cmd) => {
			if (bot.config.disabledCommands.includes(cmd.replace('.js', ''))) return;
			try {
				bot.loadCommand('./commands/' + dir, cmd);
			} catch (err) {
				if (bot.config.debug) console.log(err);
				bot.logger.error(`Unable to load command ${cmd}: ${err}`);
			}
		});
	});
}

// load events
async function loadEvents() {
	const evtFolder = await readdir('./src/events/');
	bot.logger.log('-{ Loading events(s): 1 }-');
	evtFolder.forEach(async folder => {
		const folders = await readdir('./src/events/' + folder + '/');
		folders.forEach(async file => {
			delete require.cache[file];
			const { name } = path.parse(file);
			try {
				const event = new (require(`./events/${folder}/${file}`))(bot, name);
				bot.logger.log(`Loading Event: ${name}`);
				// Make sure the right manager gets the event
				if (event.conf.child) {
					bot[event.conf.child].on(name, (...args) => event.run(bot, ...args));
				} else {
					bot.on(name, (...args) => event.run(bot, ...args));
				}
			} catch (err) {
				bot.logger.error(`Failed to load Event: ${name} error: ${err.message}`);
			}
		});
	});
}

/**
 * Error Handler
 */
/*
API Errors or DiscordAPIErrors are thrown by the Discord API when an invalid request carries out. API Errors can be mostly diagnosed using the message that is given. You can further examine errors by inspecting the HTTP method and path used. We will explore tracking these errors down in the next section.
*/
process.on('unhandledRejection', error => {
	if (error?.stack?.split('\n').splice(0, 5)[0] === "TypeError: Cannot read properties of undefined (reading 'then')") return;
	bot.logger.warn(`[UNHANDLED REJECTION] - [API ERRORS]`);
	bot.logger.error(`${error.name} [\`unhandledRejection\`] foi encontrado em meu sistema!\n\`\`\`xl\n
	${error?.stack?.split('\n').splice(0, 5).join('\n').split(process.cwd()).join('MAIN_PROCESS')}\n.....\n\`\`\``)
});
process.on('uncaughtException', error => {
	bot.logger.warn(`[UNHANDLED EXCEPTION]`);
	bot.logger.error(`${error.name} [\`uncaughtException\`] foi encontrado em meu sistema!\n\`\`\`xl\n
	${error?.stack?.split('\n').splice(0, 5).join('\n').split(process.cwd()).join('MAIN_PROCESS')}\n.....\n\`\`\``)
});
process.on('uncaughtExceptionMonitor', error => {
	bot.logger.warn(`[UNHANDLED EXCEPTION]`);
	bot.logger.error(`${error.name} [\`uncaughtExceptionMonitor\`] foi encontrado em meu sistema!\n\`\`\`xl\n
	${error?.stack?.split('\n').splice(0, 5).join('\n').split(process.cwd()).join('MAIN_PROCESS')}\n.....\n\`\`\``)
});
process.on('warning', (warning) => { bot.logger.warn(`[WARNING]: ${warning}`); });
bot.on("disconnect", () => bot.logger.warn("Bot is disconnecting..."));
bot.on("reconnecting", () => bot.logger.warn("Bot reconnecting..."));
bot.on('warn', error => bot.logger.error(`BOT Warn: ${error}`));
bot.on('error', error => {
	if (error?.stack?.split('\n').splice(0, 5)[0] === "TypeError: Cannot read properties of undefined (reading 'then')") return;
	bot.logger.warn(`[BOT ERRORS]`);
	bot.logger.error(`${error.name} [\`unhandledRejection\`] foi encontrado em meu sistema!\n\`\`\`xl\n
	${error?.stack?.split('\n').splice(0, 5).join('\n').split(process.cwd()).join('MAIN_PROCESS')}\n.....\n\`\`\``)
});