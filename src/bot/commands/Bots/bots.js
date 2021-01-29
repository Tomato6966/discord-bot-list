const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const {web: {domain_with_protocol}} = require("@root/config.json");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: "[User:user]",
            description: "See all Bots of a User / List"
        });
    }

    async run(message, [user]) {
        let person = user ? user : message.author;

        if (person.bot) return;

        let bots = await Bots.find({ $or: [{ "owners.primary": person.id },{ "owners.additional": person.id }], state: { $ne: "deleted" } }, { _id: false });
        let e2 = new MessageEmbed()
            .setTitle(`\`${person.tag}\` has no bots. Add one`)
            .setURL(`${domain_with_protocol}/add/`)
            .setDescription(cont.substr(0, 2000) + "...")
            .setTimestamp()
            .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
            .setColor("RED")
        if (bots.length === 0) return message.channel.send(e2)
        var cont = ``
        var un = false;
        for (let i = 0; i < bots.length; i++) {
            let bot = bots[i];
            if (bot.state == "unverified") {
                un = true
                cont += `> ~~<@${bot.botid}>~~\n\n`
            } else cont += `> <@${bot.botid}>\n\n`
        }
        let e = new MessageEmbed()
            .setTitle(`${person.username}#${person.discriminator}'s bots`)
            .setDescription(cont.substr(0, 2000) + "...")
            .setTimestamp()
            .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
            .setColor("#5081fd")
        if (un) e.setFooter(`Bots with strikethrough are unverified.`)
        message.channel.send(e)
    }

};