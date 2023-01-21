// Dependências
const Canvas = require("canvas"),
    { PermissionsBitField: { Flags } } = require('discord.js'),
    Command = require('../../structures/Command.js');
const { AttachmentBuilder } = require("discord.js");
const canvas = Canvas.createCanvas(540, 547)
const ctx = canvas.getContext("2d");
const { downloadImage } = require("../../utils/getLink");
const { getImageFromCommand, getGenerator } = require("../../utils/getImage");

module.exports = class PlusGen extends Command {
    constructor(bot) {
        super(bot, {
            name: 'plusgen',
            dirname: __dirname,
            description: 'generates a meme for the provided image',
            botPermissions: [Flags.EmbedLinks, Flags.AttachFiles],
            usage: '<prefix><commandName> [option] [user]',
            examples: [
                '.plusgen color',
                '!plusgen delete @Klaus',
            ],
            cooldown: 5000,
        });
    }

    // EXEC - PREFIX
    async run(bot, message, settings) {
        if (settings.ModerationClearToggle && message.deletable) message.delete();

        const lista = [
            "ad",
            "affect",
            "beautiful",
            "bobross",
            "color",
            "confusedstonk",
            "delete",
            "discordblack",
            "discordblue",
            "facepalm",
            "hitler",
            "jail",
            "jokeoverhead",
            "karaba",
            "mms",
            "notstonk",
            "poutine",
            "rainbow",
            "rip",
            "shit",
            "stonk",
            "tatoo",
            "thomas",
            "trash",
            "wanted",
            "wasted",
        ];

        const image = await getImageFromCommand(message, message.args);

        const choice = message.args[0];

        if (lista.includes(choice)) {

            // use invoke as an endpoint
            const url = getGenerator(choice, image);
            const buffer = await downloadImage(url);

            if (!buffer) return message.channel.error('Failed to generate image');

            const attachment = new AttachmentBuilder(buffer, { name: `hope-${choice}.png` });

            message.channel.send({ files: [attachment] });
        } else {
            return;
        }
    }
};