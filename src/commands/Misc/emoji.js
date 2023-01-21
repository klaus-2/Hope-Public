// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags }, ApplicationCommandOptionType, parseEmoji } = require('discord.js'),
  { parse } = require("twemoji-parser"),
  { fetch } = require('undici'),
  Command = require('../../structures/Command.js');

module.exports = class Emoji extends Command {
  constructor(bot) {
    super(bot, {
      name: 'emoji',
      dirname: __dirname,
      aliases: ['bemoji', 'downloademoji'],
      userPermissions: [Flags.ManageEmojisAndStickers],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Add, remove, copy, and download emojis from other servers to your server.',
      usage: '<prefix><commandName> [option]',
      cooldown: 5000,
      examples: [
        '/emoji add <:SkyeZumbi:823046656387055646>',
        '.emoji remove <:SkyeZumbi:823046656387055646>',
        '!emoji list',
        '?emoji download <:SkyeZumbi:823046656387055646>'
      ],
      slash: true,
      options: [
        {
          name: 'option',
          description: 'Choose what you want to do with the emoji',
          type: ApplicationCommandOptionType.String,
          choices: [...["add", "remove", "download", "list"].map(opt => ({ name: opt, value: opt }))].slice(0, 24),
          required: true,
        },
        {
          name: 'emoji',
          description: 'Type the emoji | Fyi: In option LIST, you type anything',
          type: ApplicationCommandOptionType.String,
          required: true,
        }],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    let emoji;
    let emojiID;

    switch (message.args[0]) {
      case "add":
        emoji = message.args[1];
        if (!emoji) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

        if (emoji.startsWith("<") && emoji.endsWith(">")) {
          const id = emoji.match(/\d{15,}/g)[0]

          const type = await fetch(`https://cdn.discordapp.com/emojis/${id}.gif`).then(res => res.json())
            .then(image => {
              if (image) return "gif"
              else return "png"
            }).catch(err => {
              return "png"
            })

          emoji = `https://cdn.discordapp.com/emojis/${id}.${type}`;
          emojiID = id;
        }

        if (emojiID) {
          const Link = emoji;
          const name = parseEmoji(message.args[1]).name;
          // Create a new emoji from a URL
          message.guild.emojis.create({ attachment: Link, name: name }).then(emoji => {
            const copyEmbed = new Embed(bot, message.guild)
              .setAuthor({ name: message.translate('Misc/copiaremoji:ECOE_DESC'), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
              .setColor(16775424)
              .setTimestamp()
              .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
              .setDescription(`**Emoji:** ${emoji.toString()}\n**Preview:** \`<:${emoji.name}:${emoji.id}>\``);
            return message.channel.send({ embeds: [copyEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
          }).catch(err => {
            const err_emoji = new Embed(bot, message.guild)
              .setDescription(`There are an error while adding you emoji\n\`\`\`${err}\`\`\`\nPlease try again or contact the support server`)
            return message.channel.send({ embeds: [err_emoji] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
          })
        } else {
          let CheckEmoji = parse(emoji, { assetType: "png" });
          if (!CheckEmoji[0])
            return message.channel.error('Misc/copiaremoji:EMOJI_INVALIDO').then(m => m.timedDelete({ timeout: 5000 }));
          message.channel.error('Misc/copiaremoji:EMOJI_PADRÃO').then(m => m.timedDelete({ timeout: 5000 }));
        }
        break;

      case "remove":
        emoji = message.args[1];
        if (!emoji) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

        if (emoji.startsWith("<") && emoji.endsWith(">")) {
          const id = emoji.match(/\d{15,}/g)[0]

          const type = await fetch(`https://cdn.discordapp.com/emojis/${id}.gif`).then(res => res.json())
            .then(image => {
              if (image) return "gif"
              else return "png"
            }).catch(err => {
              return "png"
            })

          emoji = `https://cdn.discordapp.com/emojis/${id}.${type}`;
          emojiID = id;
        }

        if (!message.guild.emojis.fetch(emojiID)) return message.channel.error(`Uh-oh! The emoji used does not belong to this server. I can only remove emojis from this server. Please check and try again!`)

        if (emojiID) {
          // Create a new emoji from a URL
          message.guild.emojis.delete(emojiID, 'Emoji deleted using the .emoji remove command').then(emoji => {
            const deleteEmbed = new Embed(bot, message.guild)
              .setColor(16775424)
              .setTimestamp()
              .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
              .setDescription(`The emoji has been successfully deleted!`);
            return message.channel.send({ embeds: [deleteEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
          }).catch(err => {
            const err_emoji = new Embed(bot, message.guild)
              .setDescription(`There are an error while adding you emoji\n\`\`\`${err}\`\`\`\nPlease try again or contact the support server`)
            return message.channel.send({ embeds: [err_emoji] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
          })
        } else {
          let CheckEmoji = parse(emoji, { assetType: "png" });
          if (!CheckEmoji[0])
            return message.channel.error('Misc/copiaremoji:EMOJI_INVALIDO').then(m => m.timedDelete({ timeout: 5000 }));
          message.channel.error('Misc/copiaremoji:EMOJI_PADRÃO').then(m => m.timedDelete({ timeout: 5000 }));
        }
        break;

      case "download":
        emoji = message.args[1];

        if (!emoji) return message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: settings.prefix.concat(message.translate(`Misc/${this.help.name}:EXAMPLE`)) })) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

        if (emoji.startsWith("<") && emoji.endsWith(">")) {
          const id = emoji.match(/\d{15,}/g)[0]

          const type = await fetch(`https://cdn.discordapp.com/emojis/${id}.gif`).then(res => res.json())
            .then(image => {
              if (image) return "gif"
              else return "png"
            }).catch(err => {
              return "png"
            })

          emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
          emojiID = id;
        }

        if (emojiID) {
          const Link = emoji;

          const downEmbed = new Embed(bot, message.guild)
            .setAuthor({ name: message.translate('Misc/baixaremoji:EBEM_DESC'), iconURL: `${Link}` })
            .setColor(16775424)
            .setTimestamp()
            .setThumbnail(Link)
            .addFields({ name: `${message.translate('Misc/baixaremoji:EBEM_DESC1')}`, value: `${message.translate('Misc/baixaremoji:EBEM_DESC2', { Link: Link })}`, inline: false })
            .setFooter({ text: `${message.translate('misc:FOOTER_GLOBALL', { username: message.author.username })} ${message.translate('misc:FOOTER_GLOBAL', { prefix: settings.prefix })}${message.translate(`Misc/${this.help.name}:USAGEE`)}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true })}` })
          //.setImage(Link);
          return message.channel.send({ embeds: [downEmbed] }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
        } else {
          let CheckEmoji = parse(emoji, { assetType: "png" });
          if (!CheckEmoji[0])
            return message.channel.error('Misc/baixaremoji:EMOJI_INVALIDO').then(m => m.timedDelete({ timeout: 5000 }));
          message.channel.error('Misc/baixaremoji:EMOJI_PADRÃO').then(m => m.timedDelete({ timeout: 5000 }));
        }
        break;

      case "list":
        let list = [];
        let emojis = [...message.guild.emojis.cache.values()];

        if (emojis.size === 0) return message.channel.send(message.translate('Guild/emoji:EMOJI')).then(m => m.timedDelete({ timeout: 5000 }));

        emojis = emojis.map((e, i) => `${i + 1}. ${e} \\${e}`);

        for (var i = 0; i < emojis.length; i += 10) {
          const items = emojis.slice(i, i + 10);
          list.push(items.join("\n"));
        }

        const symbols = ["➡️", "⏹", "⬅️"];
        let page = 0;
        const lista = list[page]

        const e = new Embed(bot, message.guild)
          .setDescription(`${lista}`)
          .setAuthor({ name: message.translate('Guild/emoji:EMOJI1', { guild: message.guild.name }), iconURL: message.guild.iconURL({ format: 'png', dynamic: true }) })
          .setFooter({ text: `${message.translate('Guild/emoji:EMOJI2')} ${page + 1} ${message.translate('Guild/emoji:EMOJI3')} ${list.length} (${message.translate('Guild/emoji:EMOJI4')} ${emojis.length} ${message.translate('Guild/emoji:EMOJI5')})` })
          .setColor(1);

        const msg = await message.channel.send({ embeds: [e] });

        symbols.forEach(symbol => msg.react(symbol));
        let doing = true;
        while (doing) {
          let r;
          const filter = (r, u) => symbols.includes(r.emoji.name) && u.id == message.author.id;
          try {
            r = await msg.awaitReactions({ filter: filter, max: 1, time: 20000, errors: ["time"] })
          } catch {
            msg.delete();
            return message.channel.send(message.translate('Guild/emoji:EMOJI6')).then(m => m.timedDelete({ timeout: 5000 }))

          }
          const u = message.author;
          r = r.first();

          if (r.emoji.name == symbols[0]) {
            if (!list[page + 1]) msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => { });
            else {
              page++;
              msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => { });
              const lista = list[page]
              let embed = new Embed(bot, message.guild)
              //message.channel.send(lista)
              msg.edit({ embeds: [e.setDescription(lista).setFooter({ text: `${message.translate('Guild/emoji:EMOJI2')} ${page + 1} ${message.translate('Guild/emoji:EMOJI3')} ${list.length} (${message.translate('Guild/emoji:EMOJI4')} ${emojis.length} ${message.translate('Guild/emoji:EMOJI5')})` })] });
            }
          } else if (r.emoji.name == symbols[2]) {
            if (!list[page - 1]) msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => { });
            else {
              page--;
              msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => { });
              const lista = list[page]
              msg.edit({ embeds: [e.setDescription(lista).setFooter({ text: `${message.translate('Guild/emoji:EMOJI2')} ${page + 1} ${message.translate('Guild/emoji:EMOJI3')} ${list.length} (${message.translate('Guild/emoji:EMOJI4')} ${emojis.length} ${message.translate('Guild/emoji:EMOJI5')})` })] });
              //message.channel.send(lista)
            }
          } else if (r.emoji.name == symbols[1]) {
            //msg.reactions.removeAll();
            msg.delete({ timeout: 500 });
            return;
          }
        }
        break;

      default:
        message.channel.error('misc:INCORRECT_FORMAT', { commandExample: message.translate('misc:AJUDA_INFO', { USAGE: message.translate(`Misc/${this.help.name}:USAGE`, { EXAMPLE: message.translate(`Misc/${this.help.name}:EXAMPLE`, { prefix: settings.prefix }) }) }) }).then(async (m) => { if (settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
        break;
    }
  }
  // EXEC - SLASH
  async callback(bot, interaction, guild, args) {
    const member = interaction.user;
    const channel = guild.channels.cache.get(interaction.channelId);


    try {
      // Get Interaction Message Data
      await interaction.deferReply();
      let emoji;
      let emojiID;

      switch (args.get('option')?.value) {
        case "add":
          emoji = args.get('emoji')?.value;

          if (emoji.startsWith("<") && emoji.endsWith(">")) {
            const id = emoji.match(/\d{15,}/g)[0]

            const type = await fetch(`https://cdn.discordapp.com/emojis/${id}.gif`).then(res => res.json())
              .then(image => {
                if (image) return "gif"
                else return "png"
              }).catch(err => {
                return "png"
              })

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}`;
            emojiID = id;
          }

          if (emojiID) {
            const Link = emoji;
            const name = parseEmoji(args.get('emoji')?.value).name;
            // Create a new emoji from a URL
            guild.emojis.create({ attachment: Link, name: name }).then(emoji => {
              const copyEmbed = new Embed(bot, guild)
                .setAuthor({ name: guild.translate('Misc/copiaremoji:ECOE_DESC'), iconURL: `${bot.user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })}` })
                .setColor(16775424)
                .setTimestamp()
                .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
                .setDescription(`**Emoji:** ${emoji.toString()}\n**Preview:** \`<:${emoji.name}:${emoji.id}>\``);
              return interaction.editReply({ embeds: [copyEmbed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            }).catch(err => {
              const err_emoji = new Embed(bot, guild)
                .setDescription(`There are an error while adding you emoji\n\`\`\`${err}\`\`\`\nPlease try again or contact the support server`)
              return interaction.editReply({ embeds: [err_emoji] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            })
          } else {
            let CheckEmoji = parse(emoji, { assetType: "png" });
            if (!CheckEmoji[0]) return interaction.editReply({ content: ' ', embeds: [channel.error('Misc/copiaremoji:EMOJI_INVALIDO', {}, true)], ephemeral: true });
            return interaction.editReply({ content: ' ', embeds: [channel.error('Misc/copiaremoji:EMOJI_PADRÃO', {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
          }
          break;

        case "remove":
          emoji = args.get('emoji')?.value;

          if (emoji.startsWith("<") && emoji.endsWith(">")) {
            const id = emoji.match(/\d{15,}/g)[0]

            const type = await fetch(`https://cdn.discordapp.com/emojis/${id}.gif`).then(res => res.json())
              .then(image => {
                if (image) return "gif"
                else return "png"
              }).catch(err => {
                return "png"
              })

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}`;
            emojiID = id;
          }

          if (!guild.emojis.fetch(emojiID)) return interaction.editReply({ content: ' ', embeds: [channel.error(`Uh-oh! The emoji used does not belong to this server. I can only remove emojis from this server. Please check and try again!`, {}, true)], ephemeral: false }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });

          if (emojiID) {
            // Create a new emoji from a URL
            guild.emojis.delete(emojiID, 'Emoji deleted using the .emoji remove command').then(emoji => {
              const deleteEmbed = new Embed(bot, guild)
                .setColor(16775424)
                .setTimestamp()
                .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
                .setDescription(`The emoji has been successfully deleted!`);
              return interaction.editReply({ embeds: [deleteEmbed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            }).catch(err => {
              const err_emoji = new Embed(bot, guild)
                .setDescription(`There are an error while adding you emoji\n\`\`\`${err}\`\`\`\nPlease try again or contact the support server`)
              return interaction.editReply({ embeds: [err_emoji] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 15000 }) } });
            })
          } else {
            let CheckEmoji = parse(emoji, { assetType: "png" });
            if (!CheckEmoji[0]) return interaction.editReply({ content: ' ', embeds: [channel.error('Misc/copiaremoji:EMOJI_INVALIDO', {}, true)], ephemeral: true });
            interaction.editReply({ content: ' ', embeds: [channel.error('Misc/copiaremoji:EMOJI_PADRÃO', {}, true)], ephemeral: true });
          }
          break;

        case "download":
          emoji = args.get('emoji')?.value;

          if (emoji.startsWith("<") && emoji.endsWith(">")) {
            const id = emoji.match(/\d{15,}/g)[0]

            const type = await fetch(`https://cdn.discordapp.com/emojis/${id}.gif`).then(res => res.json())
              .then(image => {
                if (image) return "gif"
                else return "png"
              }).catch(err => {
                return "png"
              })

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
            emojiID = id;
          }

          if (emojiID) {
            const Link = emoji;

            const downEmbed = new Embed(bot, guild)
              .setAuthor({ name: guild.translate('Misc/baixaremoji:EBEM_DESC'), iconURL: `${Link}` })
              .setColor(16775424)
              .setTimestamp()
              .setThumbnail(Link)
              .addFields({ name: `${guild.translate('Misc/baixaremoji:EBEM_DESC1')}`, value: `${guild.translate('Misc/baixaremoji:EBEM_DESC2', { Link: Link })}`, inline: false })
              .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
            //.setImage(Link);
            return interaction.editReply({ embeds: [downEmbed] }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 60000 }) } });
          } else {
            let CheckEmoji = parse(emoji, { assetType: "png" });
            if (!CheckEmoji[0]) return interaction.editReply({ content: ' ', embeds: [channel.error('Misc/baixaremoji:EMOJI_INVALIDO', {}, true)], ephemeral: true });
            interaction.editReply({ content: ' ', embeds: [channel.error('Misc/baixaremoji:EMOJI_PADRÃO', {}, true)], ephemeral: true });
          }
          break;

        case "list":
          let list = [];
          let emojis = [...guild.emojis.cache.values()];

          if (emojis.size === 0) return interaction.editReply({ content: guild.translate('Guild/emoji:EMOJI') }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

          emojis = emojis.map((e, i) => `${i + 1}. ${e} \\${e}`);

          for (var i = 0; i < emojis.length; i += 10) {
            const items = emojis.slice(i, i + 10);
            list.push(items.join("\n"));
          }

          const symbols = ["➡️", "⏹", "⬅️"];
          let page = 0;
          const lista = list[page]

          const e = new Embed(bot, guild)
            .setDescription(`${lista}`)
            .setAuthor({ name: guild.translate('Guild/emoji:EMOJI1', { guild: guild.name }), iconURL: guild.iconURL({ extension: 'png', forceStatic: false, size: 1024 }) })
            .setFooter({ text: `${guild.translate('misc:FOOTER_GLOBALL', { username: interaction.user.username })} ${guild.translate('misc:FOOTER_GLOBAL', { prefix: '/' })}${guild.translate(`Animes/${this.help.name}:USAGEE`)}`, iconURL: `${member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 })}` })
            .setColor(1);

          const msg = await interaction.editReply({ embeds: [e] });

          symbols.forEach(symbol => msg.react(symbol));
          let doing = true;
          while (doing) {
            let r;
            const filter = (r, u) => symbols.includes(r.emoji.name) && u.id == member.id;
            try {
              r = await msg.awaitReactions({ filter: filter, max: 1, time: 20000, errors: ["time"] })
            } catch {
              msg.delete();
              return interaction.editReply({ content: guild.translate('Guild/emoji:EMOJI6') }).then(async (m) => { if (guild.settings.ModerationClearReplyToggle === true) { m.timedDelete({ timeout: 10000 }) } });

            }
            const u = member;
            r = r.first();

            if (r.emoji.name == symbols[0]) {
              if (!list[page + 1]) msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => { });
              else {
                page++;
                msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => { });
                const lista = list[page]
                msg.edit({ embeds: [e.setDescription(lista).setFooter({ text: `${guild.translate('Guild/emoji:EMOJI2')} ${page + 1} ${guild.translate('Guild/emoji:EMOJI3')} ${list.length} (${guild.translate('Guild/emoji:EMOJI4')} ${emojis.length} ${guild.translate('Guild/emoji:EMOJI5')})` })] });
              }
            } else if (r.emoji.name == symbols[2]) {
              if (!list[page - 1]) msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => { });
              else {
                page--;
                msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => { });
                const lista = list[page]
                msg.edit({ embeds: [e.setDescription(lista).setFooter({ text: `${guild.translate('Guild/emoji:EMOJI2')} ${page + 1} ${guild.translate('Guild/emoji:EMOJI3')} ${list.length} (${guild.translate('Guild/emoji:EMOJI4')} ${emojis.length} ${guild.translate('Guild/emoji:EMOJI5')})` })] });
              }
            } else if (r.emoji.name == symbols[1]) {
              //msg.reactions.removeAll();
              msg.delete({ timeout: 500 });
              return;
            }
          }
          break;
      }
    } catch (error) {
      bot.logger.error(`Command: '${this.help.name}' has error: ${error.message}.`);
      return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { err: error.message }, true)], ephemeral: true });
    }
  }
};