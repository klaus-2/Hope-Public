const { Schema, model } = require('mongoose');

const publicServersSchema = Schema({
    // Toggle
    enabled: { type: Boolean, default: false },
    // Data
    guildID: { type: String, default: null },
    guildName: { type: String, default: null },
    guildMembers: { type: String, default: null },
    guildIcon: { type: String, default: null },
    guildCreated: { type: String, default: null },
    // VANITY URL
    vanityURL: { type: String, default: null },
    vanityRedirect: { type: String, default: null },
    // Settings
    description: { type: String, default: null },
    inviteURL: { type: String, default: null },
    mainServerLanguage: { type: String, default: null },
    languages: { type: Array, default: null },
    categories: { type: Array, default: null },
    tags: { type: Array, default: null },
    youtubeURL: { type: String, default: null },
    twitchURL: { type: String, default: null },
    twitterURL: { type: String, default: null },
    redditURL: { type: String, default: null },
    // Updates
    updates: { type: Array, default: null },
});

module.exports = model('publicServers', publicServersSchema);