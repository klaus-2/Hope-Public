// Dependencies
const { logger } = require('../utils'),
	{ GuildSchema } = require('../database/models');

module.exports.run = async () => {
	logger.log('Updating database');
	try {
		const resp = await GuildSchema.updateMany({}, [
			{
				$set: {
					plugins: ['Animes', 'Actions', 'Fun', 'Giveaway', 'Guild', 'Image', 'Misc', 'Moderation', 'Addons', 'Ticket', 'Games', 'Host'],
				},
			},
			/*{
				$unset: [
					'saldo', 'economia',
				],
			}*/]);
		logger.ready('Database has been updated to v1.2');
		return resp;
	} catch (err) {
		console.log(err);
	}
};

//{ $unset: [ 'ModerationBadwords',] }