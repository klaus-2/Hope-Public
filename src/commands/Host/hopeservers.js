// Dependências
const { Embed } = require(`../../utils`),
{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class HopeServers extends Command {
	constructor(bot) {
		super(bot, {
			name: 'hopeservers',
      ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ Flags.SendMessages, Flags.EmbedLinks],
			description: 'Displays a list of Hope joined servers.',
			usage: 'Hopeservers',
			cooldown: 5000,
			examples: ['generate 3000years username', 'generate beautiful <attachment>'],
		});
	}
	// EXEC - PREFIX
	async run(bot, message, settings) {
        const guilds = [...bot.guilds.cache.values()];
        const servers = [...message.client.guilds.cache.values()].map(guild => {
          return `\`${guild.id}\` - **${guild.name}** - \`${guild.members.cache.size}\` membros`;
        });

        const generateEmbed = start => {
          const current = guilds.slice(start, start + 10)
        
          const embed = new Embed(bot, message.guild)
            .setTitle(`Lista de Servidores da Hope: ${start + 1}/${start + current.length} de ${guilds.length}`)
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true })})
            .setTimestamp()
            .setColor(message.guild.members.me.displayHexColor);
          current.forEach(g => { 
            const user = bot.users.cache.get(g.ownerId);
            const members = g.members.cache;
            return embed.addField(`\`${g.name}\`\n**ID:** \`${g.id}\`\n**Members:** \`${g.members.cache.size}\`\n**Humans:** \`${members.filter(member => !member.user.bot).size}\`\n**Bots:** \`${members.filter(member => member.user.bot).size}\`\n**Owner:** \`${user.username}\`\n ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, `\u200b`)});
          return embed}
        
        const author = message.author
        
        // enviar msg com os primeiros 10 servidores
        message.channel.send({ embeds: [generateEmbed(0)] }).then(message => {
          // Saia se houver apenas uma página de servidor (sem necessidade de tudo isso)
          if (guilds.length <= 10) return
          // reaja com a seta para a direita (para que o usuário possa clicar nela) (a seta para a esquerda não é necessária porque é o começo)
          message.react('➡️')
          const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === author.id;
          const collector = message.createReactionCollector({ filter: filter, time: 90000 });
        
          let currentIndex = 0
          collector.on('collect', reaction => {
            // Remova as reações existentes
            message.reactions.removeAll().then(async () => {
              // Aumentar / diminuir o índice
              reaction.emoji.name === '⬅️' ? currentIndex -= 10 : currentIndex += 10
              // Edita a mensagem com a nova
              message.edit({ embeds: [generateEmbed(currentIndex)] })
              // reaja com a seta esquerda se não for o começo (o esperado é usado para que a seta direita sempre segue após a esquerda)
              if (currentIndex !== 0) await message.react('⬅️')
              // reaja com a seta direita se não for o fim
              if (currentIndex + 10 < guilds.length) message.react('➡️')
            })
          })
        })
    }
};