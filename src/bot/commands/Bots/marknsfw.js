const { Command } = require('klasa');
const Bots = require("@models/bots");
const { MessageEmbed } = require('discord.js');
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["nsfw", "toggle-nsfw", "togglensfw"],
            permissionLevel: 8,
            usage: "[User:user]",
            description: "Mark a Bot as NSFW [ADDING TAG]"
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot** to mark as nsfw.`);
        let bot = await Bots.findOne({botid: user.id});
        await Bots.updateOne({ botid: user.id }, {$set: { nsfw: !bot.nsfw } })
        let e = new MessageEmbed()
        .setTimestamp()
        .setTitle(`👍 \`${user.tag}\` is marked as \`${bot.nsfw ? "not" : ""} NSFW\``)
        .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("#5081fd")
        message.channel.send(e)
    }
};