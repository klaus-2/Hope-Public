const { EventEmitter } = require('node:events'),
	{ setTimeout, clearTimeout } = require('node:timers'),
	{ ActionRowBuilder, resolvePartialEmoji, EmbedBuilder, embedLength } = require('discord.js'),
	DEFAULT_CHECK_INTERVAL = 15000;


	// Represents a Giveaway.
class Giveaway extends EventEmitter {
	constructor(manager, options) {
		super();
		// The giveaway manager
		this.manager = manager;
		// The end timeout for this giveaway
		this.endTimeout = null;
		// The Discord client
		this.client = manager.client;
		// The giveaway prize
		this.prize = options.prize;
		// The start date of the giveaway
		this.startAt = options.startAt;
		// The end date of the giveaway
		this.endAt = options.endAt ?? Infinity;
		// Whether the giveaway is ended
		this.ended = options.ended ?? false;
		// The Id of the channel of the giveaway
		this.channelId = options.channelId;
		// The Id of the message of the giveaway
		this.messageId = options.messageId;
		// The Id of the guild of the giveaway
		this.guildId = options.guildId;
		// The number of winners for this giveaway
		this.winnerCount = options.winnerCount;
		// The winner Ids for this giveaway after it ended
		this.winnerIds = options.winnerIds ?? [];
		// The mention of the user who hosts this giveaway
		this.hostedBy = options.hostedBy;
		// The giveaway messages
		this.messages = options.messages;
		// The URL appearing as the thumbnail on the giveaway embed
		this.thumbnail = options.thumbnail;
		// The URL appearing as the image on the giveaway embed
		this.image = options.image;
		// Extra data concerning this giveaway
		this.extraData = options.extraData;
		// Which mentions should be parsed from the giveaway messages content
		this.allowedMentions = options.allowedMentions;
		// The giveaway data
		this.options = options;
		// The message instance of the embed of this giveaway
		this.message = null;
	}

	// The link to the giveaway message
	get messageURL() {
		return `https://discord.com/channels/${this.guildId}/${this.channelId}/${this.messageId}`;
	}

	// The remaining time before the end of the giveaway
	get remainingTime() {
		return this.endAt - Date.now();
	}

	// The total duration of the giveaway
	get duration() {
		return this.endAt - this.startAt;
	}

	// The color of the giveaway embed
	get embedColor() {
		return this.options.embedColor ?? this.manager.options.default.embedColor;
	}

	// The color of the giveaway embed when it has ended
	get embedColorEnd() {
		return this.options.embedColorEnd ?? this.manager.options.default.embedColorEnd;
	}

	// The emoji used for the reaction on the giveaway message
	get reaction() {
		if (!this.options.reaction && this.message) {
			const emoji = resolvePartialEmoji(this.manager.options.default.reaction);
			if (!this.message.reactions.cache.has(emoji.id ?? emoji.name)) {
				const reaction = this.message.reactions.cache.reduce(
					(prev, curr) => (curr.count > prev.count ? curr : prev),
					{ count: 0 },
				);
				this.options.reaction = reaction.emoji?.id ?? reaction.emoji?.name;
			}
		}
		return this.options.reaction ?? this.manager.options.default.reaction;
	}


	// The options for the last chance system
	get lastChance() {
		return this.manager.options.default.lastChance;
	}

	// Pause options for this giveaway
	get pauseOptions() {
		return this.options.pauseOptions;
	}

	// The reaction on the giveaway message
	get messageReaction() {
		const emoji = resolvePartialEmoji(this.reaction);
		return (
			this.message?.reactions.cache.find((r) =>
				[r.emoji.name, r.emoji.id].filter(Boolean).includes(emoji?.name ?? emoji?.id),
			) ?? null
		);
	}

