const { Schema, model } = require('mongoose');

const Economia = Schema({
    _id: String,
    guildID: {type: String, default: null},
    cooldowns: {
        cooldownDiario: {type: Number, default: 0},
        cooldownSemanal: {type:Date, default: null},
        cooldownMensal: {type:Date, default: null},
        cooldownEsmola: {type:Date, default: null},
        cooldownPescar: {type:Date, default: null},
        cooldownRoubar: {type:Date, default: null},
        cooldownTrabalho: {type:Date, default: null},
        cooldownJogos: {
          captcha: {type:Date, default: null},
          flags: {type:Date, default: null},
          hangman: {type:Date, default: null},
          logoquiz: {type:Date, default: null},
          typingquiz: {type:Date, default: null},
        },
    },
    saldo: {
        carteira: {type: Number, default: null},
        banco: {type: Number, default: 0},
    },
    perfil: {
        biografia: {type: String, default: 'No bio written.'},
        planodefundo: {type: String, default: null},
        região: {type: String, default: null},
        genero: {type: String, default: null},
        textura: {type: String, default: null},
        emblema: {type: String, default: null},
        chapeu: {type: String, default: null},
        borda: {type: String, default: null},
        cor: {type: String, default: null},
        aniversario: {type: String, default: null},
        inventario: {type: Array, default: []},
        esmola: {type: Number, default: 0},
        peixes: {type: Number, default: 0},
        roleta: {type: Number, default: 0},
        roubou: {type: Number, default: 0},
        roubado: {type: Number, default: 0},
        trabalhos: {type: Number, default: 0},
        jogos: {
          captcha: {type: Number, default: 0},
          flags: {type: Number, default: 0},
          hangman: {type: Number, default: 0},
          logoquiz: {type: Number, default: 0},
          typingquiz: {type: Number, default: 0},
        },
      },
      economia: {
        streak: {
          alltime: {type: Number, default: 0},
          atual: {type: Number, default: 0},
        },
        shard: {type: Number, default: null}
      },
      rep: {
        dado: {type: Number, default: 0},
        recebido: {type: Number, default: 0},
        timestamp: {type: Number, default: 0}
      },
});

module.exports = model('economia', Economia);