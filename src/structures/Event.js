// Dependencies
const path = require('path');

	// Event structure
 class Event {
	constructor(bot, name, {
		dirname = false,
		child = null,
	}) {
		const category = (dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length - 1, 10)] : 'Other');
		this.conf = { name, category, child };
	}

	// Function for recieving message.
	// eslint-disable-next-line no-unused-vars
	async run(...args) {
		throw new Error(`Event: ${this.name} does not have a run method`);
	}
}

module.exports = Event;
