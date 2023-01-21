const { Reputação, rrEmbed, RankSchema, GiveawaySchema, WarningSchema, ReactionRoleSchema, AniversariantesSchema, autoCovid, AutoTwitch, AutoAnimes, AniversarioSchema, AutoYoutube, welcome, stickyRole, ticketEmbedSchema, loggingSystem, applicationsDB } = require("../database/models");
const logger = require('../utils/Logger');

const createDB = async (guild) => {
    try {
        const novaEDB = await ticketEmbedSchema.create({
            tembed_sID: guild.id,
        });

        await novaEDB.save().catch(() => {
            // do nothing.
        });

        const NiverConfig = await AniversarioSchema.create({
            _id: guild.id,
        });

        await NiverConfig.save().catch(() => {
            // do nothing.
        });

        const Youtube = await AutoYoutube.create({
            _id: guild.id,
        });

        await Youtube.save().catch(() => {
            // do nothing.
        });

        const Animes = await AutoAnimes.create({
            _id: guild.id,
        });

        await Animes.save().catch(() => {
            // do nothing.
        });

        const Rep = await Reputação.create({
            guildID: guild.id,
        });

        await Rep.save().catch(() => {
            // do nothing.
        });

        const RREMBED = await rrEmbed.create({
            rrembed_sID: guild.id,
        });

        await RREMBED.save().catch(() => {
            // do nothing.
        });

        const WDB = await welcome.create({
            _id: guild.id,
        });

        await WDB.save().catch(() => {
            // do nothing.
        });

        const STDB = await stickyRole.create({
            _id: guild.id,
        });

        await STDB.save().catch(() => {
            // do nothing.
        });

        const Log = await loggingSystem.create({
            _id: guild.id,
        });

        await Log.save().catch(() => {
            // do nothing.
        });

        const App = await applicationsDB.create({
            _id: guild.id,
        });

        await App.save().catch(() => {
            // do nothing.
        });

        /** ------------------------------------------------------------------------------------------------
        * CRIA CONFIG DO SERVIDOR E GERA CACHE
        * ------------------------------------------------------------------------------------------------ */
        await guild.fetchSettings();
    } catch (err) {
        console.log(`Event: guildCreate (DATABASE CREATE) has error: ${err.message}.`);
    }
}

const deleteDB = async (guild) => {
    try {
        const r = await RankSchema.deleteMany({
            guildID: guild.id,
        });
        if (r.deletedCount >= 1) logger.log(`Deleted ${r.deletedCount} ranks.`);
    } catch (err) {
        logger.error(`Failed to delete Ranked data, error: ${err.message}`);
    }

    // Delete giveaways from database
    try {
        const g = await GiveawaySchema.deleteMany({
            guildID: guild.id,
        });
        if (g.deletedCount >= 1) logger.log(`Deleted ${g.deletedCount} giveaways.`);
    } catch (err) {
        logger.error(`Failed to delete Giveaway data, error: ${err.message}`);
    }

    // Delete warnings from database
    try {
        const w = await WarningSchema.deleteMany({
            guildID: guild.id,
        });
        if (w.deletedCount >= 1) logger.log(`Deleted ${w.deletedCount} warnings.`);
    } catch (err) {
        logger.error(`Failed to delete Warning data, error: ${err.message}`);
    }

    // Delete reaction roles from database
    try {
        const rr = await ReactionRoleSchema.deleteMany({
            guildID: guild.id,
        });
        if (rr.deletedCount >= 1) logger.log(`Deleted ${rr.deletedCount} reaction roles.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do Reaction Roles, error: ${err.message}`);
    }

    // Deleta ticket embed da database
    try {
        const tke = await ticketEmbedSchema.deleteMany({
            tembed_sID: guild.id,
        });
        if (tke.deletedCount >= 1) logger.log(`Deletado ${tke.deletedCount} tickets embeds.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do Ticket Embed, error: ${err.message}`);
    }

    // Deleta niverdb
    try {
        const anv = await AniversarioSchema.deleteOne({
            _id: guild.id,
        });
        if (anv.deletedCount >= 1) logger.log(`Deletado ${anv.deletedCount} db de aniversariantes.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do NiverDB, error: ${err.message}`);
    }

    // Deleta niverdb
    try {
        const nvv = await AniversariantesSchema.deleteMany({
            guildID: guild.id,
        });
        if (nvv.deletedCount >= 1) logger.log(`Deletado ${nvv.deletedCount} db de aniversariantes.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do Ticket Embed, error: ${err.message}`);
    }

    // Deleta coviddb
    try {
        const covid = await autoCovid.deleteOne({
            _id: guild.id,
        });
        if (covid.deletedCount >= 1) logger.log(`Deletado ${covid.deletedCount} db do auto covid.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do Ticket Embed, error: ${err.message}`);
    }

    // Deleta db Rep
    try {
        const rep = await Reputação.deleteMany({
            guildID: guild.id,
        });
        if (rep.deletedCount >= 1) logger.log(`Deletado ${rep.deletedCount} db de reputação.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do Ticket Embed, error: ${err.message}`);
    }

    // Deleta db Twitch
    try {
        const twitch = await AutoTwitch.deleteMany({
            guildID: guild.id,
        });
        if (twitch.deletedCount >= 1) logger.log(`Deletado ${twitch.deletedCount} db de Auto-Twitch.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do Auto-Twitch, error: ${err.message}`);
    }

    // Deleta db Youtube
    try {
        const youtube = await AutoYoutube.deleteOne({
            _id: guild.id,
        });
        if (youtube.deletedCount >= 1) logger.log(`Deletado ${youtube.deletedCount} db de Auto-Youtube.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do Auto-Youtube, error: ${err.message}`);
    }

    // Deleta db Animes
    try {
        const animes = await AutoAnimes.deleteOne({
            _id: guild.id,
        });
        if (animes.deletedCount >= 1) logger.log(`Deletado ${animes.deletedCount} db de Auto-Animes.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do Auto-Youtube, error: ${err.message}`);
    }

    // Deleta db Animes
    try {
        const rrembed = await rrEmbed.deleteMany({
            rrembed_sID: guild.id,
        });
        if (rrembed.deletedCount >= 1) logger.log(`Deletado ${rrembed.deletedCount} db de rrembed.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do rrEmbed, error: ${err.message}`);
    }

    // Deleta db Welcome
    try {
        const WDB = await welcome.deleteOne({
            _id: guild.id,
        });
        if (WDB.deletedCount >= 1) logger.log(`Deletado ${WDB.deletedCount} db de welcomeDB.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do welcomeDB, error: ${err.message}`);
    }

    // Deleta db Sticky Role
    try {
        const STR = await stickyRole.deleteOne({
            _id: guild.id,
        });
        if (STR.deletedCount >= 1) logger.log(`Deletado ${STR.deletedCount} db de stickyRole.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do stickyRole, error: ${err.message}`);
    }

    // Deleta db Logging
    try {
        const LOG = await loggingSystem.deleteOne({
            _id: guild.id,
        });
        if (LOG.deletedCount >= 1) logger.log(`Deletado ${LOG.deletedCount} db de loggingSystem.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do loggingSystem, error: ${err.message}`);
    }

    // Deleta db Applications
    try {
        const App = await applicationsDB.deleteOne({
            _id: guild.id,
        });
        if (App.deletedCount >= 1) logger.log(`Deletado ${App.deletedCount} db de applications.`);
    } catch (err) {
        logger.error(`Falha ao deletar dados do applications, error: ${err.message}`);
    }
}

module.exports = {
    createDB,
    deleteDB
}