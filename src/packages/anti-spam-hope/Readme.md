The Discord Stop Spam is a very simple module to prevent spam in your Discord server.

**It's very simple to use. A little example :**

```javascript
const Discord = require("discord.js"); // Require the Discord.Js module
const client = new Discord.Client({ disableMentions: "everyone" }); // Create a new Discord Client
const DiscordStopSpam = require("discord-stop-spam"); // Require the module

client.on('messageCreate', async (message) => { // Detected message
  await DiscordStopSpam.logAuthor(message.author.id); // Save message author
  await DiscordStopSpam.logMessage(message.author.id, message.content); // Save message content
  const SpamDetected = await DiscordStopSpam.checkMessageInterval(message); // Check sent messages interval
  if(SpamDetected) { // If SpamDetected
      await DiscordStopSpam.warnUserEmbed(message); // Warn User
  };
});

client.login("Some token"); //Place your bot token here
```


**Image :**

![](https://cdn.discordapp.com/attachments/660482983043792899/722724553339699231/2020-06-17_10h07_33.png)
