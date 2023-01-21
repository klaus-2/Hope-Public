const { AutoPoster } = require('topgg-autoposter')

module.exports = async (client) => {

    client.on("ready", () => {
        /** ------------------------------------------------------------------------------------------------
        * ATUALIZA ESTATISTICAS DO BOT NO TOP.GG SEMPRE QUE O BOT É INICIADO
        * ------------------------------------------------------------------------------------------------ */
        const ap = AutoPoster('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkwMTI0MzE3NjgxNDI3NjY4MCIsImJvdCI6dHJ1ZSwiaWF0IjoxNjM2NDg0NjUzfQ.teSZrbT_jLOZ1fJoBHVnUwl_DkSQyD5PKa4p9Jc41fw', client)
        
        ap.on('posted', () => {
          client.logger.api('As estatisticas no Top.gg foram atualizadas com sucesso!')
        })
    })
}