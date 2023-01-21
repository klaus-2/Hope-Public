'use strict'

const { EmbedBuilder } = require("discord.js");

class Antispam {
    constructor() {
        this.authors = [];
        this.messageLog = [];
        this.interval = 3500;
    }

    logAuthor(authorId) {
        return this.authors.push({
            time: Math.floor(Date.now()),
            author: authorId
        });
    }
    logMessage(authorId, message) {
        return this.messageLog.push({
            message,
            author: authorId
        });
    }
    matchMessages(msg) {
        if (msg.author.bot) {
            return;
        };
        let msgMatch = 0;
        this.messageLog.forEach((log) => {
            if (log.message === msg.content && log.author === msg.author.id) {
                msgMatch++;
            }
        });

        return msgMatch;
    }
    checkMessageInterval(msg) {
        if (msg.author.bot) {
            return;
        };
        const now = Date.now();
        const msgsMatched = this.matchMessages(msg);
        let SpamDetected = false;
        if (msgsMatched >= 2) {
            for (let i = 0; i < this.authors.length; i++) {
                if (this.authors[i].time > now - this.interval) {
                    SpamDetected = true;
                }
                else if (this.authors[i].time < now - this.interval) {
                    this.messageLog.splice(this.messageLog.findIndex(message => message.author === this.authors[i].author));
                    this.authors.splice(i);
                }
                if (this.messageLog.length >= 200) {
                    this.messageLog.shift();
                }
            }
        }
        return SpamDetected;
    }
    warnUserEmbed(msg) {
        if (msg.author.bot) {
            return;
        };
        return msg.channel.send(new EmbedBuilder().setColor("RED").setTimestamp().setAuthor({ name: "Spam detected", iconURL: msg.author.displayAvatarURL() }));
    }
}
module.exports = new Antispam();