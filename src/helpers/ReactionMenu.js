const { EmbedBuilder } = require('discord.js');
const ms = require("ms");

module.exports = class ReactionMenu {

  // Create new ReactionMenu
  constructor(client, channel, member, embed, arr = null, interval = 10, reactions = {
    '⏪': this.first.bind(this),
    '◀️': this.previous.bind(this),
    '🗑️': this.stop.bind(this),
    '▶️': this.next.bind(this),
    '⏩': this.last.bind(this)

  }, timeout = 180000) {

    // The Peter Client
    this.client = client;

    // The text channel
    this.channel = channel;

    // The member ID snowflake
    this.memberId = member.id;

    // The embed passed to the Reaction Menu
    this.embed = embed;

    // JSON from the embed
    this.json = this.embed.toJSON();

    // The array to be iterated over
    this.arr = arr;

    // The size of each array window
    this.interval = interval;

    // The current array window start
    this.current = 0;

    // The max length of the array
    this.max = (this.arr) ? arr.length : null;

    // The reactions for menu
    this.reactions = reactions;

    // The emojis used as keys
    this.emojis = Object.keys(this.reactions);

    // The collector timeout
    this.timeout = timeout;

    const first = new MessageEmbed(this.json);
    const description = (this.arr) ? this.arr.slice(this.current, this.interval) : null;
    if (description) first
      .setTitle(this.embed.title + ' ' + getRange(this.arr, this.current, this.interval))
      .setDescription(description);

    this.channel.send({ embeds: [first] }).then(message => {

      // The menu message
      this.message = message;

      this.addReactions();
      this.createCollector();
    });
  }

  // Adds reactions to the message
  async addReactions() {
    for (const emoji of this.emojis) {
      await this.message.react(emoji).catch((e) => { });
      await delay(1000);
    }
  }

  // Creates a reaction collector
  createCollector() {

    // Create collector
    const filter = (reaction, user) => this.emojis.includes(reaction.emoji.name) || this.emojis.includes(reaction.emoji.id) && user.id == this.memberId;
    const collector = this.message.createReactionCollector({ filter: filter, time: this.timeout });

    // On collect
    collector.on('collect', async reaction => {
      let newPage = this.reactions[reaction.emoji.name] || this.reactions[reaction.emoji.id];
      if (typeof newPage === 'function') newPage = newPage();
      if (newPage) await this.message.edit({ embeds: [newPage] });
      await reaction.users.remove(this.memberId);
    });

    // On end
    collector.on('end', () => {

      setTimeout(() => {
        this.message.delete().catch(() => { });
      }, 2000);

    });

    this.collector = collector;
  }

  // Skips to the first array interval
  first() {
    if (this.current === 0) return;
    this.current = 0;
    return new MessageEmbed(this.json)
      .setTitle(this.embed.title + ' ' + getRange(this.arr, this.current, this.interval))
      .setDescription(this.arr.slice(this.current, this.current + this.interval));
  }

  // Goes back an array interval
  previous() {
    if (this.current === 0) return;
    this.current -= this.interval;
    if (this.current < 0) this.current = 0;
    return new MessageEmbed(this.json)
      .setTitle(this.embed.title + ' ' + getRange(this.arr, this.current, this.interval))
      .setDescription(this.arr.slice(this.current, this.current + this.interval));
  }

  // Goes to the next array interval
  next() {
    const cap = this.max - (this.max % this.interval);
    if (this.current === cap || this.current + this.interval === this.max) return;
    this.current += this.interval;
    if (this.current >= this.max) this.current = cap;
    const max = (this.current + this.interval >= this.max) ? this.max : this.current + this.interval;
    return new MessageEmbed(this.json)
      .setTitle(this.embed.title + ' ' + getRange(this.arr, this.current, this.interval))
      .setDescription(this.arr.slice(this.current, max));
  }

  // Goes to the last array interval
  last() {
    const cap = this.max - (this.max % this.interval);
    if (this.current === cap || this.current + this.interval === this.max) return;
    this.current = cap;
    if (this.current === this.max) this.current -= this.interval;
    return new MessageEmbed(this.json)
      .setTitle(this.embed.title + ' ' + getRange(this.arr, this.current, this.interval))
      .setDescription(this.arr.slice(this.current, this.max));
  }

  // Stops the collector
  stop() {
    this.collector.stop();
  }
};

function getRange(arr, current, interval) {
  const max = (arr.length > current + interval) ? current + interval : arr.length;
  current = current + 1;
  const range = (arr.length == 1 || arr.length == current || interval == 1) ? `[${current}]` : `[${current} - ${max}]`;
  return range;
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}