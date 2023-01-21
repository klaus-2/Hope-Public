const { Schema, model } = require('mongoose');

const serverStats = Schema({
    _id: String,
    categoryID: { type: String, default: null },
    allMembersID: { type: String, default: null },
    membersID: { type: String, default: null },
    botsID: { type: String, default: null },
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
});

module.exports = model('serverStats', serverStats);