	// The raw giveaway object for this giveaway
	get data() {
		// console.log('data', this);
		return {
			messageId: this.messageId,
			channelId: this.channelId,
			guildId: this.guildId,
			startAt: this.startAt,
			endAt: this.endAt,
			ended: this.ended,
			winnerCount: this.winnerCount,
			prize: this.prize,
			messages: this.messages,
			thumbnail: this.thumbnail,
			image: this.image,
			hostedBy: this.options.hostedBy,
			embedColor: this.manager.options.embedColor,
			embedColorEnd: this.manager.options.embedColorEnd,
			botsCanWin: this.options.botsCanWin,
			reaction: this.options.reaction,
			winnerIds: this.winnerIds.length ? this.winnerIds : undefined,
			extraData: this.extraData,
			lastChance: this.options.lastChance,
			pauseOptions: this.options.pauseOptions,
			isDrop: this.options.isDrop || undefined,
			allowedMentions: this.allowedMentions,
		};
	}

	// Ensure that an end timeout is created for this giveaway, in case it will end soon
	ensureEndTimeout() {
		if (this.endTimeout) return;
		if (this.remainingTime > (this.manager.options.forceUpdateEvery || DEFAULT_CHECK_INTERVAL)) return;
		this.endTimeout = setTimeout(
			() => this.manager.end.call(this.manager, this.messageId).catch(() => null),
			this.remainingTime,
		);
	}

	// Filles in a string with giveaway properties
	fillInString(string) {
		if (typeof string !== 'string') return null;
		[...new Set(string.match(/\{[^{}]{1,}\}/g))]
			.filter((match) => match?.slice(1, -1).trim() !== '')
			.forEach((match) => {
				let replacer;
				try {
					replacer = eval(match.slice(1, -1));
				} catch {
					replacer = match;
				}
				string = string.replaceAll(match, replacer);
			});
		return string.trim();
	}

	// Filles in a embed with giveaway properties
	fillInEmbed(embed) {
		if (!embed || typeof embed !== 'object') return null;
		embed = EmbedBuilder.from(embed);
		embed.setTitle(this.fillInString(embed.data.title));
		embed.setDescription(this.fillInString(embed.data.description));
		if (typeof embed.data.author?.name === 'string') {embed.data.author.name = this.fillInString(embed.data.author.name);}
		if (typeof embed.data.footer?.text === 'string') {embed.data.footer.text = this.fillInString(embed.data.footer.text);}
		if (embed.data.fields?.length) {
			embed.spliceFields(
				0,
				embed.data.fields.length,
				...embed.data.fields.map((f) => {
					f.name = this.fillInString(f.name);
					f.value = this.fillInString(f.value);
					return f;
				}),
			);
		}
		return embed;
	}

	fillInComponents(components) {
		if (!Array.isArray(components)) return null;
		return components.map((row) => {
			row = ActionRowBuilder.from(row);
			row.components = row.components.map((component) => {
				component.data.custom_id &&= this.fillInString(component.data.custom_id);
				component.data.label &&= this.fillInString(component.data.label);
				component.data.url &&= this.fillInString(component.data.url);
				component.data.placeholder &&= this.fillInString(component.data.placeholder);
				component.data.options &&= component.data.options.map((options) => {
					options.label = this.fillInString(options.label);
					options.value = this.fillInString(options.value);
					options.description &&= this.fillInString(options.description);
					return options;
				});
				return component;
			});
			return row;
		});
	}

