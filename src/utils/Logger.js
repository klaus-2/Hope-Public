// Dependências
const chalk = require('chalk'),
	moment = require('moment'),
	{ WebHooks } = require(`${process.cwd()}/src/config.js`),
	log = require('simple-node-logger').createRollingFileLogger({
		logDirectory: './src/utils/logs',
		fileNamePattern: 'roll-<DATE>.log',
		dateFormat: 'YYYY.MM.DD',
	});

const Discord = require('discord.js');
const LogError = new Discord.WebhookClient({ id: WebHooks[0].ID, token: WebHooks[0].TOKEN });
const LogDebug = new Discord.WebhookClient({ id: WebHooks[0].ID, token: WebHooks[0].TOKEN });
//const LogCMD = new Discord.WebhookClient('hookID', 'hookTOKEN');
//const Logs = new Discord.WebhookClient('hookID', 'hookTOKEN');

// Logger
exports.log = (content, type = 'log') => {
	if (content == 'error') return;
	const timestamp = `[${moment().format('HH:mm:ss:SSS')}]:`;
	switch (type) {
		case 'log':
			log.info(content);
			console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
			//Logs.send(`${timestamp} \`LOG\` **${content}**`)
			break;
		case 'warn':
			log.warn(content);
			console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
			break;
		case 'error':
			log.error(content);
			LogError.send(`${timestamp} \`ERROR\` **${content}**`)
			console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
			break;
		case 'debug':
			//log.debug(content);
			LogDebug.send(`${timestamp} \`DEBUG\` **${content}**`)
			console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
			break;
		case 'cmd':
			log.info(content);
			//LogCMD.send(`${timestamp} \`CMD\` **${content}**`)
			console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
			break;
		case 'ready':
			log.info(content);
			console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
			break;
		case 'automod':
			log.info(content);
			console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
			break;
		case 'lavalink':
			log.info(content);
			console.log(`${timestamp} ${chalk.black.bgRed(type.toUpperCase())} ${content}`);
			break;
		case 'HopeDJ':
			log.info(content);
			console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content}`);
			break;
		case 'api':
			log.info(content);
			console.log(`${timestamp} ${chalk.black.bgMagenta(type.toUpperCase())} ${content}`);
			break;
		case 'addon':
			log.info(content);
			console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content}`);
			break;
		default:
			break;
	}
};

exports.warn = (...args) => this.log(...args, 'warn');

exports.error = (...args) => this.log(...args, 'error');

exports.debug = (...args) => this.log(...args, 'debug');

exports.cmd = (...args) => this.log(...args, 'cmd');

exports.ready = (...args) => this.log(...args, 'ready');

exports.automod = (...args) => this.log(...args, 'automod');

exports.lavalink = (...args) => this.log(...args, 'lavalink');

exports.HopeDJ = (...args) => this.log(...args, 'HopeDJ');

exports.api = (...args) => this.log(...args, 'api');

exports.addon = (...args) => this.log(...args, 'addon');
