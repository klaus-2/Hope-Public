// Dependências
const { ButtonBuilder, ButtonStyle } = require("discord.js"),
  { PermissionsBitField: { Flags } } = require('discord.js'),
  Command = require('../../structures/Command.js');

module.exports = class Calculator extends Command {
  constructor(bot) {
    super(bot, {
      name: 'calculator',
      dirname: __dirname,
      aliases: ['calc', 'calculator', 'calculate', 'calculadora'],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Calculate a mathematical equation.',
      usage: '<prefix><commandName>',
      examples: [
        '/calculator',
        '.calculator',
        '!calc',
        '?calculate'
      ],
      cooldown: 3000,
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    if (settings.ModerationClearToggle && message.deletable) message.delete();

    if (!message) throw new TypeError("Calculator Error: Missing argument message");

    function i(length) {
      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
      return result;
    }

    // Button ID generator
    let str = " ";
    let stringify = "```\n" + str + "\n```";
    const calculator_clear = i(20);
    const calculator_e1 = i(20);
    const calculator_e2 = i(20);
    const calculator_uppercase = i(20);
    const calculator_7 = i(20);
    const calculator_8 = i(20);
    const calculator_9 = i(20);
    const calculator_plus = i(20);
    const calculator_minus = i(20);
    const calculator_star = i(20);
    const calculator_devide = i(20);
    const calculator_1 = i(20);
    const calculator_2 = i(20);
    const calculator_3 = i(20);
    const calculator_4 = i(20);
    const calculator_5 = i(20);
    const calculator_0 = i(20);
    const calculator_6 = i(20);
    const calculator_dot = i(20);
    const calculator_equal = i(20);
    const calculator_backspace = i(20);
    const calc_irrc = i(20);
    // let empty_irrc = i(20)
    const calc_percent = i(20);
    const calculator_pi = i(20);
    const calculator_starten = i(20);
    // Buttons
    const ac = new ButtonBuilder().setLabel('AC').setCustomId(calculator_clear).setStyle(ButtonStyle.Danger);
    const e1 = new ButtonBuilder().setLabel('(').setCustomId(calculator_e1).setStyle(ButtonStyle.Primary);
    const e2 = new ButtonBuilder().setLabel(')').setCustomId(calculator_e2).setStyle(ButtonStyle.Primary);
    const uppercase = new ButtonBuilder().setLabel('^').setCustomId(calculator_uppercase).setStyle(ButtonStyle.Primary);
    const seven = new ButtonBuilder().setLabel('7️').setCustomId(calculator_7).setStyle(ButtonStyle.Secondary);
    const eight = new ButtonBuilder().setLabel('8️').setCustomId(calculator_8).setStyle(ButtonStyle.Secondary);
    const nine = new ButtonBuilder().setLabel('9️').setCustomId(calculator_9).setStyle(ButtonStyle.Secondary);
    const slash = new ButtonBuilder().setLabel('÷').setCustomId(calculator_devide).setStyle(ButtonStyle.Primary);
    const four = new ButtonBuilder().setLabel('4️').setCustomId(calculator_4).setStyle(ButtonStyle.Secondary);
    const five = new ButtonBuilder().setLabel('5️').setCustomId(calculator_5).setStyle(ButtonStyle.Secondary);
    const six = new ButtonBuilder().setLabel('6️').setCustomId(calculator_6).setStyle(ButtonStyle.Secondary);
    const star = new ButtonBuilder().setLabel('x').setCustomId(calculator_star).setStyle(ButtonStyle.Primary);
    const one = new ButtonBuilder().setLabel('1️').setCustomId(calculator_1).setStyle(ButtonStyle.Secondary);
    const two = new ButtonBuilder().setLabel('2️').setCustomId(calculator_2).setStyle(ButtonStyle.Secondary);
    const three = new ButtonBuilder().setLabel('3️').setCustomId(calculator_3).setStyle(ButtonStyle.Secondary);
    const minus = new ButtonBuilder().setLabel('-').setCustomId(calculator_minus).setStyle(ButtonStyle.Primary);
    const zero = new ButtonBuilder().setLabel('0️').setCustomId(calculator_0).setStyle(ButtonStyle.Secondary);
    const dot = new ButtonBuilder().setLabel('.').setCustomId(calculator_dot).setStyle(ButtonStyle.Primary);
    const equal = new ButtonBuilder().setLabel('=').setCustomId(calculator_equal).setStyle(ButtonStyle.Success);
    const plus = new ButtonBuilder().setLabel('+').setCustomId(calculator_plus).setStyle(ButtonStyle.Primary);
    const backspace = new ButtonBuilder().setLabel('⌫').setCustomId(calculator_backspace).setStyle(ButtonStyle.Danger);
    const destroy = new ButtonBuilder().setLabel('DC').setCustomId(calc_irrc).setStyle(ButtonStyle.Danger);
    // let empty = new ButtonBuilder().setLabel('\u200b').setCustomId(empty_irrc).setStyle(ButtonStyle.Secondary).setDisabled(true)
    const percent = new ButtonBuilder().setLabel('%').setCustomId(calc_percent).setStyle(ButtonStyle.Primary);
    const pi = new ButtonBuilder()
      .setLabel("π")
      .setCustomId(calculator_pi)
      .setStyle(ButtonStyle.Primary);
    const starten = new ButtonBuilder()
      .setLabel("×10")
      .setCustomId(calculator_starten)
      .setStyle(ButtonStyle.Primary);
    // Lock
    const qac = new ButtonBuilder().setLabel('AC').setCustomId(calculator_clear).setStyle(ButtonStyle.Danger).setDisabled(true);
    const qe1 = new ButtonBuilder().setLabel('(').setCustomId(calculator_e1).setStyle(ButtonStyle.Primary).setDisabled(true);
    const qe2 = new ButtonBuilder().setLabel(')').setCustomId(calculator_e2).setStyle(ButtonStyle.Primary).setDisabled(true);
    const quppercase = new ButtonBuilder().setLabel('^').setCustomId(calculator_uppercase).setStyle(ButtonStyle.Primary).setDisabled(true);
    const qseven = new ButtonBuilder().setLabel('7️').setCustomId(calculator_7).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qeight = new ButtonBuilder().setLabel('8️').setCustomId(calculator_8).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qnine = new ButtonBuilder().setLabel('9️').setCustomId(calculator_9).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qslash = new ButtonBuilder().setLabel('÷').setCustomId(calculator_devide).setStyle(ButtonStyle.Primary).setDisabled(true);
    const qfour = new ButtonBuilder().setLabel('4️').setCustomId(calculator_4).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qfive = new ButtonBuilder().setLabel('5️').setCustomId(calculator_5).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qsix = new ButtonBuilder().setLabel('6️').setCustomId(calculator_6).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qstar = new ButtonBuilder().setLabel('x').setCustomId(calculator_star).setStyle(ButtonStyle.Primary).setDisabled(true);
    const qone = new ButtonBuilder().setLabel('1️').setCustomId(calculator_1).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qtwo = new ButtonBuilder().setLabel('2️').setCustomId(calculator_2).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qthree = new ButtonBuilder().setLabel('3️').setCustomId(calculator_3).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qminus = new ButtonBuilder().setLabel('-').setCustomId(calculator_minus).setStyle(ButtonStyle.Primary).setDisabled(true);
    const qzero = new ButtonBuilder().setLabel('0️').setCustomId(calculator_0).setStyle(ButtonStyle.Secondary).setDisabled(true);
    const qdot = new ButtonBuilder().setLabel('.').setCustomId(calculator_dot).setStyle(ButtonStyle.Primary).setDisabled(true);
    const qequal = new ButtonBuilder().setLabel('=').setCustomId(calculator_equal).setStyle(ButtonStyle.Success).setDisabled(true);
    const qplus = new ButtonBuilder().setLabel('+').setCustomId(calculator_plus).setStyle(ButtonStyle.Primary).setDisabled(true);
    const qbackspace = new ButtonBuilder().setLabel('⌫').setCustomId(calculator_backspace).setStyle(ButtonStyle.Danger).setDisabled(true);
    const qdestroy = new ButtonBuilder().setLabel('DC').setCustomId(calc_irrc).setStyle(ButtonStyle.Danger).setDisabled(true);
    const qpercent = new ButtonBuilder().setLabel('%').setCustomId(calc_percent).setStyle(ButtonStyle.Primary).setDisabled(true);
    const qpi = new ButtonBuilder()
      .setLabel("π")
      .setCustomId(calculator_pi)
      .setStyle(ButtonStyle.Primary).setDisabled(true);
    const qstarten = new ButtonBuilder()
      .setLabel("×10")
      .setCustomId(calculator_starten)
      .setStyle(ButtonStyle.Primary).setDisabled(true);
    // ----------------------------------------------------------------------
    const filter = m => m.user.id === message.author.id;

    message.channel.send({
      content: `${message.translate('Misc/calculator:CALC')}${stringify}`,
      components: [{
        type: 1,
        components: [
          e1, e2, uppercase, percent, ac,
        ],
      },
      {
        type: 1,
        components: [
          seven, eight, nine, slash, destroy,
        ],
      },
      {
        type: 1,
        components: [
          four, five, six, star, backspace,
        ],
      },
      {
        type: 1,
        components: [
          one, two, three, minus, starten,
        ],
      },
      {
        type: 1,
        components: [
          dot, zero, equal, plus, pi,
        ],
      },
      ],
    }).then(async (msg) => {
      async function edit() {
        msg.edit({
          content: `${stringify}`,
          components: [{
            type: 1,
            components: [
              e1, e2, uppercase, percent, ac,
            ],
          },
          {
            type: 1,
            components: [
              seven, eight, nine, slash, destroy,
            ],
          },
          {
            type: 1,
            components: [
              four, five, six, star, backspace,
            ],
          },
          {
            type: 1,
            components: [
              one, two, three, minus, starten,
            ],
          },
          {
            type: 1,
            components: [
              dot, zero, equal, plus, pi,
            ],
          },
          ],
        });
      }
      async function lock() {
        msg.edit({
          content: `${stringify}`,
          components: [{
            type: 1,
            components: [
              qe1, qe2, quppercase, qpercent, qac,
            ],
          },
          {
            type: 1,
            components: [
              qseven, qeight, qnine, qslash, qdestroy,
            ],
          },
          {
            type: 1,
            components: [
              qfour, qfive, qsix, qstar, qbackspace,
            ],
          },
          {
            type: 1,
            components: [
              qone, qtwo, qthree, qminus, qstarten,
            ],
          },
          {
            type: 1,
            components: [
              qdot, qzero, qequal, qplus, qpi,
            ],
          },
          ],
        });
      }
      const calc = msg.createMessageComponentCollector(filter);

      calc.on('collect', async btn => {
        if (btn.user.id !== message.author.id) {
          return;
        }

        btn.deferUpdate();

        switch (btn.customId) {
          case calculator_0:
            str += "0";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_1:
            str += '1';
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_2:
            str += "2";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_3:
            str += "3";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_4:
            str += "4";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_5:
            str += "5";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_6:
            str += "6";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_7:
            str += "7";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_8:
            str += "8";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_9:
            str += "9";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_plus:
            str += "+";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_minus:
            str += "-";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_devide:
            str += "/";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_uppercase:
            str += "^";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_star:
            str += "*";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_dot:
            str += ".";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_clear:
            str = " ";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_e1:
            str += "(";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_e2:
            str += ")";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_pi:
            str += "pi";
            // math += "pi";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_starten:
            str += "*10";
            // math += "*10";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
          case calculator_backspace:
            if (str === " " || str === "" || str === null || str === undefined) {
              return;
            } else {
              str = str.split("");
              str.pop();
              str = str.join("");

              stringify = "```\n" + str + "\n```";
              edit();
              break;
            }
          case calc_percent:
            str += "%";
            stringify = "```\n" + str + "\n```";
            edit();
            break;
        }

        if (btn.customId === calculator_equal) {
          if (str === " " || str === "" || str === null || str === undefined) {
            return;
          } else {
            try {
              str += ' = ' + require('mathjs').evaluate(str);
              stringify = '```fix\n' + str + '\n```';
              edit();
              str = ' ';
              stringify = '```\n' + str + '\n```';
            } catch (e) {
              str = message.translate('Misc/calculator:EQUAÇÃO');
              stringify = '```diff\n' + str + '\n```';
              edit();
              str = ' ';
              stringify = '```diff\n' + str + '\n```';
            }
          }
        } else if (btn.customId === calc_irrc) {
          str = message.translate('Misc/calculator:CALC1');
          stringify = '```diff\n' + str + '\n```';
          edit();
          calc.stop();
          lock();
        }
      });
    });
  }
};