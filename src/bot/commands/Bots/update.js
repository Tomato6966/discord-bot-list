const { Command } = require('klasa');
const Bots = require("@models/bots");
const { MessageEmbed } = require('discord.js');
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            permLevel: 8,
            botPerms: ["SEND_MESSAGES"],
            description: "Update the bots in the server."
        });
    }

    async run(message) {
        let rem = new MessageEmbed()
        .setTimestamp()
        .setAuthor(`Updating bots.`, "https://cdn.discordapp.com/emojis/782190536337129503.gif?v=1")
        .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("#5081fd")
        let m = await message.channel.send(rem);
        try {
            await this.update(message.client);
        } catch (e) { console.error(e) }
        let e = new MessageEmbed()
        .setTimestamp()
        .setTitle(`Updated all bots!`)
        .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("#5081fd")
        m.edit(e);
    }

    async update(client) {
        let bots = await Bots.find({}, { _id: false })
        let updates = []
        for (let bot of bots) {
            let botUser = client.users.cache.get(bot.id);
            if (!botUser) 
                updates.push({updateOne: {filter: {botid: bot.id}, update: { state: "deleted", owners: {primary: bot.owners.primary, additional: []} }}})
            if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
                updates.push({updateOne: {filter: {botid: bot.id}, update: { logo: botUser.displayAvatarURL({format: "png", size: 256})}}});
            if (bot.username !== botUser.username)
                updates.push({updateOne: {filter: {botid: bot.id}, update: { username: botUser.username }}})
        }
        await Bots.bulkWrite(updates)
        return true;
    }
};
