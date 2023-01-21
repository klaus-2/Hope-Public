// Dependencies
const { logger } = require('./utils');

(async () => {
	// This file is for sharding
	const { ShardingManager } = require('discord.js');

	// Create sharding manager
	const manager = new ShardingManager('./src/bot.js', {
		// Sharding options
		totalShards: 'auto',
		shardList: 'auto',
		mode: 'process',
		respawn: true,
		shardArgs: [],
		execArgv: [],
		token: require('./config.js').token,
	}).on('shardDisconnect', (shard) => channel?.send(`${e.Deny} | Um Shard foi desconectado.\n${e.Info} | Shard: ${shard.id} \`${Date.format()}\``))
		.on('shardError', (err, shard) => channel?.send(`${e.Warn} | Ocorreu um erro em um Shard.\n${e.Info} | Shard: ${shard.id} \`${Date.format()}\`\n-> \`${err}\``))
		.on('shardReady', (shard) => channel?.end(`${e.Check} | Shard pronto.\n${e.Info} | Shard: ${shard.id} \`${Date.format()}\``))
		.on('shardReconnecting', (shard) => channel?.send(`${e.Loading} | Shard reconectando.\n${e.Info} | Shard: ${shard.id} \`${Date.format()}\``));

	// Spawn your shards
	logger.log('-{ Loading shard(s) }-');
	try {
		await manager.spawn();
	} catch (err) {
		logger.error(`Error loading shards: ${err.message}`);
	}

	// Emitted when a shard is created
	manager.on('shardCreate', (shard) => {
		logger.log(`Shard ${shard.id} launched`);
	});
})();
