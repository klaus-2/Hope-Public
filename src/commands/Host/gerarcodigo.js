// Dependências
const Command = require('../../structures/Command');
const Premium = require(`../../database/models/GuildPremium`),
{ PermissionsBitField: { Flags } } = require('discord.js');
const Discord = require('discord.js');
const moment = require("moment")
moment.locale('pt-br');
const voucher_codes = require('voucher-code-generator');

module.exports = class GerarCodigo extends Command {
  constructor(bot) {
    super(bot, {
      name: 'gerarcodigo',
      ownerOnly: true,
      dirname: __dirname,
      aliases: ['gc', 'codigo', 'generatecode'],
      userPermissions: [Flags.ManageGuild],
      botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
      description: 'Gerar um codigo para resgate.',
      usage: 'gerarcodigo <mês | ano>',
      cooldown: 3000,
      examples: ['gerarcodigo mês'],
    });
  }

  // EXEC - PREFIX
  async run(bot, message, settings) {
    const client = message.client;

    const plans = [message.translate('Dono/gerarcodigo:NOVO_PREMIUM'), message.translate('Dono/gerarcodigo:NOVO_PREMIUM1')]

    if (!message.args[0]) return message.channel.error(`${message.translate('Dono/gerarcodigo:NOVO_PREMIUM2')}\n${plans.join(" - ")}`)

    if (!plans.includes(message.args[0])) return message.channel.send(`${message.translate('Dono/gerarcodigo:NOVO_PREMIUM2')}\n${plans.join(" - ")}`)

    let expiresAt;


    if (message.args[0] === message.translate('Dono/gerarcodigo:NOVO_PREMIUM')) {

      expiresAt = Date.now() + 2592000000;


    } else if (message.args[0] === message.translate('Dono/gerarcodigo:NOVO_PREMIUM1')) {

      expiresAt = Date.now() + (2592000000 * 12);

    }


    let amount = message.args[1];
    if (!amount) amount = 1

    const array = []
    for (var i = 0; i < amount; i++) {

      const codePremium = voucher_codes.generate({
        pattern: "####-####-####",
      });

      const code = codePremium.toString().toUpperCase();


      const find = await Premium.findOne({
        code: code
      });

      if (!find) {

        Premium.create({
          code: code,
          expiresAt: expiresAt,
          plan: message.args[0]
        });

        array.push(`\`${i + 1}-\` ${code}`)
      }
    }
    const embed = new Discord.MessageEmbed()
      .setColor("#f47fff")
      .setDescription(`**${message.translate('Dono/gerarcodigo:NOVO_PREMIUM3')} ${array.length} ${message.translate('Dono/gerarcodigo:NOVO_PREMIUM4')}**\n\n${array.join("\n")}\n\n**${message.translate('Dono/gerarcodigo:NOVO_PREMIUM5')}** ${message.args[0]}\n**${message.translate('Dono/gerarcodigo:NOVO_PREMIUM6')}** ${moment(expiresAt).format("dddd, Do, MMMM YYYY")}`)
    message.channel.send({ embeds: [embed] })
  }
}

function match(msg, i) {
  if (!msg) return undefined;
  if (!i) return undefined;
  let user = i.members.cache.find(
    m =>
      m.user.username.toLowerCase().startsWith(msg) ||
      m.user.username.toLowerCase() === msg ||
      m.user.username.toLowerCase().includes(msg) ||
      m.displayName.toLowerCase().startsWith(msg) ||
      m.displayName.toLowerCase() === msg ||
      m.displayName.toLowerCase().includes(msg)
  );
  if (!user) return undefined;
  return user.user;
}