const { model, Schema } = require("mongoose");

module.exports = model(
  "bot",
  new Schema({
    name: { type: String, default: "Andoi" },
    commandssincerestart: { type: Number, required: true },
    total: { type: Number, default: 0 },
    channel: String,
    lastMsg: String,
    categoryID: { type: String, default: null },
    guildsID: { type: String, default: null },
    commandsID: { type: String, default: null },
    messagesentID: { type: String, default: null },
    messagereceivedID: { type: String, default: null },
    channelsID: { type: String, default: null },
    pingID: { type: String, default: null },
    uptimeID: { type: String, default: null },
    lavalinkCategoryID: { type: String, default: null },
    node01ID: { type: String, default: null },
    node02ID: { type: String, default: null },
    node03ID: { type: String, default: null },
    userStats: {
        onlineID: { type: String, default: null },
        idleID: { type: String, default: null },
        dndID: { type: String, default: null },
        offlineID: { type: String, default: null },
        allUserStatsID: { type: String, default: null },
    },
    socialStats: {
        youtubeChannel: { type: String, default: null },
        youtubeSubsID: { type: String, default: null },
        youtubeViewsID: { type: String, default: null },
        youtubeVideosID: { type: String, default: null },
        twitchChannel: { type: String, default: null },
        twitchFollowersID: { type: String, default: null },
    },
    customStats: {
        metaID: { type: String, default: null },
        timezoneID: { type: String, default: null },
        roleCountID: { type: String, default: null },
    },
    lastStats: {
        lastJoinTodayID: { type: String, default: null },
        lastLeaveTodayID: { type: String, default: null },
        lastJoin7DaysID: { type: String, default: null },
        lastLeave7DaysID: { type: String, default: null },
    },
  })
);
