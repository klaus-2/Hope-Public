// Dependencies
const Event = require('../../structures/Event');

class APIRequest extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			child: 'rest',
		});
	}

	// Exec event
	async run(bot, request) {
		bot.requests[request.route] ? bot.requests[request.route] += 1 : bot.requests[request.route] = 1;
	}
}

module.exports = APIRequest;