// Dependencies
const { Embed } = require('../../utils'),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    { ReactionRoleSchema } = require('../../database/models'),
    Event = require('../../structures/Event');

module.exports = class clickSelect extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }
    
	// Exec event
    async run(bot, select) {
        const { customId: ID, guildId, channelId, member } = select,
            guild = bot.guilds.cache.get(guildId),
            channel = bot.channels.cache.get(channelId);

        if (ID === 'rrSelect') {
            const dbReaction = await ReactionRoleSchema.findOne({
                guildID: guild.id,
                messageID: select.message.id,
            });

            if (dbReaction) {
                for (const sel of dbReaction.dropdowns) {

                    const cargo = await guild.roles.fetch(sel.roleID);
                    // console.log(cargo.name)

                    if (cargo) {

                        let addEmbed = new Embed(bot, guild)
                            .setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET5'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif` })
                            .setDescription(guild.translate('Events/messageReactionAdd:TICKET6', { cargo: cargo.name, guild: guild.name }))
                            .setFooter({ text: `Powered by hopebot.top` })
                            .setColor(12118406)

                        let addEmbed2 = new Embed(bot, guild)
                            .setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET5'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif` })
                            .setDescription(`You have successfully received the role **${cargo.name}** (${cargo}).`)
                            .setFooter({ text: `Powered by hopebot.top` })
                            .setColor(12118406)

                        let remEmbed = new Embed(bot, guild)
                            .setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET7'), iconURL: `https://media.discordapp.net/attachments/863414255766994944/891065394859745290/tick-tick-verified.gif` })
                            .setDescription(guild.translate('Events/messageReactionAdd:TICKET8', { cargo: cargo.name, guild: guild.name }))
                            .setFooter({ text: `Powered by hopebot.top` })
                            .setColor(16734058)

                        let errorReaction = new Embed(bot, guild)
                            .setAuthor({ name: guild.translate('Events/messageReactionAdd:TICKET9'), iconURL: `https://cdn.dribbble.com/users/6425/screenshots/5039369/error-glitch-gif-3.gif` })
                            .setDescription(guild.translate('Events/messageReactionAdd:TICKET10'))
                            .setFooter({ text: `Powered by hopebot.top` })
                            .setColor(16711710)

                        if (dbReaction.option === 1) {
                            try {
                                if (!member.roles.cache.has(sel.roleID)) {
                                    member.roles.add(sel.roleID);
                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [addEmbed] })
                                    } else {
                                        return select.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                } else {
                                    return select.reply({ embeds: [channel.error(`Uh-oh! You already have this role. No need to click here again.`, {}, true)], ephemeral: true });
                                }
                            } catch (err) {
                                console.log(err)
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 2) {
                            try {
                                if (!member.roles.cache.has(sel.roleID)) {
                                    await member.roles.add(sel.roleID)
                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [addEmbed] })
                                    } else {
                                        return select.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 3) {
                            try {
                                if (!member.roles.cache.has(sel.roleID)) {
                                    await member.roles.remove(sel.roleID)
                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [remEmbed] })
                                    } else {
                                        return select.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                if (!guild.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 4) {
                            try {
                                if (!member.roles.cache.has(sel.roleID)) {
                                    await member.roles.remove(sel.roleID)
                                    reactionCooldown.add(user.id);
                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [remEmbed] })
                                    } else {
                                        return select.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 5) {
                            try {
                                if (!member.roles.cache.has(sel.roleID)) {
                                    await member.roles.remove(sel.roleID);
                                    guild.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id)

                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [remEmbed] })
                                    } else {
                                        return select.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                if (!guild.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
                                return member.send({ embeds: [errorReaction] })
                            }
                        }

                        if (dbReaction.option === 6) {

                            try {
                                if (!member.roles.cache.has(sel.roleID)) {

                                    guild.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id)
                                    await member.roles.remove(sel.roleID)
                                    return;
                                } else if (!member.roles.cache.has(sel.roleID)) {

                                    guild.reactions.cache.find(r => r.emoji.name == reaction.emoji.toString()).users.remove(user.id)
                                    await member.roles.add(sel.roleID)

                                    if (dbReaction.dm === true) {
                                        member.send({ embeds: [addEmbed] })
                                    } else {
                                        return select.reply({ embeds: [addEmbed2], ephemeral: true });
                                    }
                                }
                            } catch (err) {
                                if (!guild.channel.permissionsFor(bot.user).has(Flags.SendMessages)) return;
                                return member.send({ embeds: [errorReaction] })
                            }
                        }
                    } else {
                        return select.reply({ embeds: [channel.error(`Uh-oh! The role of this reaction has been **deleted** and **no longer exists** on this server. Please **notify** any *moderation member* about this.`, {}, true)], ephemeral: true });
                    }
                    select.deferUpdate();
                }
            }
        }
    }
};