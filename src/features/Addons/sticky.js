const { Sticky } = require('../../database/models/index'),
    { Embed } = require('../../utils/index');

module.exports = async (client) => {
    client.on('ready', async () => {
        /** ------------------------------------------------------------------------------------------------
        * SE CONECTA AO BANCO DE DADOS DO ADDON
        * ------------------------------------------------------------------------------------------------ */
        const conditional = {
            enabled: "true",
        }
        const results = await Sticky.find(conditional)

        if (results && results.length) {
            for (const result of results) {
                const guild = client.guilds.cache.get(result.guildId);
                /** ------------------------------------------------------------------------------------------------
                * OBTEM O CANAL, SE ENCONTRADO, ENTÃO ENVIA UMA MENSAGEM PARA ESSE CANAL E O SALVA NO BANCO DE DADOS
                * ------------------------------------------------------------------------------------------------ */
                const stickyChannel = client.channels.cache.get(result.channelID);
                if (stickyChannel) {
                    /** ------------------------------------------------------------------------------------------------
                    * SE JA TIVER UMA MENSAGEM STICKY ENVIADA, ENTÃO A DELETA E A REENVIA E ATUALIZA O ID NO BANCO DE DADOS
                    * ------------------------------------------------------------------------------------------------ */
                    if (result.msgId) {
                        let channelMessage = client.channels.cache.get(result.channelID) // Grab the channel
                        channelMessage.messages.fetch(result.msgId).then(messageFeteched => messageFeteched.delete({ timeout: 5000 })); // Delete the message after 5 seconds
                        const embed = new Embed(client, guild)
                            .setTitle(result.embed.title || `${guild.translate('Features/sticky:STICKY')}`)
                            .setDescription(result.embed.description || `${guild.translate('Features/sticky:STICKY1')}`)
                            .setColor(result.embed.color ?? 9442302)
                            .setFooter({ text: result.embed.footer || `${guild.translate('Features/sticky:STICKY2')}` })
                        const m = await stickyChannel.send({ embeds: [embed] })
                        result.msgId = m.id;
                        await result.save().catch(() => { });
                    }
                    /** ------------------------------------------------------------------------------------------------
                    * SE NÃO HOUVER NENHUMA MENSAGEM STICKY, ENTÃO A ENVIA E SALVA NO BANCO DE DADOS
                    * ------------------------------------------------------------------------------------------------ */
                } else if (result.msgId === null) {
                    const embed = new Embed(client, guild)
                        .setTitle(result.embed.title ?? `${guild.translate('Features/sticky:STICKY')}`)
                        .setDescription(result.embed.description ?? `${guild.translate('Features/sticky:STICKY1')}`)
                        .setColor(result.embed.color ?? 9442302)
                        .setFooter({ text: result.embed.footer ?? `${guild.translate('Features/sticky:STICKY2')}` })
                    const m = await stickyChannel.send({ embeds: [embed] })
                    result.msgId = m.id;
                    await result.save().catch(() => { });
                }
            }
        }
    })

    // Var
    let messageCount = 0;

    client.on('messageCreate', async (message) => {
        if (message.author.bot) {
            return;
        }

        let stickyDB = await Sticky.findOne({ guildId: message.guild.id, enabled: "true" });
        if (stickyDB) {
            const channel = message.guild.channels.cache.get(stickyDB.channelID);
            if (message.channel.id == channel.id) {
                messageCount++;
                // console.log(messageCount)
                if (messageCount == stickyDB.msgCount) {
                    const getMsg = message.channel.messages.cache.get(stickyDB.msgId);
                    if (stickyDB.msgId > 0 && getMsg) getMsg.delete()
                    const embed = new Embed(client, message.guild)
                        .setTitle(stickyDB.embed.title || "__***:pushpin: Sticky message: Read before typing!***__")
                        .setDescription(stickyDB.embed.description || `${message.translate('Features/sticky:STICKY1')}`)
                        .setColor(stickyDB.embed.color ?? 9442302)
                        .setFooter({ text: stickyDB.embed.footer || `${message.translate('Features/sticky:STICKY2')}` })
                    const m = await message.channel.send({ embeds: [embed] })
                    stickyDB.msgId = m.id;
                    await stickyDB.save().catch(() => { });
                    messageCount = 0;
                }
            }
            return;
        }
    })
}