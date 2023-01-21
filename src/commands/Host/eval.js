// Dependências
const { Embed } = require(`../../utils`),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  { inspect } = require('util'),
  { fetch } = require('undici'),
  text = require('../../utils/string'),
  Command = require('../../structures/Command.js');

module.exports = class Eval extends Command {
  constructor(bot) {
    super(bot, {
      name: 'eval',
      ownerOnly: true,
      dirname: __dirname,
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Eval a JS code.',
      usage: 'eval <code>',
      cooldown: 0,
      examples: ['eval bot.users.cache.get(`184376969016639488`)'],
      slash: false,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();
    try {

      const code = message.args.join(' ');
      let evaled = eval(code);
      let raw = evaled;
      let promise, output, bin, download, type, color;

      if (evaled instanceof Promise) {
        message.channel.sendTyping();
        promise = await evaled
          .then(res => { return { resolved: true, body: inspect(res, { depth: 0 }) }; })
          .catch(err => { return { rejected: true, body: inspect(err, { depth: 0 }) }; });
      };

      if (typeof evaled !== 'string') {
        evaled = inspect(evaled, { depth: 0 });
      };

      if (promise) {
        output = text.clean(promise.body)
      } else {
        output = text.clean(evaled)
      };

      if (promise?.resolved) {
        color = 'GREEN'
        type = 'Promise (Resolved)'
      } else if (promise?.rejected) {
        color = 'RED'
        type = 'Promise (Rejected)'
      } else {
        color = 'WHITE'
        type = (typeof raw).charAt(0).toUpperCase() + (typeof raw).slice(1)
      };

      const elapsed = Math.abs(Date.now() - message.createdTimestamp);
      const embed = new Embed(bot, message.guild)
        .addFields({ name: '📥 Input', value: `\`\`\`js\n${text.truncate(text.clean(code), 1000)}\`\`\``, inline: false })
        .setFooter({
          text: [
            `Type: ${type}`,
            `Evaluated in ${elapsed}ms.`,
            `command eval`].join('\u2000•\u2000')
        });

      if (output.length > 1000) {
        await fetch(`https://hastebin.com/documents`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: output, }).then(res => res.json()).then(json => bin = 'https://hastebin.com/' + json.key + '.js').catch(() => null)

        if (bot.config.SupportServer.LogServer) {
          await bot.channels.cache.get(bot.config.SupportServer.LogServer)
            .send({ files: [{ attachment: Buffer.from(output), name: 'evaled.txt' }] })
            .then(message => download = message.attachments.first().url)
            .catch(() => null);
        };
      };

      embed.addFields([
        {
          name: '\\📤 Output',
          value: output.length > 1000
            ? `\`\`\`fix\nExceeded 1000 characters\nCharacter Length: ${output.length}\`\`\``
            : `\`\`\`js\n${output}\n\`\`\``
        },
        { name: '\u200b', value: `[\`📄 View\`](${bin}) • [\`📩 Download\`](${download})` }
      ].splice(0, Number(output.length > 1000) + 1))
      return message.channel.send({ embeds: [embed] });
    } catch (err) {

      const stacktrace = text.joinArrayAndLimit(err.stack.split('\n'), 900, '\n');
      const value = [
        '```xl',
        stacktrace.text,
        stacktrace.excess ? `\nand ${stacktrace.excess} lines more!` : '',
        '```'
      ].join('\n');

      const embed1 = new Embed(bot, message.guild)
        .setFooter({
          text: [
            `${err.name}`,
            `Evaluated in ${Math.abs(Date.now() - message.createdTimestamp)}ms.`,
            `Eval | Hope`].join('\u2000•\u2000')
        })
        .addFields([
          { name: '\\📥 Input', value: `\`\`\`js\n${text.truncate(text.clean(message.args.join(' ')), 1000, '\n...')}\`\`\`` },
          { name: '\\📤 Output', value }
        ])
      return message.channel.send({ embeds: [embed1] });
    };
  }
};
