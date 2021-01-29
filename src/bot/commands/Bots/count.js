const { Command } = require('klasa');
const Bots = require("@models/bots");
const { MessageEmbed } = require('discord.js');
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'count',
            runIn: ['text'],
            aliases: ["list", "botcount", "bot-count"],
            permLevel: 0,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Check how many bots there are in the list."
        });
    }

    async run(message) {
        let bots = await Bots.find({}, { _id: false })
        bots = bots.filter(bot => bot.state !== "deleted");
        let e = new MessageEmbed()
        .setTimestamp()
        .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("#5081fd")
        if (bots.length === 1) message.channel.send(e.setTitle(`There is \`1\` Bot in the list.`))
        else message.channel.send(e.setTitle(`There are \`${bots.length}\` Bots in the list.`))
    }
};
