const { Event } = require('klasa');
const Bots = require("@models/bots");
const { server: {id, mod_log_id} } = require("@root/config.json");
const { MessageEmbed } = require('discord.js');
module.exports = class extends Event {
    async run(member) {
        let bots = await Bots.find({"owners.primary": member.user.id , state: { $ne: "deleted" } }, { _id: false });
        for (let bot of bots) {
            await Bots.updateOne({ botid: bot.botid }, { $set: { state: "deleted" } });
            try {
                let bot_member = await this.client.guilds.cache.get(id).members.fetch(bot.botid)
                bot_member.kick()
                let e = new MessageEmbed()
                .setTimestamp()
                .setDescription(`<@${bot.botid}> has been deleted as <@${member.user.id}> (${member.user.tag}) has left.`)
                .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
                .setColor("RED")
                this.channels.cache.get(mod_log_id).send(e);
            } catch(e) {}
        }
    }
};