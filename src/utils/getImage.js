const { Message } = require("discord.js");
const { resolveMember } = require("../utils/getGuild");
const API = 'https://image-api.strangebot.xyz';

async function getImageFromCommand(message, args) {
  let url;

  // check for attachments
  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    const attachUrl = attachment.url;
    const attachIsImage = attachUrl.endsWith(".png") || attachUrl.endsWith(".jpg") || attachUrl.endsWith(".jpeg");
    if (attachIsImage) url = attachUrl;
  }

  if (!url && args.length == 0) url = message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 });

  if (!url && args.length != 0) {
    try {
      url = new URL(args[0]).href;
    } catch (ex) {}
  }

  if (!url && message.mentions.users.size > 0) {
    url = message.mentions.users.first().displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 });
  }

  if (!url) {
    let member = await resolveMember(message, args[0]);
    if (member) url = member.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 });
  }

  if (!url) url = message.author.displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 });

  return url;
}


function getGenerator(genName, image) {
  const endpoint = new URL(API + "/generators/" + genName);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}


function getFilter(filter, image) {
  const endpoint = new URL(API + "/filters/" + filter);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}

module.exports = {
  getImageFromCommand,
  getGenerator,
  getFilter,
};