	// Fetches the giveaway message from its channel
	async fetchMessage() {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			let tryLater = true;
			const channel = await this.client.channels.fetch(this.channelId).catch((err) => {
				if (err.code === 10003) tryLater = false;
			});
			const message = await channel?.messages.fetch(this.messageId).catch((err) => {
				if (err.code === 10008) tryLater = false;
			});
			if (!message) {
				if (!tryLater) {
					this.manager.giveaways = this.manager.giveaways.filter((g) => g.messageId !== this.messageId);
					await this.manager.deleteGiveaway(this.messageId);
				}
				return reject(
					'Unable to fetch message with Id ' + this.messageId + '.' + (tryLater ? ' Try later!' : ''),
				);
			}
			resolve(message);
		});
	}

	// Fetches all users of the giveaway reaction, except bots, if not otherwise specified
	async fetchAllEntrants() {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const message = await this.fetchMessage().catch((err) => reject(err));
			if (!message) return;
			this.message = message;
			const reaction = this.messageReaction;
			if (!reaction) return reject('Unable to find the giveaway reaction.');

			let userCollection = await reaction.users.fetch().catch(() => null);
			if (!userCollection) return reject('Unable to fetch the reaction users.');

			while (userCollection.size % 100 === 0) {
				const newUsers = await reaction.users.fetch({ after: userCollection.lastKey() });
				if (newUsers.size === 0) break;
				userCollection = userCollection.concat(newUsers);
			}

			const users = userCollection
				.filter((u) => !u.bot || u.bot === this.botsCanWin)
				.filter((u) => u.id !== this.client.user.id);
			resolve(users);
		});
	}

	// Checks if a user fulfills the requirements to win the giveaway
	async checkWinnerEntry(user) {
		if (this.winnerIds.includes(user.id)) return false;
		this.message ??= await this.fetchMessage().catch(() => null);
		const member = await this.message?.guild.members.fetch(user.id).catch(() => null);
		if (!member) return false;
		return true;
	}

	// Gets the giveaway winner(s)
	async roll(winnerCount = this.winnerCount) {
		if (!this.message) return [];

		let guild = this.message.guild;

		// Try to fetch the guild from the client if the guild instance of the message does not have its shard defined
		if (this.client.shard && !guild.shard) {
			guild = (await this.client.guilds.fetch(guild.id).catch(() => null)) ?? guild;
			// "Update" the message instance too, if possible.
			this.message = (await this.fetchMessage().catch(() => null)) ?? this.message;
		}
		await guild.members.fetch().catch(() => null);

		const users = await this.fetchAllEntrants().catch(() => null);
		if (!users?.size) return [];

		// Bonus Entries
		let userArray;
		const randomUsers = (amount) => {
			if (!userArray || userArray.length <= amount) return users.random(amount);
			return Array.from(
				{
					length: Math.min(amount, users.size),
				},
				() => userArray.splice(Math.floor(Math.random() * userArray.length), 1)[0],
			);
		};

		const winners = [];

		for (const u of randomUsers(winnerCount)) {
			const isValidEntry = !winners.some((winner) => winner.id === u.id) && (await this.checkWinnerEntry(u));
			if (isValidEntry) {winners.push(u);} else {
				// Find a new winner
				for (let i = 0; i < users.size; i++) {
					const user = randomUsers(1)[0];
					const isUserValidEntry =
                        !winners.some((winner) => winner.id === user.id) && (await this.checkWinnerEntry(user));
					if (isUserValidEntry) {
						winners.push(user);
						break;
					}
					users.delete(user.id);
					userArray = userArray?.filter((usr) => usr.id !== user.id);
				}
			}
		}

		return await Promise.all(winners.map(async (user) => await guild.members.fetch(user.id).catch(() => null)));
	}

	// Edits the giveaway
	edit(options = {}) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if (this.ended) return reject('Giveaway with message Id ' + this.messageId + ' is already ended.');
			this.message ??= await this.fetchMessage().catch(() => null);
			if (!this.message) return reject('Unable to fetch message with Id ' + this.messageId + '.');

			// Update data
			if (typeof options.newThumbnail === 'string') this.thumbnail = options.newThumbnail;
			if (typeof options.newImage === 'string') this.image = options.newImage;
			if (typeof options.newPrize === 'string') this.prize = options.newPrize;
			if (options.newExtraData) this.extraData = options.newExtraData;
			if (Number.isInteger(options.newWinnerCount) && options.newWinnerCount > 0 && !this.isDrop) {
				this.winnerCount = options.newWinnerCount;
			}
			if (Number.isFinite(options.addTime) && !this.isDrop) {
				this.endAt = this.endAt + options.addTime;
				if (this.endTimeout) clearTimeout(this.endTimeout);
				this.ensureEndTimeout();
			}
			if (Number.isFinite(options.setEndTimestamp) && !this.isDrop) this.endAt = options.setEndTimestamp;
			if (Array.isArray(options.newBonusEntries) && !this.isDrop) {
				this.options.bonusEntries = options.newBonusEntries.filter((elem) => typeof elem === 'object');
			}
			if (typeof options.newExemptMembers === 'function') {
				this.options.exemptMembers = options.newExemptMembers;
			}

			await this.manager.editGiveaway(this.messageId, this.data);
			if (this.remainingTime <= 0) {
				this.manager.end(this.messageId).catch(() => null);
			} else {
				const embed = this.manager.generateMainEmbed(this);
				await this.message
					.edit({
						content: this.fillInString(this.messages.giveaway),
						embeds: [embed],
						allowedMentions: this.allowedMentions,
					})
					.catch(() => null);
			}
			resolve(this);
		});
	}

	// Ends the giveaway
	end(noWinnerMessage = null) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if (this.ended) return reject('Giveaway with message Id ' + this.messageId + ' is already ended');
			this.ended = true;

			// Always fetch the message in order to reject early
			this.message = await this.fetchMessage().catch((err) => {
				if (err.includes('Try later!')) this.ended = false;
				return reject(err);
			});
			if (!this.message) return;

			if (this.endAt < this.client.readyTimestamp || this.isDrop || this.options.pauseOptions?.isPaused) {
				this.endAt = Date.now();
			}
			if (this.options.pauseOptions?.isPaused) this.options.pauseOptions.isPaused = false;
			await this.manager.editGiveaway(this.messageId, this.data);
			const winners = await this.roll();

			const channel = this.message.channel.isThread() && !this.message.channel.sendable
				? this.message.channel.parent
				: this.message.channel;

			if (winners.length > 0) {
				this.winnerIds = winners.map((w) => w.id);
				await this.manager.editGiveaway(this.messageId, this.data);
				let embed = this.manager.generateEndEmbed(this, winners);
				await this.message
					.edit({
						content: this.fillInString(this.messages.giveawayEnded),
						embeds: [embed],
						allowedMentions: this.allowedMentions,
					})
					.catch(() => null);

				let formattedWinners = winners.map((w) => `<@${w.id}>`).join(', ');
				const winMessage = this.fillInString(this.messages.winMessage.content || this.messages.winMessage);
				const message = winMessage?.replace('{winners}', formattedWinners).replace('{messageURL}', this.messageURL);
				const components = this.fillInComponents(this.messages.winMessage.components);

				if (message?.length > 2000) {
					const firstContentPart = winMessage.slice(0, winMessage.indexOf('{winners}'));
					if (firstContentPart.length) {
						channel.send({
							content: firstContentPart,
							allowedMentions: this.allowedMentions,
							reply: {
								messageReference: typeof this.messages.winMessage.replyToGiveaway === 'boolean'
									? this.messageId
									: undefined,
								failIfNotExists: false,
							},
						});
					}
					while (formattedWinners.length >= 2000) {
						await channel.send({
							content: formattedWinners.slice(0, formattedWinners.lastIndexOf(',', 1999)) + ',',
							allowedMentions: this.allowedMentions,
						});
						formattedWinners = formattedWinners.slice(
							formattedWinners.slice(0, formattedWinners.lastIndexOf(',', 1999) + 2).length,
						);
					}
					channel.send({ content: formattedWinners, allowedMentions: this.allowedMentions });

					const lastContentPart = winMessage.slice(winMessage.indexOf('{winners}') + 9);
					if (lastContentPart.length) {
						channel.send({
							content: lastContentPart,
							components: this.messages.winMessage.embed && typeof this.messages.winMessage.embed === 'object'
								? null
								: components,
							allowedMentions: this.allowedMentions,
						});
					}
				}

				if (this.messages.winMessage.embed && typeof this.messages.winMessage.embed === 'object') {
					if (message?.length > 2000) formattedWinners = winners.map((w) => `<@${w.id}>`).join(', ');
					embed = this.fillInEmbed(this.messages.winMessage.embed);
					const embedDescription = embed.data.description?.replace('{winners}', formattedWinners).replace('{messageURL}', this.messageURL) ?? '';

					if (embedDescription.length <= 4096) {
						channel.send({
							content: message?.length <= 2000 ? message : null,
							embeds: [embed.setDescription(embedDescription)],
							components,
							allowedMentions: this.allowedMentions,
							reply: {
								messageReference:!(message?.length > 2000) && typeof this.messages.winMessage.replyToGiveaway === 'boolean'
									? this.messageId
									: undefined,
								failIfNotExists: false,
							},
						});
					} else {
						const firstEmbed = new EmbedBuilder(embed).setDescription(
							embed.data.description.slice(0, embed.data.description.indexOf('{winners}')) || null,
						);
						if (embedLength(firstEmbed.data)) {
							channel.send({
								content: message?.length <= 2000 ? message : null,
								embeds: [firstEmbed],
								allowedMentions: this.allowedMentions,
								reply: {
									messageReference: !(message?.length > 2000) && typeof this.messages.winMessage.replyToGiveaway === 'boolean'
										? this.messageId
										: undefined,
									failIfNotExists: false,
								},
							});
						}

						const tempEmbed = new EmbedBuilder().setColor(embed.data.color ?? null);
						while (formattedWinners.length >= 4096) {
							await channel.send({
								embeds: [
									tempEmbed.setDescription(
										formattedWinners.slice(0, formattedWinners.lastIndexOf(',', 4095)) + ',',
									),
								],
								allowedMentions: this.allowedMentions,
							});
							formattedWinners = formattedWinners.slice(
								formattedWinners.slice(0, formattedWinners.lastIndexOf(',', 4095) + 2).length,
							);
						}
						channel.send({
							embeds: [tempEmbed.setDescription(formattedWinners)],
							allowedMentions: this.allowedMentions,
						});

						const lastEmbed = tempEmbed.setDescription(
							embed.data.description.slice(embed.data.description.indexOf('{winners}') + 9) || null,
						);
						if (embedLength(lastEmbed.data)) {
							channel.send({ embeds: [lastEmbed], components, allowedMentions: this.allowedMentions });
						}
					}
				} else if (message?.length <= 2000) {
					channel.send({
						content: message,
						components,
						allowedMentions: this.allowedMentions,
						reply: {
							messageReference:typeof this.messages.winMessage.replyToGiveaway === 'boolean'
								? this.messageId
								: undefined,
							failIfNotExists: false,
						},
					});
				}
				resolve(winners);
			} else {
				const message = this.fillInString(noWinnerMessage?.content || noWinnerMessage);
				const embed = this.fillInEmbed(noWinnerMessage?.embed);
				if (message || embed) {
					channel.send({
						content: message,
						embeds: embed ? [embed] : null,
						components: this.fillInComponents(noWinnerMessage?.components),
						allowedMentions: this.allowedMentions,
						reply: {
							messageReference: typeof noWinnerMessage?.replyToGiveaway === 'boolean' ? this.messageId : undefined,
							failIfNotExists: false,
						},
					});
				}

				await this.message
					.edit({
						content: this.fillInString(this.messages.giveawayEnded),
						embeds: [this.manager.generateNoValidParticipantsEndEmbed(this)],
						allowedMentions: this.allowedMentions,
					})
					.catch(() => null);
				resolve([]);
			}
		});
	}

	// Rerolls the giveaway
	reroll(options = {}) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if (!this.ended) return reject('Giveaway with message Id ' + this.messageId + ' is not ended.');
			this.message ??= await this.fetchMessage().catch(() => null);
			if (!this.message) return reject('Unable to fetch message with Id ' + this.messageId + '.');
			if (this.isDrop) return reject('Drop giveaways cannot get rerolled!');
			if (!options || typeof options !== 'object') return reject(`"options" is not an object (val=${options})`);
			if (options.winnerCount && (!Number.isInteger(options.winnerCount) || options.winnerCount < 1)) {
				return reject(`options.winnerCount is not a positive integer. (val=${options.winnerCount})`);
			}

			const winners = await this.roll(options.winnerCount || undefined);
			const channel = this.message.channel.isThread() && !this.message.channel.sendable
				? this.message.channel.parent
				: this.message.channel;

			if (winners.length > 0) {
				this.winnerIds = winners.map((w) => w.id);
				await this.manager.editGiveaway(this.messageId, this.data);
				let embed = this.manager.generateEndEmbed(this, winners);
				await this.message
					.edit({
						content: this.fillInString(this.messages.giveawayEnded),
						embeds: [embed],
						allowedMentions: this.allowedMentions,
					})
					.catch(() => null);

				let formattedWinners = winners.map((w) => `<@${w.id}>`).join(', ');
				const congratMessage = this.fillInString(options.messages.congrat.content || options.messages.congrat);
				const message = congratMessage?.replace('{winners}', formattedWinners);
				const components = this.fillInComponents(options.messages.congrat.components);

				if (message?.length > 2000) {
					const firstContentPart = congratMessage.slice(0, congratMessage.indexOf('{winners}'));
					if (firstContentPart.length) {
						channel.send({
							content: firstContentPart,
							allowedMentions: this.allowedMentions,
							reply: {
								messageReference: typeof options.messages.congrat.replyToGiveaway === 'boolean'
									? this.messageId
									: undefined,
								failIfNotExists: false,
							},
						});
					}

					while (formattedWinners.length >= 2000) {
						await channel.send({
							content: formattedWinners.slice(0, formattedWinners.lastIndexOf(',', 1999)) + ',',
							allowedMentions: this.allowedMentions,
						});
						formattedWinners = formattedWinners.slice(
							formattedWinners.slice(0, formattedWinners.lastIndexOf(',', 1999) + 2).length,
						);
					}
					channel.send({ content: formattedWinners, allowedMentions: this.allowedMentions });

					const lastContentPart = congratMessage.slice(congratMessage.indexOf('{winners}') + 9);
					if (lastContentPart.length) {
						channel.send({
							content: lastContentPart,
							components: options.messages.congrat.embed && typeof options.messages.congrat.embed === 'object'
								? null
								: components,
							allowedMentions: this.allowedMentions,
						});
					}
				}

				if (options.messages.congrat.embed && typeof options.messages.congrat.embed === 'object') {
					if (message?.length > 2000) formattedWinners = winners.map((w) => `<@${w.id}>`).join(', ');
					embed = this.fillInEmbed(options.messages.congrat.embed);
					const embedDescription = embed.data.description?.replace('{winners}', formattedWinners) ?? '';
					if (embedDescription.length <= 4096) {
						channel.send({
							content: message?.length <= 2000 ? message : null,
							embeds: [embed.setDescription(embedDescription)],
							components,
							allowedMentions: this.allowedMentions,
							reply: {
								messageReference: !(message?.length > 2000) && typeof options.messages.congrat.replyToGiveaway === 'boolean'
									? this.messageId
									: undefined,
								failIfNotExists: false,
							},
						});
					} else {
						const firstEmbed = new EmbedBuilder(embed).setDescription(
							embed.data.description.slice(0, embed.data.description.indexOf('{winners}')) || null,
						);
						if (embedLength(firstEmbed.toJSON())) {
							channel.send({
								content: message?.length <= 2000 ? message : null,
								embeds: [firstEmbed],
								allowedMentions: this.allowedMentions,
								reply: {
									messageReference:!(message?.length > 2000) && typeof options.messages.congrat.replyToGiveaway === 'boolean'
										? this.messageId
										: undefined,
									failIfNotExists: false,
								},
							});
						}

						const tempEmbed = new EmbedBuilder().setColor(embed.data.color ?? null);
						while (formattedWinners.length >= 4096) {
							await channel.send({
								embeds: [
									tempEmbed.setDescription(
										formattedWinners.slice(0, formattedWinners.lastIndexOf(',', 4095)) + ',',
									),
								],
								allowedMentions: this.allowedMentions,
							});
							formattedWinners = formattedWinners.slice(
								formattedWinners.slice(0, formattedWinners.lastIndexOf(',', 4095) + 2).length,
							);
						}
						channel.send({
							embeds: [tempEmbed.setDescription(formattedWinners)],
							allowedMentions: this.allowedMentions,
						});

						const lastEmbed = tempEmbed.setDescription(
							embed.data.description.slice(embed.data.description.indexOf('{winners}') + 9) || null,
						);
						if (embedLength(lastEmbed.toJSON())) {
							channel.send({ embeds: [lastEmbed], components, allowedMentions: this.allowedMentions });
						}
					}
				} else if (message?.length <= 2000) {
					channel.send({
						content: message,
						components,
						allowedMentions: this.allowedMentions,
						reply: {
							messageReference: typeof options.messages.congrat.replyToGiveaway === 'boolean'
								? this.messageId
								: undefined,
							failIfNotExists: false,
						},
					});
				}
				resolve(winners);
			} else {
				if (options.messages.replyWhenNoWinner !== false) {
					const embed = this.fillInEmbed(options.messages.error.embed);
					channel.send({
						content: this.fillInString(options.messages.error.content || options.messages.error),
						embeds: embed ? [embed] : null,
						components: this.fillInComponents(options.messages.error.components),
						allowedMentions: this.allowedMentions,
						reply: {
							messageReference:typeof options.messages.error.replyToGiveaway === 'boolean'
								? this.messageId
								: undefined,
							failIfNotExists: false,
						},
					});
				}
				resolve([]);
			}
		});
	}

	// Pauses the giveaway
	pause(options = {}) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if (this.ended) return reject('Giveaway with message Id ' + this.messageId + ' is already ended.');
			this.message ??= await this.fetchMessage().catch(() => null);
			if (!this.message) return reject('Unable to fetch message with Id ' + this.messageId + '.');
			if (this.pauseOptions.isPaused) {
				return reject('Giveaway with message Id ' + this.messageId + ' is already paused.');
			}
			if (this.isDrop) return reject('Drop giveaways cannot get paused!');
			if (this.endTimeout) clearTimeout(this.endTimeout);

			// Update data
			const pauseOptions = this.options.pauseOptions || {};
			if (typeof options.content === 'string') pauseOptions.content = options.content;
			if (Number.isFinite(options.unpauseAfter)) {
				if (options.unpauseAfter < Date.now()) {
					pauseOptions.unpauseAfter = Date.now() + options.unpauseAfter;
					this.endAt = this.endAt + options.unpauseAfter;
				} else {
					pauseOptions.unpauseAfter = options.unpauseAfter;
					this.endAt = this.endAt + options.unpauseAfter - Date.now();
				}
			} else {
				delete pauseOptions.unpauseAfter;
				pauseOptions.durationAfterPause = this.remainingTime;
				this.endAt = Infinity;
			}
			pauseOptions.embedColor = options.embedColor;
			if (typeof options.infiniteDurationText === 'string') {
				pauseOptions.infiniteDurationText = options.infiniteDurationText;
			}
			pauseOptions.isPaused = true;
			this.options.pauseOptions = pauseOptions;

			await this.manager.editGiveaway(this.messageId, this.data);
			const embed = this.manager.generateMainEmbed(this);
			await this.message
				.edit({
					content: this.fillInString(this.messages.giveaway),
					embeds: [embed],
					allowedMentions: this.allowedMentions,
				})
				.catch(() => null);
			resolve(this);
		});
	}

	// Unpauses the giveaway
	unpause() {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if (this.ended) return reject('Giveaway with message Id ' + this.messageId + ' is already ended.');
			this.message ??= await this.fetchMessage().catch(() => null);
			if (!this.message) return reject('Unable to fetch message with Id ' + this.messageId + '.');
			if (!this.pauseOptions.isPaused) {
				return reject('Giveaway with message Id ' + this.messageId + ' is not paused.');
			}
			if (this.isDrop) return reject('Drop giveaways cannot get unpaused!');

			// Update data
			if (Number.isFinite(this.pauseOptions.durationAfterPause)) {
				this.endAt = Date.now() + this.pauseOptions.durationAfterPause;
			}
			delete this.options.pauseOptions.unpauseAfter;
			this.options.pauseOptions.isPaused = false;

			this.ensureEndTimeout();

			await this.manager.editGiveaway(this.messageId, this.data);
			const embed = this.manager.generateMainEmbed(this);
			await this.message
				.edit({
					content: this.fillInString(this.messages.giveaway),
					embeds: [embed],
					allowedMentions: this.allowedMentions,
				})
				.catch(() => null);
			resolve(this);
		});
	}
}

module.exports = Giveaway;